from fastapi import APIRouter

from app.database import db
from app.models.dish import DishResponse

router = APIRouter(prefix="/api/dishes", tags=["dishes"])


@router.get("", response_model=list[DishResponse])
async def list_dishes() -> list[DishResponse]:
    """Return the active POS menu from the seeded PostgreSQL catalog."""
    dishes = await db.dish.find_many(order={"name": "asc"})

    return [
        DishResponse(
            id=dish.id,
            name=dish.name,
            category=getattr(dish.category, "value", dish.category),
            price=float(dish.price),
            stock_count=dish.stockCount,
            shelf_life_hours=dish.shelfLifeHours,
        )
        for dish in dishes
    ]
