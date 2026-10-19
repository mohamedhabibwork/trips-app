// Locale-aware dates and amounts for the public and shared screens (SCR-SHR-10: dates and numbers
// follow the selected language).
import { formatMoney } from "@trips-app/ui/components/te-money";

const MINOR_UNITS = 100;

/** An amount stored in minor units (cents), shown with its currency code. */
export function formatMinorAmount(minor: number, currency: string, locale: string): string {
  return formatMoney(minor / MINOR_UNITS, currency, locale);
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "12 Mar" or "12–15 Mar 2026" style range; an unknown date gives an empty string. */
export function formatDateRange(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
  locale: string,
): string {
  const from = toDate(start);
  if (!from) return "";
  const to = toDate(end);
  const format = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return to ? format.formatRange(from, to) : format.format(from);
}

/** Date with time, e.g. for a maintenance window or a notification. */
export function formatDateTime(value: string | Date | null | undefined, locale: string): string {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

/** Date only, e.g. a deadline. */
export function formatDate(value: string | Date | null | undefined, locale: string): string {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);
}
