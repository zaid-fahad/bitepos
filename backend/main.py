import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.database import db
from app.ai.prompts.morning_forecast import run_morning_forecast
from app.routers.ai import router as ai_router
from app.routers.dishes import router as dishes_router
from app.routers.payments import router as payments_router
from app.routers.orders import router as orders_router
from app.routers.stock import router as stock_router
from app.realtime import order_connections, payment_connections, stock_connections, ai_connections


async def morning_forecast_scheduler() -> None:
    """Run the morning prep recommendation at 07:30 Asia/Dhaka each day."""
    dhaka = ZoneInfo("Asia/Dhaka")
    while True:
        now = datetime.now(dhaka)
        next_run = now.replace(hour=7, minute=30, second=0, microsecond=0)
        if next_run <= now:
            next_run += timedelta(days=1)
        await asyncio.sleep((next_run - now).total_seconds())
        brief = await run_morning_forecast()
        await ai_connections.broadcast({"event": "MORNING_BRIEF", **brief.model_dump()})


@asynccontextmanager
async def lifespan(_: FastAPI):
    await db.connect()
    scheduler = asyncio.create_task(morning_forecast_scheduler())
    try:
        yield
    finally:
        scheduler.cancel()
        await db.disconnect()


app = FastAPI(title="BiteOS API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dishes_router)
app.include_router(payments_router)
app.include_router(orders_router)
app.include_router(stock_router)
app.include_router(ai_router)


@app.websocket("/ws/payments")
async def payment_events(websocket: WebSocket) -> None:
    await payment_connections.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        payment_connections.disconnect(websocket)


@app.websocket("/ws/orders")
async def order_events(websocket: WebSocket) -> None:
    await order_connections.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        order_connections.disconnect(websocket)


@app.websocket("/ws/stock")
async def stock_events(websocket: WebSocket) -> None:
    await stock_connections.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        stock_connections.disconnect(websocket)


@app.websocket("/ws/ai")
async def ai_events(websocket: WebSocket) -> None:
    await ai_connections.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ai_connections.disconnect(websocket)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Return process health without depending on future database migrations."""
    return {"status": "ok"}
