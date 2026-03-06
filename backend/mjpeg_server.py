from flask import Flask, Response
from ultralytics import YOLO
import cv2, threading
from config import *
import torch

torch.set_num_threads(1)  # Senior Dev Fix: Prevent 100% CPU lock 

app   = Flask(__name__)
model = YOLO('yolov8n.pt')

# Shared frame buffer — latest annotated frame per intersection
_frames = {}
_lock   = threading.Lock()

def capture_and_annotate(video_path: str, intersection_id: str):
    """Background thread: continuously reads video and produces annotated frames."""
    cap = cv2.VideoCapture(video_path)
    while True:
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        try:
            results   = model(frame, conf=DETECTION_CONFIDENCE, verbose=False)
            annotated = results[0].plot()   # Draws boxes + labels on frame

            # Resize for streaming (reduce bandwidth)
            annotated = cv2.resize(annotated, (854, 480))

            # Add intersection ID overlay
            cv2.putText(annotated, intersection_id, (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.9, (249, 115, 22), 2)

            with _lock:
                _frames[intersection_id] = annotated
            
            # Senior Dev Fix: Force 10 FPS to prevent 100% CPU lock when running 12 YOLO instances!
            import time; time.sleep(0.1)
        except Exception:
            pass

def generate_stream(intersection_id: str):
    """Generator: yields MJPEG frames as multipart/x-mixed-replace stream."""
    while True:
        with _lock:
            frame = _frames.get(intersection_id)
        if frame is None:
            import time; time.sleep(0.1); continue

        ret, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
        if not ret: continue

        yield (
            b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' +
            jpeg.tobytes() +
            b'\r\n'
        )

@app.route('/video/<intersection_id>')
def video_feed(intersection_id):
    return Response(
        generate_stream(intersection_id),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

if __name__ == '__main__':
    # Start background capture threads for each intersection
    for node in INTERSECTIONS:
        t = threading.Thread(
            target=capture_and_annotate,
            args=(node['video'], node['id']),
            daemon=True
        )
        t.start()

    print("MJPEG server running on http://localhost:5001")
    print("Stream URLs:")
    for node in INTERSECTIONS:
        print(f"  http://localhost:5001/video/{node['id']}")

    app.run(host='0.0.0.0', port=5001, threaded=True)
