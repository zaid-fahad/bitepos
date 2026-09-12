from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.database import db
from app.routers.dishes import router as dishes_router
from app.routers.payments import router as payments_router
from app.routers.orders import router as orders_router
from app.routers.stock import router as stock_router
from app.realtime import order_connections, payment_connections, stock_connections


@asynccontextmanager
async def lifespan(_: FastAPI):
    await db.connect()
    try:
        yield
    finally:
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


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Return process health without depending on future database migrations."""
    return {"status": "ok"}
