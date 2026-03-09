import asyncio, json, logging
from datetime import datetime

try:
    from routing import AMBULANCE_ROUTES   # Person 4's deliverable
except ImportError:
    # Fallback if Person 4's routing.py isn't ready yet
    AMBULANCE_ROUTES = {
        "CP_01_AIIMS_01": [
            {"id": "CP_01",    "direction": "south", "travel_s": 240},
            {"id": "INA_01",   "direction": "south", "travel_s": 120},
            {"id": "AIIMS_01", "direction": "arrived", "travel_s": 0},
        ]
    }

log = logging.getLogger("emergency")

from signal_brain import safe_redis_get, safe_redis_set
import constants

async def set_emergency_after(iid: str, direction: str, delay_s: int, ttl: int, r):
    """Sets a single intersection to EMERGENCY mode after a delay."""
    await asyncio.sleep(delay_s)
    payload = {
        "active_direction": direction,
        "green_seconds":    90,   # Max green — ambulance gets full phase
        "mode":             "EMERGENCY",
        "density":          1.0,
        "aqi_penalty":      0,    # Ignore AQI during emergencies
        "ts":               datetime.now().isoformat()
    }
    await safe_redis_set(r, constants.intersection_signal_key(iid), json.dumps(payload), ex=ttl)
    log.warning(f"🟢 EMERGENCY GREEN at {iid} direction={direction}")

async def activate_corridor(route_key: str, source: str, r) -> dict:
    """Activates full green corridor. Returns corridor details."""
    route = AMBULANCE_ROUTES.get(route_key)
    if not route:
        return {"error": f"Unknown route: {route_key}"}

    # Calculate total duration first for TTL
    total_eta = sum(leg.get("travel_s", 60) for leg in route)

    # Calculate cumulative delays for each leg
    cumulative_delay = 0
    corridor_ids = []
    
    for leg in route:
        # TTL = total corridor duration + 60s buffer
        ttl = total_eta + 60
        
        asyncio.create_task(set_emergency_after(
            leg["id"], leg["direction"], cumulative_delay, ttl, r
        ))
        
        corridor_ids.append(leg["id"])
        cumulative_delay += leg.get("travel_s", 60)

    # Write emergency:active — WebSocket includes this in every push
    active_payload = {
        "route":         route_key,
        "corridor":      corridor_ids,
        "eta":           total_eta,
        "source":        source,
        "activated_at":  datetime.now().isoformat()
    }
    await safe_redis_set(r, constants.EMERGENCY_KEY, json.dumps(active_payload), ex=total_eta + 60)
    log.warning(f"🚨 CORRIDOR ACTIVATED: {route_key} source={source} eta={total_eta}s")
    return active_payload

async def cancel_corridor(r) -> dict:
    """Cancels active emergency, returns all intersections to adaptive mode."""
    active = await safe_redis_get(r, constants.EMERGENCY_KEY)
    if not active:
        return {"status": "no active corridor"}

    corridor = json.loads(active).get("corridor", [])
    for iid in corridor:
        try:
            await r.delete(constants.intersection_signal_key(iid))  # Delete forces FSM to recalculate on next cycle
        except Exception as e:
            log.error(f"Redis delete fail [{constants.intersection_signal_key(iid)}]: {e}")

    try:
        await r.delete(constants.EMERGENCY_KEY)
    except Exception as e:
        log.error(f"Redis delete fail [{constants.EMERGENCY_KEY}]: {e}")
    log.info("✅ Emergency corridor cancelled")
    return {"status": "cancelled", "intersections_reset": corridor}
