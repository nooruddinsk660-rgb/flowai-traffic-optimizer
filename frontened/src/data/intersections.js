// ── DELHI_INTERSECTIONS — Single source of truth for static node data ────────
// CRITICAL: IDs here MUST match backend INTERSECTIONS list in main.py exactly.
// lat/lng are static — backend WS does NOT send coordinates, so frontend merges them.

export const DELHI_INTERSECTIONS = [
  {
    id: "CP_01",
    name: "Connaught Place",
    lat: 28.6315,
    lng: 77.2167,
    density: 0.65,
    active_direction: "north",
    green_seconds: 45,
    mode: "Adaptive",
    pm25: 110,
    aqi_penalty: 0,
    emergency_active: false,
    count: 52,
    forecast: []
  },
  {
    id: "AIIMS_01",
    name: "AIIMS Flyover / Ring Road",
    lat: 28.5672,
    lng: 77.2100,
    density: 0.45,
    active_direction: "south",
    green_seconds: 40,
    mode: "Adaptive",
    pm25: 155,
    aqi_penalty: 0,
    emergency_active: false,
    count: 36,
    forecast: []
  },
  {
    id: "INA_01",
    name: "INA Market Crossing",
    lat: 28.5754,
    lng: 77.2090,
    density: 0.55,
    active_direction: "north",
    green_seconds: 48,
    mode: "Adaptive",
    pm25: 180,
    aqi_penalty: 0,
    emergency_active: false,
    count: 44,
    forecast: []
  },
  {
    id: "SAK_01",
    name: "Saket – Mehrauli Road",
    lat: 28.5244,
    lng: 77.2066,
    density: 0.40,
    active_direction: "west",
    green_seconds: 42,
    mode: "Adaptive",
    pm25: 165,
    aqi_penalty: 0,
    emergency_active: false,
    count: 32,
    forecast: []
  },
  {
    // BUG FIX: was "NP_01" — must match backend id "NEHRU_01"
    id: "NEHRU_01",
    name: "Nehru Place Crossing",
    lat: 28.5492,
    lng: 77.2509,
    density: 0.65,
    active_direction: "south",
    green_seconds: 50,
    mode: "Adaptive",
    pm25: 210,
    aqi_penalty: 0,
    emergency_active: false,
    count: 52,
    forecast: []
  },
  {
    // BUG FIX: was "ITO_01" — must match backend id "KALK_01"
    id: "KALK_01",
    name: "Kalkaji Mandir",
    lat: 28.5357,
    lng: 77.2565,
    density: 0.50,
    active_direction: "east",
    green_seconds: 45,
    mode: "Adaptive",
    pm25: 195,
    aqi_penalty: 0,
    emergency_active: false,
    count: 40,
    forecast: []
  },
  {
    // BUG FIX: was "DL_HK_01" (Dhaula Kuan) — must match backend id "LODHI_01"
    id: "LODHI_01",
    name: "Lodhi Road",
    lat: 28.5908,
    lng: 77.2266,
    density: 0.42,
    active_direction: "north",
    green_seconds: 43,
    mode: "Adaptive",
    pm25: 148,
    aqi_penalty: 0,
    emergency_active: false,
    count: 34,
    forecast: []
  },
  {
    // BUG FIX: was "ROH_01" — must match backend id "ROHINI_01"
    id: "ROHINI_01",
    name: "Rohini West Metro",
    lat: 28.7041,
    lng: 77.1025,
    density: 0.58,
    active_direction: "north",
    green_seconds: 47,
    mode: "Adaptive",
    pm25: 140,
    aqi_penalty: 0,
    emergency_active: false,
    count: 46,
    forecast: []
  }
];

// Quick lookup map: id → static node (used for lat/lng merge in App.jsx)
export const INTERSECTION_STATIC = Object.fromEntries(
  DELHI_INTERSECTIONS.map(n => [n.id, n])
);