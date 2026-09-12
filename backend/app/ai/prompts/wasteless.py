"""System Prompt 3 — WasteLess Dynamic Discounting Agent."""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel

from app.ai.provider import get_llm_provider

# ---------------------------------------------------------------------------
# Pydantic response schema
# ---------------------------------------------------------------------------

class DiscountPromotion(BaseModel):
    item_id: str
    item_name: str
    expiring_in_hours: float
    recommended_discount_pct: int
    discounted_price_bdt: float
    pos_action_banner: str


class WastelessResponse(BaseModel):
    promotions_suggested: list[DiscountPromotion]


# ---------------------------------------------------------------------------
# System prompt text
# ---------------------------------------------------------------------------

_SYSTEM = """You are Dokani-AI WasteLess Agent, dedicated to eliminating food waste and maximising revenue on perishable prepped inventory for small restaurants in Bangladesh.

Inputs Provided:
1. Current Time: {current_time}
2. Perishable Inventory: {perishable_items}
3. Afternoon Sales Velocity (orders/hour): {sales_velocity}

Tasks:
- Identify items at risk of spoilage before closing (remaining shelf life < 4 hours).
- Calculate the optimal promotional discount rate (10% to 25%) that clears inventory while staying profit-positive.
- Write a short, compelling pos_action_banner (max 80 chars) for the cashier to tap.

Return ONLY valid JSON matching the schema below. No markdown, no code fences.

Response Schema:
{
  "promotions_suggested": [
    {
      "item_id": "string",
      "item_name": "string",
      "expiring_in_hours": number,
      "recommended_discount_pct": number,
      "discounted_price_bdt": number,
      "pos_action_banner": "string"
    }
  ]
}"""


def _extract_json(text: str) -> Any:
    clean = re.sub(r"```(?:json)?|```", "", text).strip()
    match = re.search(r"\{.*\}", clean, re.DOTALL)
    if match:
        return json.loads(match.group())
    return json.loads(clean)


async def run_wasteless(
    *,
    perishable_items: list[dict[str, Any]],
    sales_velocity: float,
) -> WastelessResponse:
    """Call LLM with perishable inventory context and return validated promotions."""
    if not perishable_items:
        return WastelessResponse(promotions_suggested=[])

    current_time = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    prompt = _SYSTEM.format(
        current_time=current_time,
        perishable_items=json.dumps(perishable_items, ensure_ascii=False),
        sales_velocity=sales_velocity,
    )

    provider = get_llm_provider()
    raw = await provider.complete(
        system=prompt,
        user="Identify near-expiry items and suggest discounts. Return JSON.",
    )

    try:
        data = _extract_json(raw)
        return WastelessResponse(**data)
    except Exception:
        return WastelessResponse(promotions_suggested=[])
