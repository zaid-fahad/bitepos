"""Deterministic starter data for the BiteOS development database."""

import asyncio
from decimal import Decimal

from prisma import Prisma


DISHES = [
    {
        "name": "Chicken Tehari",
        "category": "LOCAL_MEALS",
        "price": Decimal("220.00"),
        "stockCount": 12,
        "shelfLifeHours": 6,
    },
    {
        "name": "Beef Kacchi",
        "category": "LOCAL_MEALS",
        "price": Decimal("320.00"),
        "stockCount": 8,
        "shelfLifeHours": 6,
    },
    {
        "name": "Paratha",
        "category": "LOCAL_MEALS",
        "price": Decimal("30.00"),
        "stockCount": 30,
        "shelfLifeHours": 4,
    },
    {
        "name": "Pastry",
        "category": "BAKERY",
        "price": Decimal("90.00"),
        "stockCount": 10,
        "shelfLifeHours": 24,
    },
    {"name": "Classic Beef Burger", "category": "FAST_FOOD", "price": Decimal("280.00"), "stockCount": 18, "shelfLifeHours": 5},
    {"name": "Crispy Fried Chicken", "category": "FAST_FOOD", "price": Decimal("240.00"), "stockCount": 20, "shelfLifeHours": 4},
    {"name": "Lemon Mint Cooler", "category": "DRINKS", "price": Decimal("80.00"), "stockCount": 24, "shelfLifeHours": 8},
    {"name": "Mango Lassi", "category": "DRINKS", "price": Decimal("110.00"), "stockCount": 16, "shelfLifeHours": 6},
]

INGREDIENTS = [
    {"name": "Broiler Chicken", "unit": "KG"},
    {"name": "Basmati Rice", "unit": "KG"},
    {"name": "Cooking Oil", "unit": "L"},
]


async def seed() -> None:
    db = Prisma()
    await db.connect()

    try:
        for dish in DISHES:
            await db.dish.upsert(
                where={"name": dish["name"]},
                data={"create": dish, "update": dish},
            )

        for ingredient in INGREDIENTS:
            await db.ingredient.upsert(
                where={"name": ingredient["name"]},
                data={"create": ingredient, "update": ingredient},
            )
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(seed())
