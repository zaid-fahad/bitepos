from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.database import db
from app.models.dish import DishResponse

router = APIRouter(prefix="/api/dishes", tags=["dishes"])


class AvailabilityRequest(BaseModel):
    active: bool


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


@router.patch("/{dish_id}/availability", response_model=DishResponse)
async def set_dish_availability(dish_id: str, payload: AvailabilityRequest) -> DishResponse:
    dish = await db.dish.find_unique(where={"id": dish_id})
    if dish is None:
        raise HTTPException(status_code=404, detail="Dish not found")
    updated = await db.dish.update(where={"id": dish_id}, data={"stockCount": max(dish.stockCount, 12) if payload.active else 0})
    return DishResponse(id=updated.id, name=updated.name, category=getattr(updated.category, "value", updated.category), price=float(updated.price), stock_count=updated.stockCount, shelf_life_hours=updated.shelfLifeHours)
