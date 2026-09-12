import asyncio
from decimal import Decimal

from fastapi import APIRouter, HTTPException

from app.database import db
from app.models.stock import InStoreCheckoutRequest, InStoreCheckoutResponse
from app.realtime import stock_connections
from app.services.aggregators import PLATFORMS, availability, set_availability, sync_dish_availability

router = APIRouter(tags=["stock"])


@router.post("/api/orders/instore", response_model=InStoreCheckoutResponse)
async def instore_checkout(payload: InStoreCheckoutRequest) -> InStoreCheckoutResponse:
    dishes = []
    for item in payload.items:
        dish = await db.dish.find_unique(where={"id": item.dish_id})
        if dish is None or dish.stockCount < item.quantity:
            raise HTTPException(status_code=409, detail="Insufficient stock for this dish.")
        dishes.append((dish, item))

    total = sum((Decimal(str(item.unit_price)) * item.quantity for _, item in dishes), Decimal("0"))
    order = await db.order.create(data={"channel": "IN_STORE", "status": "COMPLETED", "grandTotal": total, "paymentMethod": "CASH", "items": {"create": [{"dishId": dish.id, "quantity": item.quantity, "unitPrice": item.unit_price} for dish, item in dishes]}})
    auto_86: list[str] = []
    for dish, item in dishes:
        updated = await db.dish.update(where={"id": dish.id}, data={"stockCount": {"decrement": item.quantity}})
        if updated.stockCount == 0:
            await sync_dish_availability(updated.id, False)
            auto_86.append(updated.name)
            await stock_connections.broadcast({"event": "ITEM_AUTO86", "dish_id": updated.id, "dish_name": updated.name, "platforms": list(PLATFORMS)})
    return InStoreCheckoutResponse(order_id=order.id, total=float(total), auto_86_dishes=auto_86)


@router.post("/api/mock-aggregators/{platform}/availability")
async def mock_aggregator_availability(platform: str, dish_id: str, is_available: bool) -> dict[str, object]:
    if platform not in PLATFORMS:
        raise HTTPException(status_code=404, detail="Unknown aggregator")
    await set_availability(platform, dish_id, is_available)
    return {"platform": platform, "dish_id": dish_id, "is_available": availability[platform][dish_id]}
