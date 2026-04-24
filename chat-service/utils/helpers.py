from datetime import datetime, timezone

def utc_now_ms() -> int:
    return int(datetime.now(timezone.utc).timestamp() * 1000)

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def date_to_utc_ms(dt: datetime) -> int:
    return int(dt.replace(tzinfo=timezone.utc).timestamp() * 1000)
