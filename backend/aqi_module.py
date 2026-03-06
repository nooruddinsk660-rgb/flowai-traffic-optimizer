import asyncio, httpx, logging
from config import settings

log = logging.getLogger("aqi")

# ── WHO PM2.5 breakpoints → signal penalty seconds ────────────────────────
# Source: WHO Air Quality Guidelines (2021)
AQI_PENALTY_MAP = [
    (0,   12,   0),   # Good — no penalty
    (12,  35,   3),   # Moderate — 3s penalty
    (35,  55,   7),   # Unhealthy for sensitive groups — 7s
    (55,  150,  12),  # Unhealthy — 12s penalty
    (150, 250,  17),  # Very unhealthy — 17s penalty
    (250, 999,  20),  # Hazardous — maximum 20s penalty
]

# ── Nearest CPCB station to each intersection (hardcoded proximity map) ───
INTERSECTION_TO_STATION = {
    "CP_01":    "Mandir Marg",
    "AIIMS_01": "R.K. Puram",
    "INA_01":   "R.K. Puram",
    "SAK_01":   "R.K. Puram",
    "NEHRU_01": "Punjabi Bagh",
    "KALK_01":  "Anand Vihar",
    "LODHI_01": "Lodhi Road",
    "ROHINI_01":"Rohini",
}

def pm25_to_penalty(pm25: float) -> float:
    """Convert PM2.5 µg/m³ to green-time penalty seconds."""
    for lo, hi, penalty in AQI_PENALTY_MAP:
        if lo <= pm25 < hi:
            return penalty
    return 20  # Default max for anything above 250

async def get_aqi_penalty(intersection_id: str, r) -> float:
    """Look up cached PM2.5 for nearest station, return penalty seconds."""
    station = INTERSECTION_TO_STATION.get(intersection_id)
    if not station: return 0.0
    pm25_raw = await r.get(f"aqi:{station}:pm25")
    return pm25_to_penalty(float(pm25_raw)) if pm25_raw else 0.0

async def fetch_and_cache_aqi(r):
    """Background task: polls OpenAQ every 5 min, caches to Redis."""
    while True:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    settings.aqi_api_url,
                    params={"city": "Delhi", "parameter": "pm25", "limit": 20}
                )
                if resp.status_code == 200:
                    results = resp.json().get("results", [])
                    for station in results:
                        name  = station.get("location", "")
                        value = station.get("measurements", [{}])[0].get("value", 0)
                        if value > 0:
                            await r.set(f"aqi:{name}:pm25", value, ex=settings.aqi_poll_s * 2)
                    log.info(f"AQI updated: {len(results)} stations")
        except Exception as e:
            log.warning(f"AQI fetch failed: {e} — using cached values")
            # Failure is non-fatal — Redis retains previous values until TTL expires

        await asyncio.sleep(settings.aqi_poll_s)
