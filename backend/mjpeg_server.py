from flask import Flask, Response
from ultralytics import YOLO
import cv2, threading
from config import *
import torch

torch.set_num_threads(1)  # Senior Dev Fix: Prevent 100% CPU lock 

app   = Flask(__name__)
model = YOLO('yolov8n.pt')

INTERSECTIONS = [
    {'id': 'CP_01', 'video': '../videos/cp_01.mp4'},
    {'id': 'AIIMS_01', 'video': '../videos/aiims_01.mp4'},
    {'id': 'INA_01', 'video': '../videos/ina_01.mp4'},
    {'id': 'SAK_01', 'video': '../videos/sak_01.mp4'},
    {'id': 'NEHRU_01', 'video': '../videos/nehru_01.mp4'},
    {'id': 'ROHINI_01', 'video': '../videos/rohini_01.mp4'},
    {'id': 'KALK_01', 'video': '../videos/5927708-sd_240_426_30fps.mp4'},
    {'id': 'LODHI_01', 'video': '../videos/855848-sd_640_360_30fps.mp4'}
]

# Shared frame buffer — latest annotated frame per intersection
_frames = {}
_lock   = threading.Lock()
_active_stream = None  # Tracks which camera the UI is actively watching

def capture_and_annotate(video_path: str, intersection_id: str):
    import time
    cap = cv2.VideoCapture(video_path)
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps == 0 or fps != fps:
        fps = 30.0
    frame_time = 1.0 / fps

    while True:
        start_t = time.time()
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        try:
            global _active_stream
            small_frame = cv2.resize(frame, (640, 360))
            
            # PERFORMANCE HACK: Only run heavy YOLO processing on the ACTIVE camera feed!
            # The other 7 invisible feeds just process raw video at 0% CPU cost.
            if _active_stream == intersection_id:
                results   = model(small_frame, conf=0.4, verbose=False)
                annotated = results[0].plot()
            else:
                annotated = small_frame

            # Add intersection ID overlay
            cv2.putText(annotated, intersection_id, (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.9, (249, 115, 22), 2)

            with _lock:
                _frames[intersection_id] = annotated
            
        except Exception as e:
            print(f"YOLO Pipeline Error on {intersection_id}: {e}")

        # Smooth Video Player Sync: maintain perfect 1x real-time playback
        elapsed = time.time() - start_t
        target_sleep = frame_time - elapsed
        if target_sleep > 0:
            time.sleep(target_sleep)
        else:
            # We are lagging. Skip raw frames to catch up so the feed never stutters!
            skip = int(-target_sleep / frame_time)
            for _ in range(skip):
                cap.grab()

def generate_stream(intersection_id: str):
    import time
    last_frame = None
    while True:
        with _lock:
            frame = _frames.get(intersection_id)
            
        if frame is None:
            time.sleep(0.1); continue

        # Lower JPEG quality slightly for much faster browser rendering and transmission
        ret, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 50])
        if not ret: continue

        yield (
            b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' +
            jpeg.tobytes() +
            b'\r\n'
        )
        
        # Prevent the generator from spam-encoding the exact same frame 1000x a second
        time.sleep(0.03)

@app.route('/video/<intersection_id>')
def video_feed(intersection_id):
    global _active_stream
    _active_stream = intersection_id
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
