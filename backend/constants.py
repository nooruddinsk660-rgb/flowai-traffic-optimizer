# ── Redis key templates ─────────────────────────────────────────────────
def intersection_state_key(iid: str) -> str: return f"{iid}:state"
def intersection_signal_key(iid: str) -> str: return f"{iid}:signal"
def forecast_key(iid: str) -> str: return f"forecast:{iid}:30min"

AUDIO_SIREN_KEY    = "audio:siren_confidence"
EMERGENCY_KEY      = "emergency:active"
FORECAST_HEALTH    = "forecast:health"

# ── WebSocket event names ──────────────────────────────────────────────
WS_INTERSECTION_UPDATE  = "INTERSECTION_STATE_UPDATE"
WS_EMERGENCY_ACTIVATED  = "EMERGENCY_ACTIVATED"
WS_AQI_UPDATE           = "AQI_UPDATE"

# ── Thresholds ─────────────────────────────────────────────────────────
DENSITY_HIGH           = 0.70
DENSITY_MEDIUM         = 0.40
EMERGENCY_FUSION_THRESH = 0.75
AUDIO_WEIGHT           = 0.55
VISUAL_WEIGHT          = 0.45
FORECAST_SLOTS         = [5, 10, 15, 20, 25, 30]   # 6 slots
