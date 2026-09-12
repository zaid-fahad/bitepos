from decimal import Decimal

from fastapi import APIRouter, HTTPException

from app.database import db
from app.models.order import KdsOrderItem, KdsOrderResponse, SimulatedOrderRequest
from app.realtime import order_connections

router = APIRouter(prefix="/api/orders", tags=["orders"])


def serialize_order(order: object) -> KdsOrderResponse:
    return KdsOrderResponse(
        id=order.id,
        channel=getattr(order.channel, "value", order.channel),
        status=getattr(order.status, "value", order.status),
        customer_name=order.customerName,
        driver_name=order.driverName,
        driver_eta_minutes=order.driverEtaMinutes,
        grand_total=float(order.grandTotal),
        items=[KdsOrderItem(name=item.dish.name, quantity=item.quantity) for item in order.items],
    )


@router.get("/kds", response_model=list[KdsOrderResponse])
async def list_kds_orders() -> list[KdsOrderResponse]:
    orders = await db.order.find_many(
        where={"status": {"in": ["PENDING", "PREPARING"]}},
        include={"items": {"include": {"dish": True}}},
        order={"driverEtaMinutes": "asc"},
    )
    return [serialize_order(order) for order in orders]


@router.post("/simulate", response_model=KdsOrderResponse)
async def simulate_order(payload: SimulatedOrderRequest) -> KdsOrderResponse:
    dishes = await db.dish.find_many(take=2, order={"name": "asc"})
    if not dishes:
        raise HTTPException(status_code=409, detail="Seed dishes before simulating an order.")
    order = await db.order.create(
        data={
            "channel": payload.channel,
            "status": "PENDING",
            "grandTotal": sum(Decimal(str(dish.price)) for dish in dishes),
            "paymentMethod": "CASH",
            "customerName": payload.customer_name,
            "driverName": payload.driver_name if payload.channel != "IN_STORE" else None,
            "driverEtaMinutes": payload.driver_eta_minutes if payload.channel != "IN_STORE" else None,
            "items": {"create": [{"dishId": dish.id, "quantity": 1, "unitPrice": dish.price} for dish in dishes]},
        },
        include={"items": {"include": {"dish": True}}},
    )
    result = serialize_order(order)
    await order_connections.broadcast({"event": "ORDER_CREATED", "order": result.model_dump()})
    return result


@router.patch("/{order_id}/bump", response_model=KdsOrderResponse)
async def bump_order(order_id: str) -> KdsOrderResponse:
    order = await db.order.update(
        where={"id": order_id},
        data={"status": "READY"},
        include={"items": {"include": {"dish": True}}},
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    result = serialize_order(order)
    await order_connections.broadcast({"event": "ORDER_BUMPED", "order_id": order.id, "driver_name": order.driverName, "channel": result.channel})
    return result
