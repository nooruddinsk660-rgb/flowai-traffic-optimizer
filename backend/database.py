import aiosqlite, asyncio, json, logging
from datetime import datetime
from config import settings

log = logging.getLogger("db")
DB  = settings.db_path

async def init_db():
    """Create tables on startup. Safe to call if tables already exist."""
    async with aiosqlite.connect(DB) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS vehicle_history (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                intersection_id TEXT NOT NULL,
                ts             TEXT NOT NULL,
                density        REAL,
                vehicle_count  INTEGER,
                mode           TEXT,
                aqi_penalty    REAL
            )""")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_iid_ts ON vehicle_history (intersection_id, ts)")
        await db.commit()
    log.info("Database initialised")

async def log_intersection(iid: str, state: dict, signal: dict):
    """Insert one row per intersection per minute."""
    async with aiosqlite.connect(DB) as db:
        await db.execute(
            """INSERT INTO vehicle_history
               (intersection_id, ts, density, vehicle_count, mode, aqi_penalty)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (iid,
             datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
             state.get("density", 0.0),
             state.get("count", 0),
             signal.get("mode", "UNKNOWN"),
             signal.get("aqi_penalty", 0.0))
        )
        await db.commit()

async def get_history(iid: str, hours: int = 6) -> list:
    """Fetch vehicle history for time-series charts."""
    async with aiosqlite.connect(DB) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("""
            SELECT ts, density, vehicle_count, mode, aqi_penalty
            FROM vehicle_history
            WHERE intersection_id = ?
              AND ts > datetime('now', ?)
            ORDER BY ts ASC
            LIMIT 500""",
            (iid, f"-{hours} hours")
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

async def run_logging_loop(intersections: list, r):
    """Background task: log all intersections every 60 seconds."""
    # BUG FIX: was using raw r.get() which crashes if Redis is temporarily down.
    # Now imports and uses safe_redis_get wrapper.
    from signal_brain import safe_redis_get

    while True:
        await asyncio.sleep(60)
        log.info(f"💾 Logging {len(intersections)} intersections to SQLite history...")
        for node in intersections:
            try:
                iid      = node["id"]
                # BUG FIX: safe_redis_get never raises — returns None on failure
                state_r  = await safe_redis_get(r, f"{iid}:state")
                signal_r = await safe_redis_get(r, f"{iid}:signal")

                state_dict  = json.loads(state_r)  if state_r  else {}
                signal_dict = json.loads(signal_r) if signal_r else {}

                if state_dict:
                    await log_intersection(iid, state_dict, signal_dict)

            except Exception as e:
                log.warning(f"Log error for {node['id']}: {e}")
