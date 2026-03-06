from ultralytics import YOLO
import cv2, redis, json, time, logging
from datetime import datetime
from pathlib  import Path
from config   import *

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(name)s] %(levelname)s: %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('logs/vision_pipeline.log')
    ]
)

# ── Model loading ──────────────────────────────────────────────────────────
# Load ambulance model if fine-tuned weights exist, fall back to base model
_base  = YOLO('yolov8n.pt')
_ambu_path = Path('../models/ambulance_v1.pt')
_ambu  = YOLO(str(_ambu_path)) if _ambu_path.exists() else _base

# ── Redis connection factory ───────────────────────────────────────────────
def make_redis() -> redis.Redis:
    return redis.Redis(
        host=REDIS_HOST, port=REDIS_PORT,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_keepalive=True,
        retry_on_timeout=True
    )

def detect_vehicles(frame, model=_base):
    """
    Run YOLO on a frame. Returns (vehicle_count, density, emergency_conf).
    All exceptions caught — never crashes the caller.
    """
    try:
        results   = model(frame, conf=DETECTION_CONFIDENCE, verbose=False)
        boxes     = results[0].boxes
        cls_list  = boxes.cls.tolist()
        conf_list = boxes.conf.tolist()

        # Count vehicles (standard classes)
        v_count = sum(1 for c in cls_list if int(c) in VEHICLE_CLASS_IDS)
        density = round(min(v_count / MAX_LANE_CAPACITY, 1.0), 3)

        # Detect ambulance (uses fine-tuned model if available)
        a_results    = _ambu(frame, conf=AMBULANCE_CONFIDENCE, verbose=False)
        a_cls        = a_results[0].boxes.cls.tolist()
        a_conf       = a_results[0].boxes.conf.tolist()
        emrg_matches = [c for c, cf in zip(a_cls, a_conf)
                        if int(c) == AMBULANCE_CLASS_ID and cf >= AMBULANCE_CONFIDENCE]
        emrg_conf    = round(max([a_results[0].boxes.conf.tolist()[i]
                        for i, c in enumerate(a_cls)
                        if int(c) == AMBULANCE_CLASS_ID], default=0.0), 3)

        return v_count, density, emrg_conf if emrg_conf >= AMBULANCE_CONFIDENCE else 0.0

    except Exception as e:
        logging.warning(f"Detection error: {e}")
        return 0, 0.5, 0.0   # Safe defaults — density 0.5 = median, no emergency


def process_intersection(video_path: str, intersection_id: str):
    """
    Main loop for a single intersection. Runs indefinitely.
    Reads video frames → runs detection → writes to Redis.
    Video loops when it ends (for continuous demo operation).
    """
    import torch
    torch.set_num_threads(1)  # Senior Dev fix: prevent 100% CPU locking across 6 processes
    
    log = logging.getLogger(intersection_id)
    log.info(f"Starting vision pipeline for {intersection_id}")

    r = make_redis()
    frame_count = 0

    while True:   # Outer: restart everything if video capture fails
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            log.error(f"Cannot open {video_path}. Retrying in 10s.")
            time.sleep(10)
            continue

        log.info("Video opened successfully")
        fps = cap.get(cv2.CAP_PROP_FPS) or 25
        skip_frames = max(1, int(fps * INFERENCE_INTERVAL_S))

        while True:   # Inner: process frames
            ret, frame = cap.read()

            if not ret:   # End of video — loop back to start
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                log.debug("Video looped")
                continue

            frame_count += 1
            if frame_count % skip_frames != 0:
                continue   # Skip frames to achieve ~1 inference/second

            # ── Run detection ─────────────────────────────────────────
            v_count, density, emrg_conf = detect_vehicles(frame)

            # ── Build payload ─────────────────────────────────────────
            payload = {
                'id':                   intersection_id,
                'count':               v_count,
                'density':             density,
                'emergency_confidence': emrg_conf,
                'ts':                  datetime.now().isoformat()
            }

            # ── Write to Redis (with retry on connection error) ────────
            try:
                r.set(f'{intersection_id}:state',  json.dumps(payload), ex=REDIS_VEHICLE_TTL)
                r.set(f'{intersection_id}:health', datetime.now().isoformat(),  ex=REDIS_HEALTH_TTL)
            except redis.ConnectionError:
                log.warning("Redis disconnected. Reconnecting...")
                r = make_redis()   # Reconnect and continue — never crash
            except Exception as e:
                log.error(f"Redis write error: {e}")

            time.sleep(INFERENCE_INTERVAL_S)


# ── Entry point: run all 6 intersections in parallel processes ─────────────
if __name__ == '__main__':
    from multiprocessing import Process, freeze_support
    import os
    freeze_support() # Recommended for Windows multiprocessing
    os.makedirs('logs', exist_ok=True)

    procs = [
        Process(
            target=process_intersection,
            args=(node['video'], node['id']),
            daemon=True,
            name=f"vision-{node['id']}"
        )
        for node in INTERSECTIONS
    ]

    print(f"Starting {len(procs)} vision pipelines...")
    for p in procs: p.start()

    # Keep main process alive, restart crashed workers
    while True:
        for i, p in enumerate(procs):
            if not p.is_alive():
                node = INTERSECTIONS[i]
                logging.warning(f"Worker {node['id']} died. Restarting.")
                procs[i] = Process(
                    target=process_intersection,
                    args=(node['video'], node['id']),
                    daemon=True
                )
                procs[i].start()
        time.sleep(30)  # Check worker health every 30 seconds
