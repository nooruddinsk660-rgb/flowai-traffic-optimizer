# Redis Output Schemas

## 1. Intersection State
**Keys**: `{intersection_id}:state`
(Example: `CP_01:state`, `AIIMS_01:state`, `INA_01:state`, `SAK_01:state`, `NEHRU_01:state`, `ROHINI_01:state`)
**Owner**: Person 1
**Written**: Every 1 second
**TTL**: 10 seconds
**Format**: JSON

```json
{
  "id": "CP_01", 
  "count": 47, 
  "density": 0.783, 
  "emergency_confidence": 0.0, 
  "ts": "2026-03-28T09:14:22" 
}
```

* `id` (String): Must match intersection_id exactly.
* `count` (Integer): Raw vehicle count from YOLO.
* `density` (Float): 0.000–1.000. `count / MAX_CAPACITY (60)`.
* `emergency_confidence` (Float): 0.0–1.0. 0.0 unless ambulance detected ≥85%.
* `ts` (String): ISO 8601 timestamp string.

## 2. Audio Siren Confidence
**Key**: `audio:siren_confidence`
**Owner**: Person 1
**Written**: 10 times per second
**TTL**: 3 seconds
**Format**: Float (Plain text string representation of float, not JSON)

Example Value: `0.873`

* Range: 0.0 (no siren) to 1.0 (confident siren detection).

## 3. Vision Pipeline Health Heartbeat
**Key**: `{intersection_id}:health`
**Owner**: Person 1
**Written**: Every 5 seconds
**TTL**: 15 seconds
**Format**: String (ISO 8601 timestamp)

Example Value: `"2026-03-28T09:14:25"`
