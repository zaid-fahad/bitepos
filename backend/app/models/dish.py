from pydantic import BaseModel


class DishResponse(BaseModel):
    id: str
    name: str
    category: str
    price: float
    stock_count: int
    shelf_life_hours: int | None
