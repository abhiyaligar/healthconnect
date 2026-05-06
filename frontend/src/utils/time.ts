/**
 * Time utility — all display times are in IST (Asia/Kolkata, UTC+5:30)
 */

const IST = 'Asia/Kolkata';

/** Format a UTC ISO string to IST time display e.g. "09:30 AM" */
export function toISTTime(utcString: string): string {
  if (!utcString) return '--';
  return new Date(utcString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: IST,
  });
}

/** Format a UTC ISO string to IST date display e.g. "Monday, 6 May 2026" */
export function toISTDate(utcString: string): string {
  if (!utcString) return '--';
  return new Date(utcString).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: IST,
  });
}

/** Format to short date e.g. "06/05/2026" */
export function toISTShortDate(utcString: string): string {
  if (!utcString) return '--';
  return new Date(utcString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: IST,
  });
}

/** Get today's date in IST as YYYY-MM-DD (for date pickers) */
export function todayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: IST }); // en-CA gives YYYY-MM-DD
}

/** Combined date + time for display e.g. "06/05/2026 · 09:30 AM" */
export function toISTDateTime(utcString: string): string {
  if (!utcString) return '--';
  return `${toISTShortDate(utcString)} · ${toISTTime(utcString)}`;
}
