from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class PaymentItem(BaseModel):
    dish_id: str
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(gt=0)


class PaymentSimulationRequest(BaseModel):
    amount: Decimal = Field(gt=0)
    items: list[PaymentItem] = Field(min_length=1)
    method: Literal["bKash", "Nagad", "Cash"] = "bKash"
    reference: str = Field(min_length=1)


class PaymentSimulationResponse(BaseModel):
    reference: str
    status: str
