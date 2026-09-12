"""
AI router — Stock-In entry + Margin Defense, WasteLess suggestions, EOD recap.
All AI agent endpoints live here.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

from app.ai.prompts.eod_recap import run_eod_recap
from app.ai.prompts.margin_defense import MarginDefenseResponse, run_margin_defense
from app.ai.prompts.wasteless import WastelessResponse, run_wasteless
from app.ai.prompts.morning_forecast import MorningBrief, run_morning_forecast
from app.database import db
from app.realtime import ai_connections

router = APIRouter(tags=["ai"])


@router.post("/api/ai/morning-brief", response_model=MorningBrief)
async def morning_brief() -> MorningBrief:
    brief = await run_morning_forecast()
    await ai_connections.broadcast({"event": "MORNING_BRIEF", **brief.model_dump()})
    return brief


# ===========================================================================
# Issue #8 — Manual Stock-In + Margin Defense Agent
# ===========================================================================

class StockInRequest(BaseModel):
    ingredient_name: str
    quantity: float          # kg / L / pcs
    unit: str                # KG | L | PCS
    total_cost_bdt: float


class StockInResponse(BaseModel):
    entry_id: str
    unit_cost_bdt: float
    margin_analysis: MarginDefenseResponse


@router.post("/api/stock-in", response_model=StockInResponse)
async def stock_in(payload: StockInRequest, background_tasks: BackgroundTasks) -> StockInResponse:
    """
    Persist a manual wholesale purchase log, compute unit cost, then trigger
    the Margin Defense Agent in the background and broadcast to POS frontend.
    """
    unit_cost = payload.total_cost_bdt / payload.quantity

    # Upsert ingredient
    ingredient = await db.ingredient.upsert(
        where={"name": payload.ingredient_name},
        data={
            "create": {"name": payload.ingredient_name, "unit": payload.unit},
            "update": {},
        },
    )

    # Persist stock-in log
    log = await db.stockinlog.create(
        data={
            "ingredientId": ingredient.id,
            "quantity": Decimal(str(payload.quantity)),
            "totalCostBdt": Decimal(str(payload.total_cost_bdt)),
            "unitCostBdt": Decimal(str(unit_cost)),
        }
    )

    # Build recipe catalog from dishes table for LLM context
    dishes = await db.dish.find_many()
    recipe_catalog: list[dict[str, Any]] = [
        {"id": d.id, "name": d.name, "price": float(d.price), "stock_count": d.stockCount}
        for d in dishes
    ]

    # Run AI margin analysis (may call Exa + LLM — done in background)
    analysis = await run_margin_defense(
        ingredient_name=payload.ingredient_name,
        unit_cost_bdt=unit_cost,
        quantity=payload.quantity,
        unit=payload.unit,
        recipe_catalog=recipe_catalog,
    )

    # Broadcast margin alert to all connected POS frontends
    background_tasks.add_task(
        ai_connections.broadcast,
        {
            "event": "MARGIN_ALERT",
            "ingredient_name": analysis.ingredient_name,
            "margin_warning": analysis.margin_warning,
            "affected_dishes": [d.model_dump() for d in analysis.affected_dishes],
        },
    )

    return StockInResponse(
        entry_id=log.id,
        unit_cost_bdt=unit_cost,
        margin_analysis=analysis,
    )


@router.get("/api/stock-in/history")
async def stock_in_history(ingredient_name: str | None = None) -> list[dict[str, Any]]:
    """Return the last 30 days of stock-in logs, optionally filtered by ingredient name."""
    where: dict[str, Any] = {}
    if ingredient_name:
        ingredient = await db.ingredient.find_first(where={"name": ingredient_name})
        if ingredient:
            where["ingredientId"] = ingredient.id

    logs = await db.stockinlog.find_many(
        where=where,
        order={"loggedAt": "desc"},
        take=90,
        include={"ingredient": True},
    )
    return [
        {
            "id": log.id,
            "ingredient_name": log.ingredient.name if log.ingredient else "",
            "unit": log.ingredient.unit if log.ingredient else "",
            "quantity": float(log.quantity),
            "total_cost_bdt": float(log.totalCostBdt),
            "unit_cost_bdt": float(log.unitCostBdt),
            "logged_at": log.loggedAt.isoformat(),
        }
        for log in logs
    ]


# ===========================================================================
# Issue #9 — WasteLess Discounting Agent
# ===========================================================================

@router.get("/api/wasteless/suggestions", response_model=WastelessResponse)
async def wasteless_suggestions() -> WastelessResponse:
    """
    Scan all dishes with a shelf life set. Build perishable context, call
    the WasteLess LLM agent, and return discount promotions.
    """
    now = datetime.now(tz=timezone.utc)
    dishes = await db.dish.find_many(where={"shelfLifeHours": {"not": None}})

    perishable_items = []
    for dish in dishes:
        if dish.shelfLifeHours is None or dish.stockCount == 0:
            continue
        # We treat dish.updatedAt as the last prep/restock time
        age_hours = (now - dish.updatedAt.replace(tzinfo=timezone.utc)).total_seconds() / 3600
        remaining = dish.shelfLifeHours - age_hours
        if remaining < 4:  # Only flag items expiring within 4 hours
            perishable_items.append({
                "item_id": dish.id,
                "item_name": dish.name,
                "price_bdt": float(dish.price),
                "stock_count": dish.stockCount,
                "shelf_life_hours": dish.shelfLifeHours,
                "remaining_hours": round(remaining, 1),
            })

    # Estimate rough sales velocity from orders in last 2 hours
    orders_recent = await db.order.count(
        where={"createdAt": {"gte": datetime.now(tz=timezone.utc).replace(hour=max(0, now.hour - 2))}}
    )
    sales_velocity = orders_recent / 2.0

    result = await run_wasteless(
        perishable_items=perishable_items,
        sales_velocity=sales_velocity,
    )

    # Broadcast to POS frontend
    if result.promotions_suggested:
        await ai_connections.broadcast({
            "event": "WASTELESS_ALERT",
            "promotions": [p.model_dump() for p in result.promotions_suggested],
        })

    return result


# ===========================================================================
# Issue #10 — End-of-Day Financial Recap Agent
# ===========================================================================

class EODResponse(BaseModel):
    slip_text: str
    generated_at: str


@router.post("/api/reports/eod", response_model=EODResponse)
async def eod_recap() -> EODResponse:
    """
    Aggregate today's transactions by channel, call the EOD LLM agent,
    return a formatted 48-char ASCII thermal slip string.
    """
    now = datetime.now(tz=timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    orders = await db.order.find_many(
        where={"createdAt": {"gte": today_start}, "status": "COMPLETED"},
        include={"items": True},
    )

    # Aggregate by channel
    channel_totals: dict[str, float] = {"IN_STORE": 0, "FOODPANDA": 0, "PATHAO": 0, "FOODI": 0}
    payment_totals: dict[str, float] = {"CASH": 0, "BANGLA_QR": 0}
    for order in orders:
        channel_totals[order.channel] = channel_totals.get(order.channel, 0) + float(order.grandTotal)
        payment_totals[order.paymentMethod] = payment_totals.get(order.paymentMethod, 0) + float(order.grandTotal)

    kds_count = await db.order.count(where={"createdAt": {"gte": today_start}})

    # Pull today's stock-in logs
    logs = await db.stockinlog.find_many(
        where={"loggedAt": {"gte": today_start}},
        include={"ingredient": True},
    )
    manual_purchases = [
        {
            "ingredient": log.ingredient.name if log.ingredient else "",
            "qty": float(log.quantity),
            "unit_cost": float(log.unitCostBdt),
        }
        for log in logs
    ]

    # Estimate waste prevented — assume WasteLess saved 15% of perishable revenue
    perishable_revenue = channel_totals.get("IN_STORE", 0) * 0.3
    waste_prevented = perishable_revenue * 0.15

    transactions_summary = {
        "channel_totals": channel_totals,
        "payment_totals": payment_totals,
        "grand_total": sum(channel_totals.values()),
    }

    slip_text = await run_eod_recap(
        transactions_summary=transactions_summary,
        kds_total_count=kds_count,
        manual_purchases=manual_purchases,
        waste_prevented_bdt=round(waste_prevented, 2),
    )

    return EODResponse(
        slip_text=slip_text,
        generated_at=now.isoformat(),
    )
