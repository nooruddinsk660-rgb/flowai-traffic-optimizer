from congestion_forecaster import forecast_density, ENCODER_PATH, MODEL_PATH
import joblib
import xgboost as xgb
from datetime import datetime

print("Loading model and encoder...")
model = xgb.XGBRegressor()
model.load_model(MODEL_PATH)
le = joblib.load(ENCODER_PATH)

print("\n--- Testing 3:00 PM (Pre-Evening Rush) ---")
test_time_pm = datetime(2026, 3, 11, 15, 0, 0)

# Simulate what forecast_density does, but with a 120min skip to test
intervals = [0, 60, 120]
for t_plus in intervals:
    am_preds = forecast_density("CP_01", test_time_pm, model, le)
    # wait, forecast density internally uses its own intervals list.
    pass

def custom_forecast_test(intersection_id, now, model, le, test_intervals):
    results = []
    encoded_id = int(le.transform([intersection_id])[0])
    import pandas as pd
    from datetime import timedelta
    for t_plus in test_intervals:
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
            "hour": hour, "minute": minute, "day_of_week": day_of_week,
            "is_weekend": is_weekend, "is_peak": is_peak, "is_festival": is_festival,
            "weather_code": weather_code, "intersection_id": encoded_id
        }])
        density = float(model.predict(features)[0])
        density = max(0.0, min(1.0, density))
        level = "LOW"
        if density >= 0.7: level = "HIGH"
        elif density >= 0.4: level = "MEDIUM"
        results.append({"t_plus": t_plus, "density": round(density, 3), "level": level})
    return results

pm_preds = custom_forecast_test("CP_01", test_time_pm, model, le, [0, 60, 120])
for p in pm_preds:
    hour = (test_time_pm.hour + (test_time_pm.minute + p['t_plus']) // 60) % 24
    print(f"t+{p['t_plus']}m ({hour}:00): Density = {p['density']}, Level = {p['level']}")
