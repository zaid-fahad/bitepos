from pydantic import BaseModel, Field

from app.models.payment import PaymentItem


class InStoreCheckoutRequest(BaseModel):
    items: list[PaymentItem] = Field(min_length=1)


class InStoreCheckoutResponse(BaseModel):
    order_id: str
    total: float
    auto_86_dishes: list[str]
