"""
mock_vision.py — Simulates Person 1's video pipeline output.
Run this whenever Person 1's pipeline is unavailable.
Writes realistic vehicle density + emergency signals to Redis.
Usage: python mock_vision.py
"""
import redis, json, time, random, math
from datetime import datetime

r = redis.Redis(host='localhost', decode_responses=True)

INTERSECTIONS = ['CP_01', 'AIIMS_01', 'INA_01', 'SAK_01',
                 'NEHRU_01', 'KALK_01', 'LODHI_01', 'ROHINI_01']

# Per-intersection baseline density (captures different area characteristics)
BASELINES = {'CP_01':0.7, 'AIIMS_01':0.5, 'INA_01':0.55, 'SAK_01':0.45,
             'NEHRU_01':0.6, 'KALK_01':0.5, 'LODHI_01':0.4, 'ROHINI_01':0.65}

t = 0
print("📹 mock_vision: writing to Redis every 1s... (Ctrl+C to stop)")

while True:
    for iid in INTERSECTIONS:
        # Sinusoidal density variation — simulates rush-hour waves
        base    = BASELINES[iid]
        wave    = 0.2 * math.sin(t / 30)
        noise   = random.uniform(-0.05, 0.05)
        density = round(max(0.1, min(1.0, base + wave + noise)), 3)

        # Simulate an ambulance appearing for 5 seconds every 5 minutes
        emrg = 0.92 if (t % 300) in range(5) and iid == 'CP_01' else 0.0

        r.set(f"{iid}:state", json.dumps({
            "id": iid, "count": int(density * 60),
            "density": density, "emergency_confidence": emrg,
            "ts": datetime.now().isoformat()
        }), ex=10)

    t += 1
    time.sleep(1)
