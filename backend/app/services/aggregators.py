import asyncio

PLATFORMS = ("Foodpanda", "Pathao", "Foodi")
availability: dict[str, dict[str, bool]] = {platform: {} for platform in PLATFORMS}


async def set_availability(platform: str, dish_id: str, is_available: bool) -> None:
    await asyncio.sleep(0.05)
    availability[platform][dish_id] = is_available


async def sync_dish_availability(dish_id: str, is_available: bool) -> None:
    await asyncio.gather(*(set_availability(platform, dish_id, is_available) for platform in PLATFORMS))
