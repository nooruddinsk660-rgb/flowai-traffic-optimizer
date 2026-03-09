import cv2, json, redis, os, torch, time, logging
from ultralytics import YOLO
from datetime import datetime
import constants

log = logging.getLogger("vehicle_counter")
VEHICLE_CLASSES = {2:"car", 3:"motorcycle", 5:"bus", 7:"truck"}
INTERSECTION_ID = os.getenv("INTERSECTION_ID", "CP_01")
r = redis.Redis(host=os.getenv("REDIS_HOST","localhost"), decode_responses=True)

# ── Load both models once at startup ───────────────────────────────────
yolo_coco = YOLO("yolov8n.pt")          # vehicle counting
# Map to root models folder gracefully
model_path = "../models/ambulance_v1.pt" if os.path.exists("../models/ambulance_v1.pt") else "models/ambulance_v1.pt"
yolo_amb = YOLO(model_path) # ambulance detection

def process_frame(frame):
    # COCO model: count vehicles
    res_v = yolo_coco.predict(frame, classes=list(VEHICLE_CLASSES.keys()), conf=0.4, verbose=False)[0]
    count = len(res_v.boxes)
    density = min(1.0, count / 80) # calibrated to 80 max vehicles/frame

    # Ambulance model: confidence score
    res_a = yolo_amb.predict(frame, conf=0.35, verbose=False)[0]
    amb_conf = 0.0
    if len(res_a.boxes) > 0:
        amb_conf = float(res_a.boxes.conf.max()) # highest detection confidence

    state = {
        "id": INTERSECTION_ID,
        "count": count,
        "density": round(density, 3),
        "emergency_confidence": round(amb_conf, 3),
        "ts": datetime.now().isoformat()
    }
    r.set(constants.intersection_state_key(INTERSECTION_ID), json.dumps(state), ex=10)
    return state

def run(source=0):
    # 0=webcam, or path to video file
    cap = cv2.VideoCapture(source)
    log.info(f"Starting on {INTERSECTION_ID}, source={source}")
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        state = process_frame(frame)
        if state["emergency_confidence"] > 0.5:
            log.warning(f"🚨 Ambulance detected! conf={state['emergency_confidence']:.2f}")
        time.sleep(0.067) # ~15fps
    cap.release()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    src = os.getenv("VIDEO_SOURCE", "0")
    run(int(src) if src.isdigit() else src)
