import asyncio
import json
import redis
import os
import random
import math
from datetime import datetime

r = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), decode_responses=True)

INTERSECTIONS = ["CP_01", "AIIMS_01", "INA_01", "SAK_01", "NEHRU_01", "KALK_01", "LODHI_01", "ROHINI_01"]
BASELINES = {
    "CP_01": 0.65, "AIIMS_01": 0.45, "INA_01": 0.55, "SAK_01": 0.40,
    "NEHRU_01": 0.60, "KALK_01": 0.50, "LODHI_01": 0.42, "ROHINI_01": 0.58
}

async def run_mock():
    print("🎭 Mock vision running — simulating 8 intersections")
    t = 0
    try:
        while True:
            t += 1
            h = datetime.now().hour
            peak = 0.3 if 8 <= h <= 10 or 17 <= h <= 20 else 0.0
            
            for iid in INTERSECTIONS:
                base = BASELINES[iid]
                wave = 0.15 * math.sin(t / 20)  # slow oscillation for drama
                density = round(min(0.98, max(0.05, base + peak + wave + random.uniform(-0.05, 0.05))), 3)
                count = int(density * 80)
                
                state = {
                    "id": iid,
                    "count": count,
                    "density": density,
                    "emergency_confidence": 0.0,
                    "ts": datetime.now().isoformat()
                }
                r.set(f"{iid}:state", json.dumps(state), ex=10)
            
            await asyncio.sleep(1)
    except asyncio.CancelledError:
        pass # Task cancelled gracefully on shutdown

if __name__ == "__main__":
    try:
        asyncio.run(run_mock())
    except KeyboardInterrupt:
        print("\n🛑 Mock vision stopped gracefully.")
