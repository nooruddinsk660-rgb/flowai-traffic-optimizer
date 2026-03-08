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

# ── Station Coordinates for Open-Meteo Air Quality API ─────────────────────
STATION_COORDS = {
    "Mandir Marg":  (28.6366, 77.1995),
    "R.K. Puram":   (28.5648, 77.1852),
    "Punjabi Bagh": (28.6740, 77.1310),
    "Anand Vihar":  (28.6475, 77.3158),
    "Lodhi Road":   (28.5888, 77.2223),
    "Rohini":       (28.7366, 77.1130)
}

async def fetch_and_cache_aqi(r):
    """Background task: fetches real-world PM2.5 AQI via Open-Meteo."""
    
    url = "https://air-quality-api.open-meteo.com/v1/air-quality"

    while True:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                for station, (lat, lon) in STATION_COORDS.items():
                    resp = await client.get(
                        url,
                        params={
                            "latitude": lat,
                            "longitude": lon,
                            "current": "pm2_5",
                            "timezone": "auto"
                        }
                    )
                    
                    if resp.status_code == 200:
                        data = resp.json()
                        val = data.get("current", {}).get("pm2_5", 0)
                        
                        if val > 0:
                            # Cache in redis with TTL 2x the polling rate just in case
                            await r.set(f"aqi:{station}:pm25", val, ex=settings.aqi_poll_s * 2)

                log.info(f"AQI live data updated via Open-Meteo: {len(STATION_COORDS)} stations")

        except Exception as e:
            log.warning(f"AQI real-world fetch failed: {e}")

        await asyncio.sleep(settings.aqi_poll_s)
