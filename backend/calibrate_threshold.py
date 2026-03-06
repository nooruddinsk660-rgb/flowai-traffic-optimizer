from ultralytics import YOLO
import cv2

model       = YOLO('yolov8n.pt')
VEHICLE_IDS = {2, 3, 5, 7}

cap = cv2.VideoCapture('../videos/cp_01.mp4')
ret, frame = cap.read()
cap.release()

print("Confidence Threshold Comparison:")
for conf in [0.25, 0.35, 0.40, 0.50, 0.60]:
    results = model(frame, conf=conf, verbose=False)
    cls     = results[0].boxes.cls.tolist()
    v_count = sum(1 for c in cls if int(c) in VEHICLE_IDS)
    total   = len(cls)
    print(f"  conf={conf:.2f}: {v_count} vehicles detected ({total} total objects)")
