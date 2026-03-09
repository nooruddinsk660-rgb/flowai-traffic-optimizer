# FlowAI Demo Day Checklist

## System Boot Phase (30 Minutes Before Demo)
- [ ] Ensure Windows `redis-server` is running in background.
- [ ] Connect microphone (ensure it is selected correctly by `sounddevice`).
- [ ] Verify internet connection (required if downloading YAMNet or maps).
- [ ] Run `start_all.bat` (Ensure 4 terminals open).
- [ ] Confirm Backend API is healthy via `http://localhost:8000/health`.

## Backend Health Checks
- [ ] Check `vehicle_counter.py` terminal: Verify Yolo weights loaded. Count > 0 logged.
- [ ] Check `siren_detector.py` logs or ensure it boots in `main.py` without crash. "✅ YAMNet loaded" visible.
- [ ] Check `congestion_forecaster.py` terminal: "Redis Connection: OK" & XGBoost output printed.
- [ ] Check Uvicorn `main.py` terminal: "FlowAI Signal Brain API is running".

## Frontend Dashboard Checks
- [ ] Open a separate terminal, `cd frontend` and run `npm run dev` or `npm start`.
- [ ] Open browser at `http://localhost:5173`.
- [ ] Check connection status is "ONLINE" inside the Header.
- [ ] Verify Map tiles loaded correctly (leaflet/OpenStreetMap/Carto).
- [ ] Ensure all 8 intersection markers render properly on the map.
- [ ] Verify Density/AQI heatmaps display visually behind nodes.
- [ ] Ensure Forecast Charts in Sidebar are drawing graph bounds (Density vs Time).
- [ ] Watch the Traffic Phase countdown (Green Seconds) cycle correctly without freezing.

## Run-Through Rehearsal (5 Minutes Before)
- [ ] Click "🚨 Trigger Emergency" loosely on one node.
- [ ] Look at the map: Check Emergency visual corridor pulses red.
- [ ] Look at the Sidebar: Ensure Emergency Panel reads source="visual" or "manual".
- [ ] Press `Ctrl + Shift + R` and verify corridor cancel resets system gracefully.
- [ ] Bring mobile device close with Ambulance Siren test audio. Check standard 🔊 Badge shows up.

## Live Presentation Readiness
- [ ] Browser zoom level set to 100% or optimal size for projector.
- [ ] Silence other distracting apps and notifications on laptop.
- [ ] Open separate window with fallback video or screenshots just in case.
- [ ] Breathe. You've got this.
