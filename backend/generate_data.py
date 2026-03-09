import pandas as pd
import numpy as np
import random
import os

def generate_synthetic_data(days=8):
    intersections = ["CP_01", "AIIMS_01", "INA_01", "SAK_01", "NEHRU_01", "KALK_01", "LODHI_01", "ROHINI_01"]
    base_densities = {
        "CP_01": 0.65,
        "AIIMS_01": 0.45,
        "ROHINI_01": 0.60,
        "INA_01": 0.55,
        "SAK_01": 0.50,
        "NEHRU_01": 0.62,
        "KALK_01": 0.48,
        "LODHI_01": 0.40
    }
    
    rows = []
    
    for day in range(days):
        day_of_week = day % 7
        is_weekend = 1 if day_of_week >= 5 else 0
        is_festival = 1 if day == 3 else 0 
        
        for hour in range(24):
            is_peak = 1 if (8 <= hour <= 10) or (17 <= hour <= 20) else 0
            
            if 8 <= hour <= 10:
                peak_wave = 0.35 * np.sin(np.pi * (hour - 8) / 2)**2
            elif 17 <= hour <= 20:
                peak_wave = 0.30 * np.sin(np.pi * (hour - 17) / 3)**2
            else:
                peak_wave = 0.0
                
            for minute in range(0, 60, 5):
                weather_code = np.random.choice([0, 1, 2], p=[0.8, 0.15, 0.05])
                
                for i_idx, intersection in enumerate(intersections):
                    base = base_densities[intersection]
                    weekend_factor = -0.25 if is_weekend else 0.0
                    noise = random.uniform(-0.08, 0.08)
                    festival_spike = 0.15 if is_festival else 0.0
                    
                    density = base + peak_wave + weekend_factor + noise + festival_spike
                    
                    if weather_code == 1:
                        density += 0.1 
                    elif weather_code == 2:
                        density += 0.15 
                        
                    density = max(0.0, min(1.0, density))
                    
                    rows.append({
                        "hour": hour,
                        "minute": minute,
                        "day_of_week": day_of_week,
                        "is_weekend": is_weekend,
                        "is_peak": is_peak,
                        "is_festival": is_festival,
                        "weather_code": weather_code,
                        "intersection_id": i_idx,
                        "density": density
                    })
                    
    df = pd.DataFrame(rows)
    os.makedirs("data", exist_ok=True)
    df.to_csv("data/synthetic_traffic.csv", index=False)
    print(f"Generated {len(df)} rows. Saved to data/synthetic_traffic.csv")
    return df

if __name__ == "__main__":
    generate_synthetic_data()
