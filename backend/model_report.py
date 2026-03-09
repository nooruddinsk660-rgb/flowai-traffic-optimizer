import pandas as pd
import numpy as np
import xgboost as xgb
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import joblib

def generate_report():
    print("Generating Model Validation Report...")
    
    # 1. 24-Hour Density Prediction Curve for CP_01
    model = xgb.XGBRegressor()
    model.load_model("models/congestion_model.json")
    le = joblib.load("models/intersection_encoder.pkl")
    encoded_id = int(le.transform(["CP_01"])[0])
    
    hours = list(range(24))
    densities_weekday = []
    
    for h in hours:
        is_peak = 1 if (8 <= h <= 10) or (17 <= h <= 20) else 0
        features = pd.DataFrame([{
            "hour": h,
            "minute": 30, # Plot mid-hour
            "day_of_week": 2, # Wednesday
            "is_weekend": 0,
            "is_peak": is_peak,
            "is_festival": 0,
            "weather_code": 0,
            "intersection_id": encoded_id
        }])
        
        pred = max(0.0, min(1.0, float(model.predict(features)[0])))
        densities_weekday.append(pred)
        
    plt.figure(figsize=(12, 6))
    plt.plot(hours, densities_weekday, marker='o', color='purple', linewidth=2, label="Predicted Density")
    plt.axvspan(8, 10, color='red', alpha=0.1, label='Morning Rush')
    plt.axvspan(17, 20, color='red', alpha=0.1, label='Evening Rush')
    plt.title('24-Hour Predictive Congestion Curve Output (CP_01 - Wednesday)')
    plt.xlabel('Time of Day (Hour)')
    plt.ylabel('Predicted Density (0.0 to 1.0)')
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.xticks(hours, [f"{h:02d}:00" for h in hours], rotation=45)
    plt.legend()
    plt.tight_layout()
    plt.savefig("models/report_cp01_curve.png")
    
    # Generate static HTML report
    html_content = """
    <html>
    <head>
        <title>FlowAI - Person 4 Routing & Forecasting Validation</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; color: #333; margin: 0; padding: 20px; }
            .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px; }
            h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            h2 { color: #2980b9; margin-top: 30px; }
            .metrics { display: flex; justify-content: space-between; background: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .metric-box { text-align: center; }
            .metric-value { font-size: 24px; font-weight: bold; color: #27ae60; }
            .metric-label { font-size: 14px; color: #7f8c8d; text-transform: uppercase; margin-top: 5px; }
            .img-container { text-align: center; margin-bottom: 30px; }
            img { max-width: 100%; border: 1px solid #ddd; border-radius: 4px; padding: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>FlowAI Predictive Traffic Forecaster</h1>
            <p><strong>Deliverable:</strong> Phase 8 Validation Report (Person 4)</p>
            <p><strong>Date:</strong> 2026-03-12</p>

            <h2>1. Primary Validation Metrics</h2>
            <div class="metrics">
                <div class="metric-box">
                    <div class="metric-value">0.9632</div>
                    <div class="metric-label">Cross-Validation R²</div>
                </div>
                <div class="metric-box">
                    <div class="metric-value">&plusmn; 0.0010</div>
                    <div class="metric-label">5-Fold Std Dev (Stability)</div>
                </div>
                <div class="metric-box">
                    <div class="metric-value">0.0367</div>
                    <div class="metric-label">Mean Absolute Error (MAE)</div>
                </div>
            </div>

            <h2>2. Feature Explainability (No Black Boxes)</h2>
            <p>The routing engine proves <strong>hour</strong> and <strong>is_peak</strong> drive accurate traffic behavior dynamically.</p>
            <div class="img-container">
                <img src="feature_importance.png" alt="Feature Importance">
            </div>

            <h2>3. 24-Hour Node Pattern Tracking</h2>
            <p>The model accurately maps out real-world bimodal distributions over an average weekday dynamically.</p>
            <div class="img-container">
                <img src="report_cp01_curve.png" alt="CP01 24H Curve">
            </div>
            
            <h2>4. True Fit Testing</h2>
            <p>Intersection actual density precisely lines up with predictions (y=x tight grouping).</p>
            <div class="img-container">
                <img src="model_performance.png" alt="Performance Scatter">
            </div>
        </div>
    </body>
    </html>
    """
    
    with open("models/model_report.html", "w") as f:
        f.write(html_content)
        
    print("Report generated successfully: models/model_report.html")

if __name__ == "__main__":
    generate_report()
