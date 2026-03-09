@echo off
echo ===================================================
echo   FlowAI ML Prediction Node - Startup Sequence (P2)
echo ===================================================
echo.

echo [1/3] Checking environment variables...
if exist .env (
    echo .env found.
) else (
    echo WARNING: .env not found. Ensure REDIS_HOST is set manually if not localhost.
)

echo.
echo [2/3] Checking virtual environment...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo Selected venv.
) else if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
    echo Selected .venv.
) else (
    echo WARNING: No venv\.venv found. Relying on global Python path.
)

echo.
echo [3/3] Launching Congestion Forecaster Loop...
python congestion_forecaster.py
