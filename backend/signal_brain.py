import asyncio, json, logging
from datetime import datetime
from config import settings

log = logging.getLogger("fsm")

# ── FSM States — direction the FSM is currently servicing ──────────────────
DIRECTIONS = ["north", "east", "south", "west"]

# ── Pre-computed density fallback by hour (when P1 camera offline) ─────────
FALLBACK_DENSITY = {
    0:0.15, 1:0.10, 2:0.08, 3:0.08, 4:0.10, 5:0.20,
    6:0.45, 7:0.70, 8:0.90, 9:0.80, 10:0.55, 11:0.50,
    12:0.60, 13:0.55, 14:0.50, 15:0.55, 16:0.70,
    17:0.90, 18:0.85, 19:0.75, 20:0.60, 21:0.45, 22:0.30, 23:0.20
}

def calculate_green_time(density: float, aqi_penalty: float = 0) -> int:
    """Adaptive signal timing formula — core algorithm of FlowAI.
    
    density=0.0 → 20s (minimum, empty road)
    density=0.5 → 45s (half full)  
    density=1.0 → 60s (maximum before AQI reduction)
    AQI penalty up to 20s subtracted for high-pollution intersections.
    """
    base    = 30 + (density * 30)   # Linear scale: 30–60s
    adjusted = base - aqi_penalty
    return int(max(20, min(90, adjusted)))   # Clamp: 20s minimum, 90s maximum

async def run_fsm_for_intersection(iid: str, r):
    """Main FSM coroutine. Runs forever for one intersection."""
    dir_idx     = 0         # Current direction index (cycles 0→3→0)
    gridlock_ct = 0         # Consecutive high-density cycles counter
    last_emrg   = 0.0       # Timestamp of last emergency activation

    while True:
        try:
            # ── Read current intersection state ───────────────────────
            raw = await r.get(f"{iid}:state")
            if raw:
                state   = json.loads(raw)
                density = float(state.get("density", 0.3))
                emrg_c  = float(state.get("emergency_confidence", 0.0))
            else:
                # P1 camera offline — use time-of-day fallback
                density = FALLBACK_DENSITY.get(datetime.now().hour, 0.3)
                emrg_c  = 0.0
                log.warning(f"{iid} using FALLBACK density={density}")

            # ── AQI penalty ────────────────────────────────────────────
            from aqi_module import get_aqi_penalty
            aqi_pen = await get_aqi_penalty(iid, r)

            # ── Gridlock detection ─────────────────────────────────────
            if density > settings.gridlock_threshold: gridlock_ct += 1
            else:                                      gridlock_ct = 0
            is_gridlock = gridlock_ct >= settings.gridlock_cycles

            # ── Emergency auto-detection (sensor fusion) ───────────────
            from siren_detector import get_fused_emergency_confidence
            fused_c, detected_source = await get_fused_emergency_confidence(iid, r)

            # ── Pre-conditioning Logic (Forecast evaluation) ───────────
            forecast_raw = await r.get(f"forecast:{iid}:30min")
            t_plus_10_density = 0.0
            if forecast_raw:
                forecast_data = json.loads(forecast_raw)
                # Look for t+10 prediction block
                for f in forecast_data:
                    if f.get("t_plus") == 10:
                        t_plus_10_density = f.get("density", 0.0)
                        break

            now = asyncio.get_event_loop().time()
            cooldown_ok = (now - last_emrg) > settings.emergency_cooldown_s
            emrg_active = await r.exists("emergency:active")

            if fused_c > settings.emergency_threshold and cooldown_ok and not emrg_active:
                from emergency import activate_corridor
                asyncio.create_task(activate_corridor("CP_01_AIIMS_01", detected_source, r))
                last_emrg = now
                log.warning(f"🚨 AUTO-EMERGENCY at {iid} source={detected_source} fused={fused_c:.2f}")

            # ── If this intersection is in EMERGENCY mode, skip normal cycle ─
            sig_raw = await r.get(f"{iid}:signal")
            if sig_raw:
                sig = json.loads(sig_raw)
                if sig.get("mode") == "EMERGENCY":
                    await asyncio.sleep(2)   # Check again in 2s
                    continue

            # ── Normal adaptive cycle ──────────────────────────────────
            green_s  = calculate_green_time(density, aqi_pen)

            # Proactive extension: +8s if approaching dense traffic in 10 mins
            if t_plus_10_density > 0.75:
                green_s += 8
                log.info(f"🔮 PROACTIVE EXTENSION at {iid}: +8s applied (t+10 density={t_plus_10_density:.2f})")

            direction = DIRECTIONS[dir_idx % 4]

            signal_payload = {
                "active_direction": direction,
                "green_seconds":    green_s,
                "mode":             "adaptive",
                "density":          round(density, 3),
                "aqi_penalty":      aqi_pen,
                "is_gridlock":      is_gridlock,
                "ts":               datetime.now().isoformat()
            }
            await r.set(f"{iid}:signal", json.dumps(signal_payload), ex=120)

            dir_idx += 1
            await asyncio.sleep(green_s)   # Yield to event loop during green phase

        except Exception as e:
            log.error(f"FSM error at {iid}: {e}")
            await asyncio.sleep(5)     # Brief pause then retry — never crash

async def start_all_fsm(intersections: list, r):
    """Launch one FSM coroutine per intersection. All run concurrently."""
    tasks = [
        asyncio.create_task(run_fsm_for_intersection(node["id"], r))
        for node in intersections
    ]
    log.info(f"Started {len(tasks)} FSM coroutines")
    await asyncio.gather(*tasks)
