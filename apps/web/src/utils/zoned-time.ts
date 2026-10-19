// Wall-clock date and time in a named time zone (IANA, e.g. `Africa/Cairo`), to and from UTC.
// A trip's dates are entered in the trip's own time zone, whatever the browser's zone is.

export interface WallClock {
  /** `YYYY-MM-DD` */
  date: string;
  /** `HH:mm` (24-hour) */
  time: string;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

/** Offset of `timeZone` from UTC at `instant`, in milliseconds (Cairo in winter: +2 h). */
function zoneOffsetMs(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const asUtc = Date.UTC(
    value("year"),
    value("month") - 1,
    value("day"),
    value("hour"),
    value("minute"),
    value("second"),
  );
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/**
 * ISO instant of a wall-clock date and time in `timeZone`, or null when the date, the time or the
 * zone is not valid.
 */
export function zonedToUtcIso(wall: WallClock, timeZone: string): string | null {
  if (!DATE_PATTERN.test(wall.date) || !TIME_PATTERN.test(wall.time)) return null;
  const [year, month, day] = wall.date.split("-").map(Number) as [number, number, number];
  const [hour, minute] = wall.time.split(":").map(Number) as [number, number];
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  if (Number.isNaN(guess)) return null;
  try {
    // Two passes settle the offset when the guess and the answer sit on either side of a DST change.
    const first = guess - zoneOffsetMs(guess, timeZone);
    const instant = guess - zoneOffsetMs(first, timeZone);
    return new Date(instant).toISOString();
  } catch {
    return null;
  }
}

/** Wall-clock date and time of an instant in `timeZone`, or null for an invalid instant or zone. */
export function utcToZoned(value: string | Date, timeZone: string): WallClock | null {
  const instant = (value instanceof Date ? value : new Date(value)).getTime();
  if (Number.isNaN(instant)) return null;
  try {
    const shifted = new Date(instant + zoneOffsetMs(instant, timeZone)).toISOString();
    return { date: shifted.slice(0, 10), time: shifted.slice(11, 16) };
  } catch {
    return null;
  }
}
