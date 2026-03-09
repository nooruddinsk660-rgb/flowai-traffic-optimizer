import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
import joblib
import os

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
    
    print(f"Model Performance:")
    print(f"R² Score: {r2:.4f}")
    print(f"MSE: {mse:.4f}")
    
    if r2 >= 0.85:
        print("Target R² >= 0.85 achieved!")
    else:
        print("Model needs tuning to reach R² >= 0.85")
        
    os.makedirs("models", exist_ok=True)
    model_path = "models/xgboost_traffic.joblib"
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path} (size: {os.path.getsize(model_path) / 1024:.1f} KB)")

if __name__ == "__main__":
    train_xgboost()
