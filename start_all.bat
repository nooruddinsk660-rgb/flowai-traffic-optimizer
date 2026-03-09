@echo off
title FlowAI Demo Launcher

echo [1/4] Starting Redis...
start "Redis" cmd /k "redis-server"
timeout /t 2

echo [2/4] Starting Backend...
start "Backend" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3

echo [3/4] Starting ML Forecast...
start "ML Forecast" cmd /k "cd backend && python congestion_forecaster.py"
timeout /t 2

echo [4/4] Starting Vision...
start "Vision" cmd /k "cd backend && python vehicle_counter.py"

echo.
echo All modules launched. Open http://localhost:5173 in browser.
echo Emergency trigger: click button in dashboard.
echo Demo reset: Ctrl+Shift+R in browser.
pause
