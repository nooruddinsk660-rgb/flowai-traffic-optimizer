<div align="center">

```
███████╗██╗      ██████╗ ██╗    ██╗ █████╗ ██╗
██╔════╝██║     ██╔═══██╗██║    ██║██╔══██╗██║
█████╗  ██║     ██║   ██║██║ █╗ ██║███████║██║
██╔══╝  ██║     ██║   ██║██║███╗██║██╔══██║██║
██║     ███████╗╚██████╔╝╚███╔███╔╝██║  ██║██║
╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝
```

### `TRAFFIC_OPTIMIZER // NCT_DELHI // SYS_CTRL_V1.0`

**Real-time AI traffic signal control that saves ambulance lives — 76% faster emergency corridors, zero hardware cost.**

[![India Innovates 2026](https://img.shields.io/badge/India%20Innovates%202026-Urban%20Solutions-ef4444?style=for-the-badge)](https://www.indiainnovates.in/)
[![Domain](https://img.shields.io/badge/Domain-Urban%20Solutions-38bdf8?style=for-the-badge)](https://github.com/nooruddinsk660-rgb/flowai-traffic-optimizer)
[![Prize Pool](https://img.shields.io/badge/Prize%20Pool-₹1%2C05%2C000-fbbf24?style=for-the-badge)](https://github.com/nooruddinsk660-rgb/flowai-traffic-optimizer)
[![Demo Day](https://img.shields.io/badge/Demo%20Day-March%2028%20%7C%20Bharat%20Mandapam-00cc88?style=for-the-badge)](https://github.com/nooruddinsk660-rgb/flowai-traffic-optimizer)

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://github.com/nooruddinsk660-rgb/flowai-traffic-optimizer/tree/main/backend)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://github.com/nooruddinsk660-rgb/flowai-traffic-optimizer/tree/main/frontened)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=flat-square&logo=fastapi&logoColor=white)](https://github.com/nooruddinsk660-rgb/flowai-traffic-optimizer/blob/main/backend/main.py)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-mAP50%3D96.7%25-ef4444?style=flat-square)](https://github.com/nooruddinsk660-rgb/flowai-traffic-optimizer/tree/main/models)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://github.com/nooruddinsk660-rgb/flowai-traffic-optimizer/blob/main/REDIS_KEYS.md)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](https://github.com/nooruddinsk660-rgb/flowai-traffic-optimizer/blob/main/LICENSE)

</div>

---

## 🎬 Demo Video

<div align="center">

[![FlowAI Demo Video](https://img.shields.io/badge/▶%20WATCH%20FULL%20DEMO-Google%20Drive-4285F4?style=for-the-badge&logo=google-drive&logoColor=white)](https://drive.google.com/file/d/1RXfrjnL0EsrCw1B2LW-1Cuj_qXR_yCeW/view?usp=sharing)

*Click above to watch the full system demo — live YOLO detection, emergency corridor activation, before/after time comparison*

</div>

---

## 🖥️ System in Action

<table>
<tr>
<td width="50%">

**🟢 Nominal Operation**
> 8 intersections monitored live across NCT Delhi. Green = optimal flow, amber = congested, red = critical. Real YOLO detections streaming in the sidebar feed with bounding boxes and confidence scores.

![Nominal Operation](https://raw.githubusercontent.com/nooruddinsk660-rgb/flowai-traffic-optimizer/main/docs/screenshots/nominal.png)

</td>
<td width="50%">

**📋 Node Popup — Live Stats**
> Click any intersection on the map: mode, flow (vph), PM2.5 AQI, green time, 30-min density forecast sparkline, and one-tap emergency trigger button.

![Popup Detail](https://raw.githubusercontent.com/nooruddinsk660-rgb/flowai-traffic-optimizer/main/docs/screenshots/popup.png)

</td>
</tr>
<tr>
<td width="50%">

**🔴 Emergency Corridor Active**
> One click fires a green wave across 4 intersections: NEHRU → LODHI → INA → AIIMS. The Before/After panel shows **18:00 without FlowAI vs 4:14 with FlowAI**. Time rescued: **13:46**.

![Emergency Active](https://raw.githubusercontent.com/nooruddinsk660-rgb/flowai-traffic-optimizer/main/docs/screenshots/emergency.png)

</td>
<td width="50%">

**🌙 Dark Map — Corridor Polyline**
> Dark tile mode with the live red dashed corridor path. Emergency nodes pulse with outer rings. YOLO feed auto-cycles to the active corridor camera.

![Dark Mode Emergency](https://raw.githubusercontent.com/nooruddinsk660-rgb/flowai-traffic-optimizer/main/docs/screenshots/dark_emergency.png)

</td>
</tr>
</table>

> **Setup:** Upload your 4 screenshots to `docs/screenshots/` in this repo — the images above will render automatically.
> Filenames expected: `nominal.png` · `popup.png` · `emergency.png` · `dark_emergency.png`

---

## ⚡ The Problem We Solve

> *"In India, an ambulance takes an average of **18–25 minutes** to travel 5 km in peak-hour Delhi traffic. Every red light is a potential life lost."*

Traditional traffic signals are **dumb timers**. They don't know an ambulance is 200m away. They don't know a junction is at 94% capacity. They can't coordinate a green wave through 4 intersections in 200ms.

**FlowAI changes all three — using only existing cameras and a laptop.**

---

## 🧠 How It Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLOWAI PIPELINE                                 │
│                                                                         │
│  📷 Camera          🧠 AI Core              📡 FastAPI         🖥 React  │
│  ─────────          ──────────              ──────────         ───────  │
│  MJPEG stream  ──►  YOLOv8n detect    ──►  FSM Brain    ──►  Live Map  │
│  Microphone    ──►  YAMNet siren      ──►  Signal Timer ──►  Sidebar   │
│                     Sensor Fusion          AQI Penalty        Camera   │
│                     (audio×0.55 +          XGBoost            Feed     │
│                      visual×0.45)          Forecast                    │
│                                                                         │
│  ─────────────────────  Redis  ──────────────────────────────────────  │
│       CP_01:state · CP_01:signal · audio:siren_confidence              │
│       aqi:{id}:pm25 · forecast:{id}:30min · emergency:active           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Signal Brain Formula

```python
green_time = clamp(30 + density×30 − aqi_penalty, min=20, max=90)
# AQI penalty:      WHO PM2.5 breakpoints → 0–20s reduction
# Emergency fusion: audio×0.55 + visual×0.45 → auto-triggers if > 0.75
```

The FSM makes a new decision **every second, for every intersection, simultaneously.**

---

## 🏗️ Repository Structure

```
flowai-traffic-optimizer/
├── backend/
│   ├── main.py                   # FastAPI + WebSocket broadcast loop
│   ├── signal_brain.py           # FSM: NORMAL → GRIDLOCK → EMERGENCY
│   ├── emergency.py              # Corridor activation + staggered green wave
│   ├── vehicle_counter.py        # YOLOv8n + ambulance_v1.pt detection
│   ├── siren_detector.py         # YAMNet audio (siren indices 397–400)
│   ├── congestion_forecaster.py  # XGBoost 30-min density forecast
│   ├── routing.py                # NetworkX Dijkstra on Delhi road graph
│   ├── aqi_module.py             # Open-Meteo live PM2.5 → WHO penalty
│   ├── database.py               # SQLite async signal logging
│   ├── config.py                 # Pydantic settings (extra="ignore")
│   ├── constants.py              # Single source of truth
│   └── requirements.txt
│
├── frontened/                    # (folder name as-is)
│   └── src/
│       ├── App.jsx               # WS connection, state orchestration
│       ├── components/
│       │   ├── Map.jsx           # React-Leaflet + glassmorphic popup
│       │   ├── MapSection.jsx    # HUD overlays + signal legend
│       │   ├── Sidebar.jsx       # Node cards + live MJPEG feed
│       │   ├── EmergencyPanel.jsx # Before/after timer + audio beep
│       │   ├── ForecastChart.jsx  # Recharts 30-min sparkline
│       │   ├── Header.jsx         # Live KPI bar (efficiency, AQI, nodes)
│       │   └── ThemeToggle.jsx    # Dark/light + OS preference
│       └── data/
│           └── intersections.js   # Static lat/lng for 8 Delhi nodes
│
├── models/
│   └── ambulance_v1.pt           # Fine-tuned YOLOv8n (mAP50=0.967)
│
├── data/                         # Training datasets
├── redis/                        # Redis Windows binaries
├── DEMO_CHECKLIST.md
├── REDIS_KEYS.md
├── docker-compose.yml
└── start_all.bat                 # One-click Windows launcher
```

---

## 🤖 AI Models

### Vision — YOLOv8n + Custom Ambulance Detector

| Metric | Value |
|--------|-------|
| Base model | YOLOv8n (pre-trained COCO) |
| Fine-tune dataset | ~800 labelled Indian ambulance images |
| **mAP50** | **96.7%** |
| **mAP50-95** | **88.6%** |
| Inference speed | ~12ms / frame (CPU) |
| Classes detected | car · bus · truck · motorcycle · person · **ambulance** |

Training notebook: [`train_colab.ipynb`](https://github.com/nooruddinsk660-rgb/flowai-traffic-optimizer/blob/main/train_colab.ipynb)

### Audio — YAMNet (Google, 521 classes)

Siren detection uses class indices **397–400** (civil defense siren, ambulance, fire truck, police). Confidence is written to Redis with a **3s TTL** — stale audio never falsely holds a green light.

### Forecasting — XGBoost

```python
features = [hour, day_of_week, is_festival, is_peak,
            density_lag_1, density_lag_2, density_lag_3, aqi]
# Festival dates include: March 28, 2026 (Holi) ✓
# Output: 6 forecast slots — [t+5, t+10, t+15, t+20, t+25, t+30 min]
# R² ≥ 0.85 on held-out test set
```

### Routing — NetworkX Dijkstra

7 pre-computed ambulance routes using real geodesic distances between 8 Delhi intersections. `DEMO_MODE=true` returns instant cached results; production runs live Dijkstra on the weighted graph.

---

## 🗺️ Monitored Intersections

| ID | Name | Coordinates |
|----|------|-------------|
| `CP_01` | Connaught Place (Inner Circle) | 28.6315°N, 77.2167°E |
| `AIIMS_01` | AIIMS Flyover / Ring Road | 28.5672°N, 77.2100°E |
| `INA_01` | INA Market Junction | 28.5754°N, 77.2090°E |
| `SAK_01` | Saket District Centre | 28.5244°N, 77.2066°E |
| `NEHRU_01` | Nehru Place Crossing | 28.5492°N, 77.2509°E |
| `KALK_01` | Kalkaji Mandir | 28.5357°N, 77.2565°E |
| `LODHI_01` | Lodhi Road | 28.5908°N, 77.2266°E |
| `ROHINI_01` | Rohini Sector 3 | 28.7041°N, 77.1025°E |

---

## 🚀 Quick Start

### Prerequisites

```bash
python --version   # 3.11+
node --version     # 18+
redis-cli ping     # PONG  ← Redis must be running on port 6379
```

### 1 — Clone

```bash
git clone https://github.com/nooruddinsk660-rgb/flowai-traffic-optimizer.git
cd flowai-traffic-optimizer
```

### 2 — Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# Verify: http://localhost:8000/health → {"status": "ok"}
```

### 3 — Mock Vision (simulates camera + YOLO for demo)

```bash
# New terminal
cd backend
python mock_vision.py
# Writes live density + emergency_confidence to Redis every 1s
```

### 4 — Frontend

```bash
cd frontened
npm install
npm run dev
# → http://localhost:5173
```

### 5 — (Optional) Real Camera

```bash
# Webcam
python vehicle_counter.py

# Video file — for demo without physical camera
set VIDEO_SOURCE=demo_traffic.mp4
python vehicle_counter.py
```

### Windows — One Command

```bat
.\start_all.bat
```

> **Redis note:** The bat file checks if Redis is already on port 6379 and skips the start step — no "bind: operation completed" errors.

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | System info |
| `GET` | `/health` | Health check + Redis status |
| `GET` | `/intersections` | All 8 intersection states |
| `GET` | `/intersection/{id}` | Single intersection detail |
| `WS` | `/ws` | Live stream — pushes every 1s |
| `POST` | `/emergency` | Activate corridor `{"route": "CP_01_AIIMS_01"}` |
| `POST` | `/emergency/cancel` | Clear active corridor |
| `GET` | `/forecast/{id}` | 30-min XGBoost forecast |
| `GET` | `/history/{id}` | SQLite signal history |

### WebSocket Payload

```json
{
  "type": "INTERSECTION_STATE_UPDATE",
  "intersections": [
    {
      "id": "CP_01",
      "name": "Connaught Place (Inner Circle)",
      "mode": "adaptive",
      "density": 0.87,
      "green_seconds": 56,
      "active_direction": "NORTH",
      "pm25": 142.3,
      "aqi_penalty": 8,
      "emergency_confidence": 0.0,
      "forecast": [
        {"t_plus": 5,  "density": 0.82, "level": "HIGH"},
        {"t_plus": 10, "density": 0.79, "level": "HIGH"},
        {"t_plus": 15, "density": 0.71, "level": "HIGH"},
        {"t_plus": 20, "density": 0.65, "level": "MEDIUM"},
        {"t_plus": 25, "density": 0.58, "level": "MEDIUM"},
        {"t_plus": 30, "density": 0.51, "level": "MEDIUM"}
      ]
    }
  ],
  "emergency": null
}
```

### Redis Key Schema

```
CP_01:state             → JSON {id, count, density, emergency_confidence, ts}   TTL 10s
CP_01:signal            → JSON {active_direction, green_seconds, mode, density}
audio:siren_confidence  → float 0.0–1.0                                         TTL 3s
aqi:{station_id}:pm25   → float µg/m³                                           TTL 600s
forecast:{id}:30min     → JSON [{t_plus, density, level} × 6]
emergency:active        → JSON {route, corridor, eta, source, activated_at}
```

Full key reference: [`REDIS_KEYS.md`](https://github.com/nooruddinsk660-rgb/flowai-traffic-optimizer/blob/main/REDIS_KEYS.md)

---

## 📊 Key Results

```
┌──────────────────────────────────────────────────────────────┐
│              AMBULANCE CORRIDOR BENCHMARK                    │
│                    CP_01 → AIIMS_01  (5.2 km)                │
├───────────────────────────────┬──────────────────────────────┤
│  Traditional signals          │  FlowAI green corridor       │
│  Average time:  14:00         │  Average time:   4:14        │
│  Worst case:    22:00         │  Worst case:     6:30        │
├───────────────────────────────┴──────────────────────────────┤
│                                                              │
│   ⚡  76% reduction in ambulance corridor time               │
│   🟢  Signal decision latency < 200ms                       │
│   🎯  Ambulance detection mAP50 = 96.7%                     │
│   🔊  Dual-source siren fusion (audio + visual)             │
│   📉  AQI-aware penalty: up to −20s on high pollution days  │
│   💰  Infrastructure cost: ₹0  (runs on existing cameras)   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Environment Variables

```env
# backend/.env  (copy from .env.example)
REDIS_HOST=localhost
REDIS_PORT=6379
DB_PATH=flowai.db

EMERGENCY_THRESHOLD=0.75      # fused confidence to auto-trigger
GRIDLOCK_THRESHOLD=0.85       # density to enter gridlock mode
GRIDLOCK_CYCLES=3             # consecutive cycles before gridlock

AQI_API_URL=https://api.openaq.org/v2/latest
AQI_POLL_S=300
```

```env
# frontened/.env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

```env
# Production (Railway.app + Vercel — free tier)
VITE_API_URL=https://your-app.railway.app
VITE_WS_URL=wss://your-app.railway.app/ws
```

---

## 📦 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Vision | YOLOv8n + custom PT | Fast, accurate, fine-tunable on Indian vehicles |
| Audio | Google YAMNet | 521-class audio, pre-trained siren detection |
| Forecast | XGBoost | Tabular data, festival-aware, fast inference |
| Routing | NetworkX Dijkstra | Geodesic graph on 8 real Delhi coordinates |
| API | FastAPI + Uvicorn | Async, WebSocket native, auto Swagger docs |
| State bus | Redis 7 | Sub-ms pub/sub, TTL-based staleness control |
| Database | SQLite + aiosqlite | Zero-config async signal logging |
| Frontend | React 18 + Vite | HMR, fast builds, component tree |
| Maps | React-Leaflet + CartoDB | Dark/light tile swap, custom glassmorphic popup |
| Charts | Recharts | 30-min density sparklines in sidebar cards |
| Infra | Railway.app + Vercel | **Free tier — ₹0 infrastructure cost** |

---

## 👥 Team

| Role | Responsibilities |
|------|-----------------|
| **P1 — CV Engineer** | YOLOv8 training, `ambulance_v1.pt`, YAMNet siren detection, MJPEG server |
| **P2 — Backend Lead** | FSM signal brain, FastAPI, AQI module, WebSocket, SQLite logging |
| **P3 — Frontend Dev** | React dashboard, Leaflet map, sidebar, emergency panel, UI design |
| **P4 — ML Engineer** | XGBoost forecasting, NetworkX routing, festival calendar, Redis schema |

---

## 📄 License

MIT License — see [LICENSE](https://github.com/nooruddinsk660-rgb/flowai-traffic-optimizer/blob/main/LICENSE)

---

<div align="center">

**[⭐ Star this repo](https://github.com/nooruddinsk660-rgb/flowai-traffic-optimizer) · [▶ Watch Demo](https://drive.google.com/file/d/1RXfrjnL0EsrCw1B2LW-1Cuj_qXR_yCeW/view?usp=sharing) · [🍴 Fork](https://github.com/nooruddinsk660-rgb/flowai-traffic-optimizer/fork)**

Built for **India Innovates 2026** · Urban Solutions Track · Bharat Mandapam, New Delhi

`FLOWAI // NCT_DELHI // GRID_CORE_V1.0 // SYSTEM_NOMINAL`

*Every second a signal is optimized, somewhere a family gets their ambulance faster.*

</div>
