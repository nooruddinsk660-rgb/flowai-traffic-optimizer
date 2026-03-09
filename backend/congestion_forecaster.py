import time
import json
import redis
import joblib
import pandas as pd
import xgboost as xgb
from datetime import datetime, timedelta
import os
import asyncio
import gc
from dotenv import load_dotenv

load_dotenv()

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

def forecast_density(intersection_id, now, model, le):
    intervals = [0, 5, 10, 15, 20, 25, 30]
    results = []
    
    encoded_id = int(le.transform([intersection_id])[0])
    
    for t_plus in intervals:
        future_time = now + timedelta(minutes=t_plus)
        
        day_of_week = future_time.weekday()
        is_weekend = 1 if day_of_week >= 5 else 0
        hour = future_time.hour
        minute = future_time.minute
        
        minute = 5 * round(minute / 5)
        if minute == 60:
            minute = 0
            hour = (hour + 1) % 24
            
        is_peak = 1 if (8 <= hour <= 10) or (17 <= hour <= 20) else 0
        is_festival = 0 
        weather_code = 0 
        
        features = pd.DataFrame([{
            "hour": hour,
            "minute": minute,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
            "is_peak": is_peak,
            "is_festival": is_festival,
            "weather_code": weather_code,
            "intersection_id": encoded_id
        }])
        
        density = float(model.predict(features)[0])
        density = max(0.0, min(1.0, density))
        
        # Explicit garbage cleanup for dataframe memory
        del features
        
        # Fix condition for exact 0.7 based on "0.4-0.7"
        level = "LOW"
        if density >= 0.7:
            level = "HIGH"
        elif density >= 0.4:
            level = "MEDIUM"
            
        results.append({
            "t_plus": t_plus,
            "density": round(density, 3),
            "level": level
        })
        
    return results

async def forecast_loop():
    print("Initializing Forecast Node...")
    
    try:
        redis_client.ping()
        print("Redis Connection: OK")
    except Exception as e:
        print(f"Redis Connection Failed: {e}")
        return
        
    print("Loading XGBoost model and Label Encoder...")
    if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODER_PATH):
        print("Models not found. Train the model first.")
        return
        
    model = xgb.XGBRegressor()
    model.load_model(MODEL_PATH)
    le = joblib.load(ENCODER_PATH)
    
    intersections = list(le.classes_)
    
    print("Running initial boot prediction test...")
    try:
        test_preds = forecast_density(intersections[0], datetime.now(), model, le)
        print(f"Test prediction successful: {intersections[0]} generated {len(test_preds)} horizons.")
    except Exception as e:
        print(f"Boot test prediction failed: {e}")
        return
        
    redis_client.setex("forecast:health", 120, "online")
    
    print("Starting Congestion Forecaster Async Loop (+30 min horizons)...")
    while True:
        try:
            now = datetime.now()
            
            for intersection in intersections:
                predictions = forecast_density(intersection, now, model, le)
                
                redis_key = f"forecast:{intersection}:30min"
                redis_client.setex(redis_key, 120, json.dumps(predictions))
                
            redis_client.setex("forecast:health", 120, "online")
            
            print(f"[{now.strftime('%H:%M:%S')}] Forecasts updated for 8 intersections.")
            
            gc.collect()
            
            await asyncio.sleep(60)
            
        except Exception as e:
            print(f"Error in prediction loop: {e}")
            await asyncio.sleep(10)

def get_forecast_alert(intersection_id, r):
    redis_key = f"forecast:{intersection_id}:30min"
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
