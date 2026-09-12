from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class KdsOrderItem(BaseModel):
    name: str
    quantity: int


class KdsOrderResponse(BaseModel):
    id: str
    channel: str
    status: str
    customer_name: str
    driver_name: str | None
    driver_eta_minutes: int | None
    grand_total: float
    items: list[KdsOrderItem]


class SimulatedOrderRequest(BaseModel):
    channel: Literal["IN_STORE", "FOODPANDA", "PATHAO", "FOODI"] = "FOODPANDA"
    customer_name: str = "Rafiq Ahmed"
    driver_name: str | None = "Imran (rider)"
    driver_eta_minutes: int | None = Field(default=8, ge=0)


class BumpEvent(BaseModel):
    event: Literal["ORDER_BUMPED"]
    order_id: str
    driver_name: str | None
    channel: str
