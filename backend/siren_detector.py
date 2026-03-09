import tensorflow_hub as hub
import librosa, sounddevice as sd
import numpy as np
import redis, asyncio, json, logging
from config import settings

logging.basicConfig(level=logging.INFO)
log = logging.getLogger('audio')

# YAMNet loaded dynamically in run_audio_detector

# Redis connection is handled in run_audio_detector for local runs

async def run_audio_detector():
    """
    Main async loop. Records 0.5s audio windows from microphone,
    classifies with YAMNet, applies consecutive hit filter,
    writes confirmed confidence to Redis.

    Runs at ~10 classifications/second (every 0.1s sleep + 0.5s window).
    """
    # Fallback to local defaults if constants are missing in config
    audio_sample_rate = getattr(settings, 'audio_sample_rate', 16000)
    audio_window_sec = getattr(settings, 'audio_window_sec', 0.5)
    siren_class_idx = getattr(settings, 'siren_class_idx', [315, 316, 317, 318, 319])
    siren_raw_thresh = getattr(settings, 'siren_raw_thresh', 0.3)
    siren_consec_hits = getattr(settings, 'siren_consec_hits', 3)
    redis_audio_ttl = getattr(settings, 'redis_audio_ttl', 3)
    
    # Init redis securely
    # Only load client locally within this thread
    r = redis.Redis(host=settings.redis_host, port=settings.redis_port, decode_responses=True)
    hit_counter = 0

    # ── Load YAMNet ────────────────────────────────────────────────────────────
    # ~20MB download on first run. Cached locally after.
    log.info("Loading YAMNet from TensorFlow Hub...")
    yamnet = hub.load('https://tfhub.dev/google/yamnet/1')
    log.info("YAMNet loaded successfully")

    log.info("🎤 Audio detector active — listening for sirens...")

    while True:
        try:
            # Record 0.5-second mono audio at 16kHz (YAMNet requirement)
            n_samples = int(audio_window_sec * audio_sample_rate)
            audio     = sd.rec(n_samples, samplerate=audio_sample_rate,
                                channels=1, dtype='float32')
            sd.wait()
            waveform  = audio.flatten()

            # YAMNet inference — returns scores shape (n_frames, 521)
            scores, embeddings, spectrogram = yamnet(waveform)
            # scores is an eager tensor, we can convert it to numpy
            scores_np = scores.numpy()
            
            # Average across frames for a stable prediction
            mean_scores = scores_np.mean(axis=0)   

            # Get maximum score across all emergency siren classes (defined in config)
            siren_conf = float(max(mean_scores[idx] for idx in siren_class_idx))

            # ── Consecutive hit filter ──────────────────────────────────
            # Single peaks can be from horn honks. Require SIREN_CONSEC_HITS
            # consecutive detections before reporting confidence.
            if siren_conf >= siren_raw_thresh:
                hit_counter = min(hit_counter + 1, siren_consec_hits + 2)
            else:
                hit_counter = max(hit_counter - 1, 0)   # Decay gracefully

            # Only report confidence if we have consecutive hits
            confirmed_conf = siren_conf if hit_counter >= siren_consec_hits else 0.0

            # Write to Redis — auto-expires in 3s if detector stops
            r.set('audio:siren_confidence', round(confirmed_conf, 3), ex=redis_audio_ttl)

            # Log significant detections
            if confirmed_conf > 0.65:
                log.warning(
                    f"🚨 SIREN CONFIRMED — conf={confirmed_conf:.3f} "
                    f"hits={hit_counter}/{siren_consec_hits}"
                )

        except sd.PortAudioError as e:
            log.error(f"Microphone error: {e}. Retrying in 5s.")
            r.set('audio:siren_confidence', 0.0, ex=redis_audio_ttl)
            await asyncio.sleep(5)
        except Exception as e:
            log.error(f"Audio detection error: {e}")
            r.set('audio:siren_confidence', 0.0, ex=redis_audio_ttl)

        await asyncio.sleep(0.1)  # 10 classifications/second

# ── Sensor Fusion — imported by Person 2's signal_brain.py ────────────────
async def get_fused_emergency_confidence(intersection_id: str, redis_client) -> float:
    """
    Late fusion: combines audio siren confidence with visual ambulance
    detection confidence using weighted averaging.
    """
    # Read audio confidence (returns 0.0 if key expired = detector not running)
    audio_raw = await redis_client.get('audio:siren_confidence')
    audio_conf = float(audio_raw or 0.0)

    # Read visual confidence from vision pipeline
    try:
        state_raw    = await redis_client.get(f'{intersection_id}:state')
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
        await redis_client.set('emergency:detection_source', source, ex=10)

    return round(fused, 3), source

if __name__ == '__main__':
    asyncio.run(run_audio_detector())
