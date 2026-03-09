import time
import json
import redis
import pandas as pd
import xgboost as xgb
from datetime import datetime, timedelta
import os
import asyncio
import gc
from dotenv import load_dotenv

load_dotenv()
import constants

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

MODEL_PATH = "models/congestion_model.json"
ENCODER_PATH = "models/intersection_encoder.pkl"

def get_level(density):
    if density < 0.4:
        return "LOW"
    elif density <= 0.7:
        return "MEDIUM"
    else:
        return "HIGH"

FESTIVAL_DATES = {
    "2026-01-14", "2026-01-26", "2026-02-26",
    "2026-03-14",   # Holi
    "2026-03-28",   # Demo day
}

FORECAST_SLOTS = constants.FORECAST_SLOTS

def forecast_density(intersection_id, now, model):
    intersections = ["CP_01", "AIIMS_01", "INA_01", "SAK_01", "NEHRU_01", "KALK_01", "LODHI_01", "ROHINI_01"]
    try:
        encoded_id = intersections.index(intersection_id)
    except ValueError:
        encoded_id = 0
        
    rows = []
    for t in FORECAST_SLOTS:
        future_time = now + timedelta(minutes=t)
        excess = future_time.minute % 5
        if excess >= 3:
            rounded_time = future_time + timedelta(minutes=5 - excess)
        else:
            rounded_time = future_time - timedelta(minutes=excess)
            
        rows.append({
            "hour": rounded_time.hour,
            "minute": rounded_time.minute,
            "day_of_week": rounded_time.weekday(),
            "is_weekend": 1 if rounded_time.weekday() >= 5 else 0,
            "is_peak": 1 if (8 <= rounded_time.hour <= 10) or (17 <= rounded_time.hour <= 20) else 0,
            "is_festival": 1 if rounded_time.strftime("%Y-%m-%d") in FESTIVAL_DATES else 0,
            "weather_code": 0,
            "intersection_id": encoded_id
        })
        
    X = pd.DataFrame(rows)
    raw_preds = model.predict(X)
    
    return [
        {"t_plus": t,
         "density": round(float(max(0.0, min(1.0, raw_preds[i]))), 3),
         "level": "HIGH" if raw_preds[i] >= constants.DENSITY_HIGH else ("MEDIUM" if raw_preds[i] >= constants.DENSITY_MEDIUM else "LOW")}
        for i, t in enumerate(FORECAST_SLOTS)
    ]

async def forecast_loop():
    print("Initializing Forecast Node...")
    
    try:
        redis_client.ping()
        print("Redis Connection: OK")
    except Exception as e:
        print(f"Redis Connection Failed: {e}")
        return
        
    print("Loading XGBoost model...")
    if not os.path.exists(MODEL_PATH):
        print("Models not found. Train the model first.")
        return
        
    model = xgb.XGBRegressor()
    model.load_model(MODEL_PATH)
    
    intersections = ["CP_01", "AIIMS_01", "INA_01", "SAK_01", "NEHRU_01", "KALK_01", "LODHI_01", "ROHINI_01"]
    
    print("Running initial boot prediction test...")
    try:
        test_preds = forecast_density(intersections[0], datetime.now(), model)
        print(f"Test prediction successful: {intersections[0]} generated {len(test_preds)} horizons.")
    except Exception as e:
        print(f"Boot test prediction failed: {e}")
        return
        
    redis_client.setex(constants.FORECAST_HEALTH, 120, "online")
    
    print("Starting Congestion Forecaster Async Loop (+30 min horizons)...")
    while True:
        try:
            now = datetime.now()
            
            for intersection in intersections:
                predictions = forecast_density(intersection, now, model)
                
                redis_key = constants.forecast_key(intersection)
                redis_client.setex(redis_key, 120, json.dumps(predictions))
                
            redis_client.setex(constants.FORECAST_HEALTH, 120, "online")
            
            print(f"[{now.strftime('%H:%M:%S')}] Forecasts updated for 8 intersections.")
            
            gc.collect()
            
            await asyncio.sleep(60)
            
        except Exception as e:
            print(f"Error in prediction loop: {e}")
            await asyncio.sleep(10)

def get_forecast_alert(intersection_id, r):
    redis_key = constants.forecast_key(intersection_id)
    data = r.get(redis_key)
    
    if not data:
        return {"alert": False, "peak_t_plus": 0, "peak_density": 0.0}
        
    predictions = json.loads(data)
    
    alert = False
    peak_t_plus = 0
    peak_density = 0.0
    
    for p in predictions:
        if p["density"] > peak_density:
            peak_density = p["density"]
            peak_t_plus = p["t_plus"]
            
        if p["density"] > 0.75:
            alert = True
            
    return {
        "alert": alert,
        "peak_t_plus": peak_t_plus,
        "peak_density": peak_density
    }

if __name__ == "__main__":
    asyncio.run(forecast_loop())
