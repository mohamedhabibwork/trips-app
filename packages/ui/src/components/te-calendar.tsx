import { cn } from "@trips-app/ui/lib/utils";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { t } from "@trips-app/i18n";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

/** 0 = Sunday ... 6 = Saturday. Middle East calendars usually start on Saturday (6). */
export type TeCalendarWeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const TE_CALENDAR_DEFAULT_WEEK_START: TeCalendarWeekStart = 6;
const DAYS_PER_WEEK = 7;
const MONTH_PATTERN = /^(\d{4})-(\d{2})$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
/** 2024-01-07 was a Sunday. Used to label weekday headers without depending on today. */
const REFERENCE_SUNDAY = { year: 2024, monthIndex: 0, day: 7 } as const;

export interface TeCalendarDay {
  /** ISO date, YYYY-MM-DD. */
  iso: string;
  day: number;
}

/** One week, Sunday-to-Saturday order from weekStartsOn. Null marks days outside the month. */
export type TeCalendarWeek = (TeCalendarDay | null)[];

function utcDate(year: number, monthIndex: number, day: number): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, monthIndex, day);
  return date;
}

function toIsoDate(date: Date): string {
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * ISO date (YYYY-MM-DD) for a year, a 0-based month index and a day of month.
 * Out-of-range values roll over the way Date does, so isoDate(2026, 0, 32) is 2026-02-01.
 */
export function isoDate(year: number, monthIndex: number, day: number): string {
  return toIsoDate(utcDate(year, monthIndex, day));
}

function parseMonth(month: string): { year: number; monthIndex: number } | null {
  const match = MONTH_PATTERN.exec(month);
  if (!match) return null;
  const monthNumber = Number(match[2]);
  if (monthNumber < 1 || monthNumber > 12) return null;
  return { year: Number(match[1]), monthIndex: monthNumber - 1 };
}

/** Returns the ISO date when it is a real calendar date, otherwise undefined. */
function normalizeIsoDate(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const match = DATE_PATTERN.exec(value);
  if (!match) return undefined;
  const iso = isoDate(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return iso === value ? iso : undefined;
}

function shiftMonth(month: string, deltaMonths: number): string {
  const parsed = parseMonth(month);
  if (!parsed) return month;
  return toIsoDate(utcDate(parsed.year, parsed.monthIndex + deltaMonths, 1)).slice(0, 7);
}

function shiftIsoDate(iso: string, deltaDays: number): string {
  const normalized = normalizeIsoDate(iso);
  if (!normalized) return iso;
  const date = utcDate(
    Number(normalized.slice(0, 4)),
    Number(normalized.slice(5, 7)) - 1,
    Number(normalized.slice(8, 10)) + deltaDays,
  );
  return toIsoDate(date);
}

/**
 * Weeks of one month as rows of seven cells, starting on weekStartsOn.
 * Leading and trailing cells outside the month are null. Throws on a malformed YYYY-MM.
 */
export function buildMonthGrid(month: string, weekStartsOn: TeCalendarWeekStart): TeCalendarWeek[] {
  const parsed = parseMonth(month);
  if (!parsed) throw new RangeError(`Expected a YYYY-MM month, received "${month}"`);
  const { year, monthIndex } = parsed;
  const firstWeekday = utcDate(year, monthIndex, 1).getUTCDay();
  const daysInMonth = utcDate(year, monthIndex + 1, 0).getUTCDate();
  const leadingBlanks = (firstWeekday - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK;

  const cells: TeCalendarWeek = [];
  for (let blank = 0; blank < leadingBlanks; blank += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ iso: isoDate(year, monthIndex, day), day });
  }
  while (cells.length % DAYS_PER_WEEK !== 0) cells.push(null);

  const weeks: TeCalendarWeek[] = [];
  for (let start = 0; start < cells.length; start += DAYS_PER_WEEK) {
    weeks.push(cells.slice(start, start + DAYS_PER_WEEK));
  }
  return weeks;
}

function weekdayHeaders(weekStartsOn: TeCalendarWeekStart): { short: string; long: string }[] {
  const shortFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", timeZone: "UTC" });
  const longFormat = new Intl.DateTimeFormat(undefined, { weekday: "long", timeZone: "UTC" });
  return Array.from({ length: DAYS_PER_WEEK }, (_, offset) => {
    const weekday = (weekStartsOn + offset) % DAYS_PER_WEEK;
    const date = utcDate(
      REFERENCE_SUNDAY.year,
      REFERENCE_SUNDAY.monthIndex,
      REFERENCE_SUNDAY.day + weekday,
    );
    return { short: shortFormat.format(date), long: longFormat.format(date) };
  });
}

function formatMonthTitle(month: string): string {
  const parsed = parseMonth(month);
  if (!parsed) return month;
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(utcDate(parsed.year, parsed.monthIndex, 1));
}

function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(
    utcDate(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10))),
  );
}

/** The day that holds the roving tab stop: the last focused day, else the selection, else the 1st. */
function resolveFocusDate(
  visibleMonth: string,
  focusedIso: string | undefined,
  selected: string | undefined,
): string {
  if (focusedIso?.startsWith(visibleMonth)) return focusedIso;
  if (selected?.startsWith(visibleMonth)) return selected;
  return `${visibleMonth}-01`;
}

