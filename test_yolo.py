from ultralytics import YOLO

# Downloads yolov8n.pt (~6MB) on first run if not present
model = YOLO('yolov8n.pt')

# Run on your first Delhi video
# show=True opens a window with bounding boxes drawn
# conf=0.4 sets the confidence threshold
results = model('videos/cp_01.mp4', show=True, conf=0.4)
