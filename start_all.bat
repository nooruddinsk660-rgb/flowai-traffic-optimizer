@echo off
title FlowAI Demo Launcher

echo [1/6] Checking Redis...
redis\redis-cli.exe ping 2>nul | findstr "PONG" >nul
if %errorlevel%==0 (
    echo     Redis already running - skipping start
) else (
    echo     Redis not found - starting...
    start "FlowAI-Redis" cmd /k "redis\redis-server.exe redis\redis.windows.conf"
    timeout /t 3 /nobreak >nul
    redis\redis-cli.exe ping 2>nul | findstr "PONG" >nul
    if %errorlevel% neq 0 (
        echo [ERROR] Redis failed to start.
        pause & exit /b 1
    )
    echo     Redis started
)

echo [2/6] Starting Backend...
start "Backend" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3

echo [3/6] Starting ML Forecast...
start "ML Forecast" cmd /k "cd backend && python congestion_forecaster.py"
timeout /t 2

echo [4/6] Starting Vision...
start "Vision" cmd /k "cd backend && python mock_vision.py"
timeout /t 2

echo [5/6] Starting Vision Stream (MJPEG)...
start "Vision Stream" cmd /k "cd backend && python mjpeg_server.py"
timeout /t 2

echo [6/6] Starting Frontend...
start "Frontend" cmd /k "cd frontened && npm run dev"

echo.
echo All modules launched. Open http://localhost:5173 in browser.
echo Emergency trigger: click button in dashboard.
echo Demo reset: Ctrl+Shift+R in browser.
pause
