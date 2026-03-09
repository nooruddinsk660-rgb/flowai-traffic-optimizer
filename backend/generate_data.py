import pandas as pd
import numpy as np
import random
import os
import matplotlib.pyplot as plt

def generate_synthetic_data(days=90):
    intersections = ["CP_01", "AIIMS_01", "INA_01", "SAK_01", "NEHRU_01", "KALK_01", "LODHI_01", "ROHINI_01"]
    base_densities = {
        "CP_01": 0.65,
        "AIIMS_01": 0.45,
        "INA_01": 0.55,
        "SAK_01": 0.40,
        "NEHRU_01": 0.60,
        "KALK_01": 0.50,
        "LODHI_01": 0.42,
        "ROHINI_01": 0.58
    }
    
    rows = []
    
    for day in range(days):
        day_of_week = day % 7
        is_weekend = 1 if day_of_week >= 5 else 0
        
        is_festival = 0
        if day in [25, 60, 80]:
            is_festival = 1
            
        for hour in range(24):
            is_peak = 1 if (8 <= hour <= 10) or (17 <= hour <= 20) else 0
            
            if 8 <= hour <= 10:
                peak_wave = 0.35 * np.sin(np.pi * (hour - 8) / 2)**2
            elif 17 <= hour <= 20:
                peak_wave = 0.30 * np.sin(np.pi * (hour - 17) / 3)**2
            elif 12 <= hour <= 14:
                peak_wave = -0.10
            elif hour >= 23 or hour <= 6:
                peak_wave = -0.30
            else:
                peak_wave = 0.0
                
            for minute in [0, 30]:
                weather_code = np.random.choice([0, 1, 2], p=[0.85, 0.10, 0.05])
            
                for i_idx, intersection in enumerate(intersections):
                    base = base_densities[intersection]
                    weekend_factor = -0.30 if is_weekend else 0.0
                    noise = random.uniform(-0.08, 0.08)
                    festival_spike = 0.15 if is_festival else 0.0
                    
                    density = base + peak_wave + weekend_factor + noise + festival_spike
                    
                    if weather_code == 1:
                        density += 0.10 
                    elif weather_code == 2:
                        density += 0.15 
                        
                    density = max(0.08, min(0.98, density))
                    
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
    df.to_csv("data/traffic_training_data.csv", index=False)
    print(f"Generated {len(df)} rows. Saved to data/traffic_training_data.csv")
    print("\nDataset Statistics:")
    print(df['density'].describe())
    
    return df

def validate_data_quality(df):
    cp_idx = 0 
    cp_data = df[df['intersection_id'] == cp_idx]
    
    avg_density_by_hour = cp_data.groupby('hour')['density'].mean()
    
    plt.figure(figsize=(10, 6))
    plt.plot(avg_density_by_hour.index, avg_density_by_hour.values, marker='o', linestyle='-', color='b')
    plt.title('CP_01 Average Traffic Density by Hour (Bimodal Distribution Check)')
    plt.xlabel('Hour of Day (0-23)')
    plt.ylabel('Average Density (0.0 - 1.0)')
    plt.grid(True)
    plt.xticks(range(0, 24))
    plt.ylim(0, 1)
    
    plt.axvspan(8, 10, color='red', alpha=0.1, label='Morning Peak')
    plt.axvspan(17, 20, color='red', alpha=0.1, label='Evening Peak')
    plt.axvspan(12, 14, color='green', alpha=0.1, label='Lunch Dip')
    plt.legend()
    
    plt.savefig('data/bimodal_validation_cp01.png')
    print("Saved validation plot to data/bimodal_validation_cp01.png")
    
if __name__ == "__main__":
    df = generate_synthetic_data()
    validate_data_quality(df)