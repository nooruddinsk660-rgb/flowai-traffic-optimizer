# REDIS KEY SCHEMA — THE TEAM CONTRACT

KEY NAME | TYPE | PAYLOAD / DESCRIPTION | TTL
--- | --- | --- | ---
`CP_01:state` | JSON | `{id, count:int, density:float, emergency_confidence:float, ts:ISO}` | TTL=10s
`AIIMS_01:state` | JSON | Same schema as above | TTL=10s
`audio:siren_confidence` | FLOAT | `0.0–1.0` · P1 audio module writes | TTL=3s
`{id}:health` | STR | ISO timestamp · P1 heartbeat | TTL=15s
`CP_01:signal` | JSON | `{active_direction, green_seconds, mode:"adaptive|EMERGENCY", density, aqi_penalty}` | TTL=120s
`emergency:active` | JSON | `{route, corridor:[], eta:int, source:"audio|visual|dual|manual", activated_at}` | TTL=300s
`aqi:{station_id}:pm25` | FLOAT | µg/m³ reading | TTL=600s
`forecast:{id}:30min` | JSON | `Array[{t_plus:int, density:float, level:"LOW|MEDIUM|HIGH"}]` | TTL=120s
