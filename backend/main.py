from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import redis.asyncio as redis
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from contextlib import asynccontextmanager
import logging

from config import settings
from database import init_db, run_logging_loop, get_history as db_get_history
from signal_brain import start_all_fsm, safe_redis_get
from aqi_module import fetch_and_cache_aqi
from emergency import activate_corridor, cancel_corridor
import constants

logger = logging.getLogger("SignalBrainAPI")
logger.setLevel(logging.INFO)

redis_client: redis.Redis = None

INTERSECTIONS = [
    {"id": "CP_01"}, {"id": "AIIMS_01"}, {"id": "INA_01"}, {"id": "SAK_01"},
    {"id": "NEHRU_01"}, {"id": "KALK_01"}, {"id": "LODHI_01"}, {"id": "ROHINI_01"}
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client
    redis_client = redis.Redis(host=settings.redis_host, port=settings.redis_port, decode_responses=True)
    
    await init_db()
    asyncio.create_task(run_logging_loop(INTERSECTIONS, redis_client))
    asyncio.create_task(start_all_fsm(INTERSECTIONS, redis_client))
    asyncio.create_task(fetch_and_cache_aqi(redis_client))
    
    from siren_detector import run_audio_detector
    asyncio.create_task(run_audio_detector())
    
    asyncio.create_task(broadcast_loop())
    
    yield
    
    if redis_client:
        await redis_client.close()

app = FastAPI(title="FlowAI Signal Brain API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten to Vercel URL for production deploy later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    # Return a 500 JSON response rather than crashing the server
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "message": str(exc)},
    )

# Models
class SignalState(BaseModel):
    active_direction: str = "UNKNOWN"
    green_seconds: int = 0
    mode: str = "FALLBACK"
    density: float = 0.0
    aqi_penalty: float = 0.0
    is_gridlock: bool = False

class ForecastItem(BaseModel):
    t_plus: int = 0
    density: float = 0.0
    level: str = "UNKNOWN"

class IntersectionState(BaseModel):
    id: str
    name: str = "Unknown"
    active_direction: str = "UNKNOWN"
    green_seconds: int = 0
    mode: str = "FALLBACK"
    density: float = 0.0
    aqi_penalty: float = 0.0
    pm25: float = 0.0
    forecast: List[ForecastItem] = []

class EmergencyRequest(BaseModel):
    route: str
    source: str # e.g. "manual|visual|audio|dual"

import time

# Global cache for WebSocket optimization
ws_cache = {
    "intersections": [],
    "last_updated": 0
}

# Helper to get all intersections state
async def _get_all_intersections_state() -> List[dict]:
    result = []
    for node in INTERSECTIONS:
        i_id = node["id"]
        
        state_str = await safe_redis_get(redis_client, constants.intersection_state_key(i_id))
        signal_str = await safe_redis_get(redis_client, constants.intersection_signal_key(i_id))
        forecast_str = await safe_redis_get(redis_client, constants.forecast_key(i_id))

        state = json.loads(state_str) if state_str else {}
        signal = json.loads(signal_str) if signal_str else {}
        forecast = json.loads(forecast_str) if forecast_str else []

        from aqi_module import INTERSECTION_TO_STATION
        station = INTERSECTION_TO_STATION.get(i_id)
        pm25 = 0.0
        if station:
            pm25_str = await safe_redis_get(redis_client, f"aqi:{station}:pm25")
            if pm25_str:
                pm25 = float(pm25_str)

        # Frontend mock data has names statically. We map ID to name here
        # so frontend doesn't lose 'name' when it replaces state
        NAMES = {
            "CP_01": "Connaught Place (Inner Circle)",
            "AIIMS_01": "AIIMS Flyover / Ring Road",
            "INA_01": "INA Market Crossing",
            "SAK_01": "Saket - Mehrauli Road",
            "NEHRU_01": "Nehru Place Crossing",
            "KALK_01": "Kalkaji Mandir",
            "LODHI_01": "Lodhi Road",
            "ROHINI_01": "Rohini West Metro Pillar 402"
        }
        name = NAMES.get(i_id, i_id)

        # Flatten signal state to fix "field count mismatch"
        active_direction = signal.get("active_direction", "UNKNOWN") if signal else "UNKNOWN"
        green_seconds = signal.get("green_seconds", 0) if signal else 0
        mode = signal.get("mode", "FALLBACK") if signal else "FALLBACK"
        aqi_penalty = signal.get("aqi_penalty", 0.0) if signal else 0.0

        result.append({
            "id": i_id,
            "name": name,
            "active_direction": active_direction,
            "green_seconds": green_seconds,
            "mode": mode,
            "density": state.get("density", 0.0),
            "aqi_penalty": aqi_penalty,
            "pm25": pm25,
            "forecast": forecast
        })
    return result

async def _get_all_intersections_state_cached() -> List[dict]:
    """Caches the output for 1 second to prevent CPU spikes from multiple WebSocket clients."""
    if time.time() - ws_cache["last_updated"] >= 1.0:
        ws_cache["intersections"] = await _get_all_intersections_state()
        ws_cache["last_updated"] = time.time()
    return ws_cache["intersections"]

# 0. GET /
@app.get("/")
async def root():
    return {"message": "FlowAI Signal Brain API is running. Visit /docs for API documentation."}

