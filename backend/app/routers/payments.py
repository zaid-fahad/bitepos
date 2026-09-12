import asyncio

from fastapi import APIRouter, status

from app.database import db
from app.models.payment import PaymentSimulationRequest, PaymentSimulationResponse
from app.realtime import payment_connections

router = APIRouter(prefix="/api/payments", tags=["payments"])


async def confirm_payment(payment: PaymentSimulationRequest) -> None:
    await asyncio.sleep(3)
    order = await db.order.create(
        data={
            "channel": "IN_STORE",
            "status": "COMPLETED",
            "grandTotal": payment.amount,
            "paymentMethod": "BANGLA_QR",
            "items": {
                "create": [
                    {
                        "dishId": item.dish_id,
                        "quantity": item.quantity,
                        "unitPrice": item.unit_price,
                    }
                    for item in payment.items
                ]
            },
        }
    )
    await payment_connections.broadcast(
        {
            "event": "PAYMENT_CONFIRMED",
            "amount": float(payment.amount),
            "method": payment.method,
            "order_id": order.id,
            "reference": payment.reference,
        }
    )


@router.post("/simulate", response_model=PaymentSimulationResponse, status_code=status.HTTP_202_ACCEPTED)
async def simulate_payment(payment: PaymentSimulationRequest) -> PaymentSimulationResponse:
    asyncio.create_task(confirm_payment(payment))
    return PaymentSimulationResponse(reference=payment.reference, status="processing")
