from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # ── Redis ──────────────────────────────────────────────────────
    redis_host:  str   = "localhost"
    redis_port:  int   = 6379
    redis_url:   str   = ""  # Railway injects REDIS_URL — overrides host/port

    # ── Database ───────────────────────────────────────────────────
    db_path:     str   = "flowai.db"

    # ── Thresholds ─────────────────────────────────────────────────
    emergency_threshold:   float = 0.75   # Fused confidence to auto-trigger
    gridlock_threshold:    float = 0.85   # Density to flag GRIDLOCK
    gridlock_cycles:       int   = 3      # Consecutive FSM cycles before flag
    emergency_cooldown_s:  int   = 120    # Seconds before re-triggering allowed

    # ── AQI ────────────────────────────────────────────────────────
    aqi_api_url: str   = "https://api.openaq.org/v2/latest"
    aqi_poll_s:  int   = 300    # Poll every 5 minutes

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