# 1. GET /intersections
@app.get("/intersections", response_model=List[IntersectionState])
async def get_intersections():
    """Returns array of all 8 intersection objects."""
    result = await _get_all_intersections_state_cached()
    return result

# 2. GET /intersection/{intersection_id}
@app.get("/intersection/{intersection_id}", response_model=IntersectionState)
async def get_intersection(intersection_id: str):
    """Single intersection detail with full state."""
    state_str = await safe_redis_get(redis_client, constants.intersection_state_key(intersection_id))
    signal_str = await safe_redis_get(redis_client, constants.intersection_signal_key(intersection_id))
    forecast_str = await safe_redis_get(redis_client, constants.forecast_key(intersection_id))

    state = json.loads(state_str) if state_str else {}
    signal = json.loads(signal_str) if signal_str else {"mode": "FALLBACK"}
    forecast = json.loads(forecast_str) if forecast_str else []

    from aqi_module import INTERSECTION_TO_STATION
    station = INTERSECTION_TO_STATION.get(intersection_id)
    pm25 = 0.0
    if station:
        pm25_str = await safe_redis_get(redis_client, f"aqi:{station}:pm25")
        if pm25_str:
            pm25 = float(pm25_str)

    NAMES = {
        "CP_01": "Connaught Place (Inner Circle)",
        "AIIMS_01": "AIIMS Flyover / Ring Road",
        "INA_01": "INA Market Crossing",
        "SAK_01": "Saket - Mehrauli Road",
        "NEHRU_01": "Nehru Place Crossing",
        "KALK_01": "Kalkaji Mandir",
        "LODHI_01": "Lodhi Road",
        "ROHINI_01": "Rohini West Metro Pillar 402"
    }
    name = NAMES.get(intersection_id, intersection_id)

    active_direction = signal.get("active_direction", "UNKNOWN") if signal else "UNKNOWN"
    green_seconds = signal.get("green_seconds", 0) if signal else 0
    mode = signal.get("mode", "FALLBACK") if signal else "FALLBACK"
    aqi_penalty = signal.get("aqi_penalty", 0.0) if signal else 0.0

    return {
        "id": intersection_id,
        "name": name,
        "active_direction": active_direction,
        "green_seconds": green_seconds,
        "mode": mode,
        "density": state.get("density", 0.0),
        "aqi_penalty": aqi_penalty,
        "pm25": pm25,
        "forecast": forecast
    }

active_connections: List[WebSocket] = []

async def broadcast(data: dict):
    dead = []
    for ws in active_connections:
        try:
            await ws.send_json(data)
        except Exception:
            dead.append(ws) # mark for removal
    for ws in dead:
        if ws in active_connections:
            active_connections.remove(ws) # clean up after loop

async def broadcast_loop():
    while True:
        try:
            if not active_connections:
                await asyncio.sleep(1)
                continue
            
            intersections = await _get_all_intersections_state_cached()
            emergency_active_str = await safe_redis_get(redis_client, constants.EMERGENCY_KEY)
            emergency_active = json.loads(emergency_active_str) if emergency_active_str else None

            payload = {
                "type": constants.WS_INTERSECTION_UPDATE,
                "intersections": intersections,
                "timestamp": datetime.utcnow().isoformat()
            }
            if emergency_active:
                payload["emergency"] = emergency_active

            await broadcast(payload)
            await asyncio.sleep(1)
        except Exception as e:
            logger.error(f"Broadcast loop error: {e}")
            await asyncio.sleep(1)

# 3. WS /ws
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint pushing state every 1s."""
    await websocket.accept()
    active_connections.append(websocket)
    logger.info(f"WebSocket connected. Total: {len(active_connections)}")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        logger.info("Client disconnected from WebSocket")
    except Exception as e:
        logger.error(f"WS error: {e}")
    finally:
        if websocket in active_connections:
            active_connections.remove(websocket)

from fastapi import HTTPException

# 4. POST /emergency
@app.post("/emergency")
async def trigger_emergency(req: EmergencyRequest):
    """Triggers emergency green corridor."""
    existing = await safe_redis_get(redis_client, constants.EMERGENCY_KEY)
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Emergency already active. Cancel first."
        )
    return await activate_corridor(req.route, req.source, redis_client)

# 5. POST /emergency/cancel
@app.post("/emergency/cancel")
async def cancel_emergency():
    """Cancels active emergency corridor."""
    return await cancel_corridor(redis_client)

# 6. GET /history/{intersection_id}
@app.get("/history/{intersection_id}")
async def get_history(intersection_id: str, hours: int = 6):
    """Returns SQLite vehicle history for time-series charts."""
    return await db_get_history(intersection_id, hours)

# 7. GET /forecast/{intersection_id}
@app.get("/forecast/{intersection_id}")
async def get_forecast(intersection_id: str):
    """Reads Person 4's forecast from Redis and returns it."""
    forecast_str = await safe_redis_get(redis_client, constants.forecast_key(intersection_id))
    return json.loads(forecast_str) if forecast_str else []

# 8. GET /health
@app.get("/health")
async def health_check():
    """System health check."""
    try:
        await redis_client.ping()
        redis_status = "ok"
    except Exception:
        redis_status = "error"
    
    intersections_count = len(INTERSECTIONS)
    
    emergency_active = await safe_redis_get(redis_client, constants.EMERGENCY_KEY)
    
    return {
        "redis": redis_status,
        "intersections": intersections_count,
        "emergency": json.loads(emergency_active) if emergency_active else None
    }
