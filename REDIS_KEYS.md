# FlowAI Redis Integration Contract
# Agreed between Person 1 (write) and Person 2 (read)
# DO NOT CHANGE KEY NAMES AFTER DAY 2

## Person 1 writes, Person 2 reads:
CP_01:state     → JSON (count, density, emergency_confidence, ts) TTL=10s
AIIMS_01:state  → same schema
INA_01:state    → same schema
SAK_01:state    → same schema
NEHRU_01:state  → same schema
ROHINI_01:state → same schema
audio:siren_confidence → plain float, TTL=3s
{id}:health     → ISO timestamp string, TTL=15s
