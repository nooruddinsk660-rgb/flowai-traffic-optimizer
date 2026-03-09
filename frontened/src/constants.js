// ── Redis key templates ─────────────────────────────────────────────────
export const intersection_state_key = (iid) => `${iid}:state`;
export const intersection_signal_key = (iid) => `${iid}:signal`;
export const forecast_key = (iid) => `forecast:${iid}:30min`;

export const AUDIO_SIREN_KEY = "audio:siren_confidence";
export const EMERGENCY_KEY = "emergency:active";
export const FORECAST_HEALTH = "forecast:health";

// ── WebSocket event names ──────────────────────────────────────────────
export const WS_INTERSECTION_UPDATE = "INTERSECTION_STATE_UPDATE";
export const WS_EMERGENCY_ACTIVATED = "EMERGENCY_ACTIVATED";
export const WS_AQI_UPDATE = "AQI_UPDATE";

// ── Thresholds ─────────────────────────────────────────────────────────
export const DENSITY_HIGH = 0.70;
export const DENSITY_MEDIUM = 0.40;
export const EMERGENCY_FUSION_THRESH = 0.75;
export const AUDIO_WEIGHT = 0.55;
export const VISUAL_WEIGHT = 0.45;
export const FORECAST_SLOTS = [5, 10, 15, 20, 25, 30]; // 6 slots
