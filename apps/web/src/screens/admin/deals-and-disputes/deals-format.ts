// Formatting helpers shared by the deal and dispute screens (SCR-ADM-21..24). Amounts arrive in
// minor units with an ISO currency code; every amount on screen shows its code (UI-06).
import { formatMoney } from "@trips-app/ui/components/te-money";

const MINOR_UNITS_PER_MAJOR = 100;
const SHORT_ID_LENGTH = 8;
const FRIDAY = 5;
const SATURDAY = 6;

/** Days after which an open dispute is overdue for acknowledgement or resolution. */
export const ACKNOWLEDGE_WITHIN_WORKING_DAYS = 2;
export const RESOLVE_WITHIN_WORKING_DAYS = 10;

/** "EGP 1,250.00" from 125000 minor units. */
export function formatMinor(amountMinor: number, currency: string, locale?: string): string {
  return formatMoney(amountMinor / MINOR_UNITS_PER_MAJOR, currency, locale);
}

/** Major units as typed in a form ("1250.50") to minor units, or null when not a positive number. */
export function parseMajorToMinor(value: string): number | null {
  const amount = Number.parseFloat(value.replace(/,/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * MINOR_UNITS_PER_MAJOR);
}

export function minorToMajorInput(amountMinor: number): string {
  return (amountMinor / MINOR_UNITS_PER_MAJOR).toFixed(2);
}

/** The first characters of a UUID, for references when no human-readable name is available. */
export function shortId(id: string | null | undefined): string {
  return id ? id.slice(0, SHORT_ID_LENGTH).toUpperCase() : "—";
}

export function formatDateTime(value: string | Date, locale?: string): string {
  return new Date(value).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
}

/** Working days elapsed since a date, skipping Friday and Saturday (the MENA weekend). */
export function workingDaysSince(start: string | Date, now: Date = new Date()): number {
  const cursor = new Date(start);
  let count = 0;
  while (cursor.getTime() < now.getTime()) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const day = cursor.getUTCDay();
    if (day !== FRIDAY && day !== SATURDAY && cursor.getTime() <= now.getTime()) count += 1;
  }
  return count;
}
