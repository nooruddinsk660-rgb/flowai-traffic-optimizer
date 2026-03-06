from ultralytics import YOLO
import cv2

model = YOLO('yolov8n.pt')
cap   = cv2.VideoCapture('../videos/cp_01.mp4')
ret, frame = cap.read()
cap.release()

results = model(frame, conf=0.4, verbose=False)
r = results[0]

# ── Explore the Results object ────────────────────────────
print("=== CLASS NAMES ===")
print(r.names)       # {0:'person', 1:'bicycle', 2:'car', 3:'motorcycle', ...}

print("\n=== BOUNDING BOXES ===")
print(r.boxes)       # Boxes object with xyxy, xywh, conf, cls

print("\n=== CLASS IDs ===")
print(r.boxes.cls)   # tensor([2., 3., 2., 5., 7., ...]) — float tensor

print("\n=== CONFIDENCES ===")
print(r.boxes.conf)  # tensor([0.87, 0.72, 0.91, ...]) — per-detection

print("\n=== VEHICLE CLASSES IN THIS FRAME ===")
VEHICLE_IDS = {2, 3, 5, 7}  # car, motorcycle, bus, truck
cls_list = [int(c) for c in r.boxes.cls.tolist()]
vehicles  = [r.names[c] for c in cls_list if c in VEHICLE_IDS]
print(f"Found: {len(vehicles)} vehicles: {vehicles}")

# Visualize with just vehicle bounding boxes
annotated = r.plot()  # draws all boxes on frame
cv2.imshow("Detection Preview", annotated)
cv2.waitKey(0)
cv2.destroyAllWindows()
