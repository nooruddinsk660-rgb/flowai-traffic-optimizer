import numpy as np
import sounddevice as sd
import tensorflow as tf
import tensorflow_hub as hub
import redis, os, time, logging
import asyncio
import json
from signal_brain import safe_redis_get, safe_redis_set
from constants import AUDIO_SIREN_KEY

log = logging.getLogger("siren")
r = redis.Redis(host=os.getenv("REDIS_HOST","localhost"), decode_responses=True)

# YAMNet siren class indices (emergency vehicle sirens)
SIREN_CLASSES = {397, 398, 399, 400}  # ambulance, fire, police sirens
SAMPLE_RATE = 16000
CHUNK_SECONDS = 0.96  # YAMNet window size

print("Loading YAMNet...")
model = hub.load('https://tfhub.dev/google/yamnet/1')
print("✅ YAMNet loaded")

def analyze_chunk(audio_chunk) -> float:
    waveform = tf.constant(audio_chunk, dtype=tf.float32)
    scores, _, _ = model(waveform)
    mean_scores = tf.reduce_mean(scores, axis=0).numpy()
    siren_conf = float(np.max([mean_scores[i] for i in SIREN_CLASSES]))
    return siren_conf

def run():
    print("🎙️ Siren detector listening...")
    chunk_size = int(SAMPLE_RATE * CHUNK_SECONDS)
    while True:
        try:
            audio = sd.rec(chunk_size, samplerate=SAMPLE_RATE, channels=1, dtype='float32', blocking=True)
            conf = analyze_chunk(audio.flatten())
            r.set(AUDIO_SIREN_KEY, round(conf, 3), ex=3)
            if conf > 0.5:
                log.warning(f"🔊 Siren detected! confidence={conf:.3f}")
        except Exception as e:
            log.error(f"Audio error: {e}")
        time.sleep(1)

async def run_audio_detector():
    """Async wrapper to be attached to main.py event loop"""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, run)

# ── Sensor Fusion — imported by Person 2's signal_brain.py ────────────────
async def get_fused_emergency_confidence(intersection_id: str, redis_client):
    """
    Late fusion: combines audio siren confidence with visual ambulance
    detection confidence using weighted averaging.
    """
    # Read audio confidence (returns 0.0 if key expired = detector not running)
    audio_raw = await safe_redis_get(redis_client, AUDIO_SIREN_KEY)
    audio_conf = float(audio_raw or 0.0)

    # Read visual confidence from vision pipeline
    try:
        state_raw    = await safe_redis_get(redis_client, f'{intersection_id}:state')
        visual_conf  = json.loads(state_raw).get('emergency_confidence', 0.0) if state_raw else 0.0
    except:
        visual_conf = 0.0

    # ── Late fusion formula ────────────────────────────────────────────────
    fused = (audio_conf * 0.55) + (visual_conf * 0.45)

    # High single-modality override: at these levels, false positive <2%
    if audio_conf  > 0.88: fused = max(fused, audio_conf)
    if visual_conf > 0.92: fused = max(fused, visual_conf)

    # Determine detection source for Person 3's dashboard badge
    source = "none"
    if audio_conf > 0.50 and visual_conf > 0.50: source = "dual"
    elif audio_conf > 0.50: source = "audio"
    elif visual_conf > 0.50: source = "visual"

    # Cache detection source so Person 3 can display 🔊/👁/🔊+👁 badge
    if fused > 0.40:
        await safe_redis_set(redis_client, 'emergency:detection_source', source, ex=10)

    return round(fused, 3), source

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run()
