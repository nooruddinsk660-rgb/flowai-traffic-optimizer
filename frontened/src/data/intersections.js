export const DELHI_INTERSECTIONS = [
  {
    id: "CP_01",
    name: "Connaught Place (Inner Circle)",
    lat: 28.6315,
    lng: 77.2167,
    density: 0.35,
    active_direction: "North-South",
    green_seconds: 45,
    mode: "Adaptive",
    pm25: 110,
    emergency_active: false
  },
  {
    id: "AIIMS_01",
    name: "AIIMS Flyover / Ring Road",
    lat: 28.5672,
    lng: 77.2100,
    density: 0.88,
    active_direction: "East-West",
    green_seconds: 15,
    mode: "AI_Override",
    pm25: 245, 
    emergency_active: true 
  },
  {
    id: "INA_01",
    name: "INA Market Crossing",
    lat: 28.5750,
    lng: 77.2105,
    density: 0.55,
    active_direction: "North",
    green_seconds: 30,
    mode: "Adaptive",
    pm25: 180,
    emergency_active: false
  },
  {
    id: "DL_HK_01",
    name: "Dhaula Kuan Junction",
    lat: 28.5918,
    lng: 77.1615,
    density: 0.72,
    active_direction: "Airport-Bound",
    green_seconds: 40,
    mode: "Adaptive",
    pm25: 195,
    emergency_active: false
  },
  {
    id: "NP_01",
    name: "Nehru Place Crossing",
    lat: 28.5492,
    lng: 77.2509,
    density: 0.65,
    active_direction: "South",
    green_seconds: 35,
    mode: "Adaptive",
    pm25: 210,
    emergency_active: false
  },
  {
    id: "ITO_01",
    name: "ITO Intersection",
    lat: 28.6285,
    lng: 77.2410,
    density: 0.92, // Extremely heavy
    active_direction: "East-West",
    green_seconds: 10,
    mode: "AI_Override",
    pm25: 310, // Severe AQI zone
    emergency_active: false
  },
  {
    id: "SAK_01",
    name: "Saket - Mehrauli Road",
    lat: 28.5244,
    lng: 77.2066,
    density: 0.48,
    active_direction: "West",
    green_seconds: 50,
    mode: "Adaptive",
    pm25: 165,
    emergency_active: false
  },
  {
    id: "ROH_01",
    name: "Rohini West Metro Pillar 402",
    lat: 28.7041,
    lng: 77.1025,
    density: 0.58,
    active_direction: "North-East",
    green_seconds: 28,
    mode: "Adaptive",
    pm25: 140,
    emergency_active: false
  }
];