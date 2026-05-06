"""
Shared IST (Asia/Kolkata, UTC+5:30) time formatting utilities.
All datetime values stored in DB are UTC — always convert before displaying to users.
"""
import pytz
from datetime import datetime

IST = pytz.timezone("Asia/Kolkata")


def to_ist(dt: datetime) -> datetime:
    """Convert a UTC datetime to IST-aware datetime."""
    if dt is None:
        return dt
    if dt.tzinfo is None:
        dt = pytz.utc.localize(dt)
    return dt.astimezone(IST)


def ist_date_str(dt: datetime) -> str:
    """Return IST date as 'DD Mon YYYY', e.g. '06 May 2026'."""
    if dt is None:
        return "N/A"
    return to_ist(dt).strftime("%d %b %Y")


def ist_time_str(dt: datetime) -> str:
    """Return IST time as '02:50 PM IST'."""
    if dt is None:
        return "N/A"
    return to_ist(dt).strftime("%I:%M %p") + " IST"


def ist_datetime_str(dt: datetime) -> str:
    """Return full IST datetime as '06 May 2026, 02:50 PM IST'."""
    if dt is None:
        return "N/A"
    return to_ist(dt).strftime("%d %b %Y, %I:%M %p") + " IST"
