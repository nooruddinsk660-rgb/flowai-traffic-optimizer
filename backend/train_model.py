import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from sklearn.preprocessing import LabelEncoder
import joblib
import os
import json
from datetime import datetime
import matplotlib.pyplot as plt

def train_xgboost():
    print("Loading data...")
    if not os.path.exists("data/traffic_training_data.csv"):
        print("Data not found. Please run generate_data.py first.")
        return
        
    df = pd.read_csv("data/traffic_training_data.csv")
    
    nan_count = df.isnull().sum().sum()
    if nan_count > 0:
        print(f"Warning: Found {nan_count} NaN values in dataset.")
        print(df.isnull().sum())
        return
    
    features = ["hour", "minute", "day_of_week", "is_weekend", "is_peak", 
                "is_festival", "weather_code", "intersection_id"]
    X = df[features]
    y = df["density"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost Regressor...")
    model = xgb.XGBRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        early_stopping_rounds=30
    )
    
    model.fit(
        X_train, 
        y_train,
        eval_set=[(X_test, y_test)],
        verbose=10
    )
    
    preds = model.predict(X_test)
    r2 = r2_score(y_test, preds)
    mse = mean_squared_error(y_test, preds)
    mae = mean_absolute_error(y_test, preds)
    
    print("\nRunning 5-Fold Cross Validation...")
    cv_model = xgb.XGBRegressor(
        n_estimators=300, max_depth=6, learning_rate=0.05, 
        subsample=0.8, colsample_bytree=0.8, min_child_weight=3, 
        reg_alpha=0.1, reg_lambda=1.0, random_state=42
    )
    cv_scores = cross_val_score(cv_model, X, y, cv=5, scoring='r2')
    cv_mean = cv_scores.mean()
    cv_std = cv_scores.std()
    
    print(f"CV R² Mean: {cv_mean:.4f}")
    print(f"CV R² Std Dev: {cv_std:.4f}")
    
    if cv_mean >= 0.85 and cv_std < 0.05:
        print("Cross-Validation criteria PASSED: Model is highly stable.")
    else:
        print("Model failed cross-validation stability test!")
        
    print(f"\nTest Set Performance:")
    print(f"R² Score: {r2:.4f}")
    print(f"MSE: {mse:.4f}")
    print(f"MAE: {mae:.4f}")
    
    if r2 >= 0.85 and mae <= 0.08 and mse <= 0.12:
        print("Target Metrics Achieved!")
    else:
        print("Model needs tuning to reach targets.")
        
    os.makedirs("models", exist_ok=True)
    
    # Feature importance plot
    plt.figure(figsize=(10, 6))
    xgb.plot_importance(model, max_num_features=10)
    plt.title("Feature Importance")
    plt.tight_layout()
    plt.savefig("models/feature_importance.png")
    print("Feature importance plot saved to models/feature_importance.png")
    
    # Scatter plot for 3 intersections
    subset_mask = X_test["intersection_id"].isin([0, 1, 7]) # CP, AIIMS, ROHINI
    y_test_sub = y_test[subset_mask]
    preds_sub = preds[subset_mask]
    
    plt.figure(figsize=(8, 8))
    plt.scatter(y_test_sub, preds_sub, alpha=0.3, color='blue', label='Predictions')
    plt.plot([0, 1], [0, 1], 'r--', label='Ideal Fit')
    plt.title('Actual vs Predicted Density (CP, AIIMS, ROHINI)')
    plt.xlabel('Actual Density')
    plt.ylabel('Predicted Density')
    plt.legend()
    plt.grid(True)
    plt.savefig("models/model_performance.png")
    print("Prediction scatter plot saved to models/model_performance.png")
    
    # Save Model JSON
    model_json_path = "models/congestion_model.json"
    model.save_model(model_json_path)
    
    # Save Label Encoder
    le = LabelEncoder()
    le.classes_ = np.array(["CP_01", "AIIMS_01", "INA_01", "SAK_01", "NEHRU_01", "KALK_01", "LODHI_01", "ROHINI_01"])
    joblib.dump(le, "models/intersection_encoder.pkl")
    
    # Save Metadata JSON
    metadata = {
        "r2": float(r2),
        "mae": float(mae),
        "mse": float(mse),
        "trained_at": datetime.now().strftime("%Y-%m-%d"),
        "n_rows": int(len(df))
    }
    with open("models/model_meta.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
    print(f"Model artifacts saved successfully in models/ directory!")

if __name__ == "__main__":
    train_xgboost()
