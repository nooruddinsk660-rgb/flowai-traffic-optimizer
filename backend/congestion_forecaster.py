import time
import json
import redis
import joblib
import pandas as pd
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

MODEL_PATH = "models/xgboost_traffic.joblib"

INTERSECTIONS = ["CP_01", "AIIMS_01", "INA_01", "SAK_01", "NEHRU_01", "KALK_01", "LODHI_01", "ROHINI_01"]

def predict_future_congestion():
    print("Loading XGBoost model...")
    if not os.path.exists(MODEL_PATH):
        print(f"Model not found at {MODEL_PATH}. Train the model first.")
        return
        
    model = joblib.load(MODEL_PATH)
    
    print("Starting Congestion Forecaster Loop (+30 min horizons)...")
    while True:
        try:
            now = datetime.now()
            future_time = now + timedelta(minutes=30)
            
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
            
            predictions = {}
            for i_idx, intersection in enumerate(INTERSECTIONS):
                features = pd.DataFrame([{
                    "hour": hour,
                    "minute": minute,
                    "day_of_week": day_of_week,
                    "is_weekend": is_weekend,
                    "is_peak": is_peak,
                    "is_festival": is_festival,
                    "weather_code": weather_code,
                    "intersection_id": i_idx
                }])
                
                density = float(model.predict(features)[0])
                density = max(0.0, min(1.0, density))
                predictions[intersection] = round(density, 3)
                
                redis_key = f"forecast:{intersection}:30m"
                redis_client.setex(redis_key, 300, density)
                
            print(f"[{now.strftime('%H:%M:%S')}] Forecasted densities for {future_time.strftime('%H:%M')} -> {predictions}")
            
            time.sleep(60)
            
        except Exception as e:
            print(f"Error in prediction loop: {e}")
            time.sleep(10)

if __name__ == "__main__":
    predict_future_congestion()