function todayIsoDate(): string {
  const now = new Date();
  return isoDate(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Arrow key to day offset. Left and right swap in RTL. */
function arrowKeyDelta(key: string, rtl: boolean): number | undefined {
  switch (key) {
    case "ArrowLeft":
      return rtl ? 1 : -1;
    case "ArrowRight":
      return rtl ? -1 : 1;
    case "ArrowUp":
      return -DAYS_PER_WEEK;
    case "ArrowDown":
      return DAYS_PER_WEEK;
    default:
      return undefined;
  }
}

export interface TeCalendarProps {
  /** Visible label above the grid. Names the table for assistive technology. */
  label: string;
  /** Selected ISO date, YYYY-MM-DD. */
  value?: string;
  onValueChange: (value: string) => void;
  /** Visible month as ISO YYYY-MM. Omit to let the calendar manage it. */
  month?: string;
  onMonthChange?: (month: string) => void;
  /** Earliest selectable ISO date. */
  minDate?: string;
  /** Latest selectable ISO date. */
  maxDate?: string;
  /** 0 = Sunday ... 6 = Saturday. Defaults to 6 (Saturday). */
  weekStartsOn?: TeCalendarWeekStart;
  className?: string;
}

export function TeCalendar({
  label,
  value,
  onValueChange,
  month,
  onMonthChange,
  minDate,
  maxDate,
  weekStartsOn = TE_CALENDAR_DEFAULT_WEEK_START,
  className,
}: TeCalendarProps) {
  const labelId = useId();
  const tableRef = useRef<HTMLTableElement>(null);
  const focusRequested = useRef(false);
  const selected = normalizeIsoDate(value);
  const today = todayIsoDate();
  const earliest = normalizeIsoDate(minDate);
  const latest = normalizeIsoDate(maxDate);
  const initialMonth = (selected ?? today).slice(0, 7);
  const [uncontrolledMonth, setUncontrolledMonth] = useState(initialMonth);
  const [focusedIso, setFocusedIso] = useState<string | undefined>(undefined);

  const requestedMonth = month ?? uncontrolledMonth;
  const visibleMonth = parseMonth(requestedMonth) ? requestedMonth : initialMonth;
  const focusDate = resolveFocusDate(visibleMonth, focusedIso, selected);

  useEffect(() => {
    if (!focusRequested.current) return;
    focusRequested.current = false;
    tableRef.current?.querySelector<HTMLButtonElement>(`button[data-date="${focusDate}"]`)?.focus();
  }, [focusDate, visibleMonth]);

  function changeMonth(next: string) {
    if (month === undefined) setUncontrolledMonth(next);
    onMonthChange?.(next);
  }

  function moveFocus(deltaDays: number) {
    const target = shiftIsoDate(focusDate, deltaDays);
    focusRequested.current = true;
    setFocusedIso(target);
    const targetMonth = target.slice(0, 7);
    if (targetMonth !== visibleMonth) changeMonth(targetMonth);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    const rtl = event.currentTarget.closest("[dir='rtl']") !== null;
    const delta = arrowKeyDelta(event.key, rtl);
    if (delta === undefined) return;
    event.preventDefault();
    moveFocus(delta);
  }

  function isDisabled(iso: string): boolean {
    return (earliest !== undefined && iso < earliest) || (latest !== undefined && iso > latest);
  }

  function selectDay(iso: string) {
    if (isDisabled(iso)) return;
    onValueChange(iso);
  }

  const weeks = buildMonthGrid(visibleMonth, weekStartsOn);
  const headers = weekdayHeaders(weekStartsOn);
  const headingId = `${labelId}-month`;

  return (
    <div className={cn("te-calendar", className)}>
      <p id={labelId} className="te-calendar__label">
        {label}
      </p>
      <div className="te-calendar__header">
        <TeButton
          variant="ghost"
          aria-label={t("ui.teCalendar.previousMonth")}
          className="te-calendar__nav"
          onClick={() => changeMonth(shiftMonth(visibleMonth, -1))}
        >
          <TeIcon name="back" flipInRtl />
        </TeButton>
        <p id={headingId} className="te-calendar__month" aria-live="polite">
          {formatMonthTitle(visibleMonth)}
        </p>
        <TeButton
          variant="ghost"
          aria-label={t("ui.teCalendar.nextMonth")}
          className="te-calendar__nav"
          onClick={() => changeMonth(shiftMonth(visibleMonth, 1))}
        >
          <TeIcon name="arrow" flipInRtl />
        </TeButton>
      </div>
      <table
        ref={tableRef}
        className="te-calendar__grid"
        aria-labelledby={labelId}
        onKeyDown={handleKeyDown}
      >
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header.long} scope="col" abbr={header.long} className="te-calendar__weekday">
                {header.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((cell, cellIndex) => {
                if (cell === null) {
                  return <td key={cellIndex} className="te-calendar__cell" />;
                }
                const isSelected = cell.iso === selected;
                const isToday = cell.iso === today;
                const disabled = isDisabled(cell.iso);
                return (
                  <td key={cellIndex} className="te-calendar__cell">
                    <button
                      type="button"
                      data-date={cell.iso}
                      tabIndex={cell.iso === focusDate ? 0 : -1}
                      aria-label={
                        isSelected
                          ? t("ui.teCalendar.dateSelected", { date: formatLongDate(cell.iso) })
                          : formatLongDate(cell.iso)
                      }
                      aria-current={isToday ? "date" : undefined}
                      aria-disabled={disabled || undefined}
                      className={cn(
                        "te-calendar__day",
                        isSelected && "te-calendar__day--selected",
                        isToday && "te-calendar__day--today",
                        disabled && "te-calendar__day--disabled",
                      )}
                      onClick={() => selectDay(cell.iso)}
                    >
                      {cell.day}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
