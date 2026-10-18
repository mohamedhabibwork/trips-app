// Formatting shared by the finance and operations pages: money in the currency the data carries,
// dates in the reader's language, and a CSV download built from the rows already on screen.
import { formatMoney } from "@trips-app/ui/components/te-money";

import { NO_VALUE } from "../common/org-ui";

const MINOR_PER_MAJOR = 100;

/** Intl locale of the app language (Arabic uses Egyptian Arabic formatting). */
export function intlLocale(locale: string): string {
  return locale === "ar" ? "ar-EG" : "en-US";
}

/** An amount held in minor units, with its ISO currency code, e.g. "EGP 1,250.00". */
export function formatMinor(minor: number, currency: string, locale: string): string {
  return formatMoney(minor / MINOR_PER_MAJOR, currency, intlLocale(locale));
}

/** An amount in minor units without its currency (for tables with a separate currency column). */
export function formatMinorNumber(minor: number, locale: string): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minor / MINOR_PER_MAJOR);
}

export interface MinorAmount {
  minor: number;
  currency: string;
}

/** Totals per currency, so amounts in different currencies are never added together. */
export function sumByCurrency(amounts: readonly MinorAmount[]): ReadonlyMap<string, number> {
  const totals = new Map<string, number>();
  for (const amount of amounts) {
    totals.set(amount.currency, (totals.get(amount.currency) ?? 0) + amount.minor);
  }
  return totals;
}

/** Every currency's total, joined; NO_VALUE when there is nothing to total. */
export function formatTotals(totals: ReadonlyMap<string, number>, locale: string): string {
  if (totals.size === 0) return NO_VALUE;
  return [...totals.entries()]
    .map(([currency, minor]) => formatMinor(minor, currency, locale))
    .join(" · ");
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | Date | null | undefined, locale: string): string {
  const date = toDate(value);
  if (!date) return NO_VALUE;
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium" }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined, locale: string): string {
  const date = toDate(value);
  if (!date) return NO_VALUE;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatTime(value: string | Date | null | undefined, locale: string): string {
  const date = toDate(value);
  if (!date) return NO_VALUE;
  return new Intl.DateTimeFormat(intlLocale(locale), { timeStyle: "short" }).format(date);
}

/** Short reference of a record id, as shown to people (first 8 characters, upper case). */
export function shortRef(id: string | null | undefined): string {
  return id ? id.slice(0, 8).toUpperCase() : NO_VALUE;
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

/** Saves the given rows as a CSV file in the browser. */
export function downloadCsv(fileName: string, rows: readonly (readonly string[])[]): void {
  if (typeof document === "undefined") return;
  const body = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${body}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export type Period = "all" | "month" | "30d" | "year";

const DAY_MS = 24 * 60 * 60 * 1000;
const THIRTY_DAYS = 30;

/** First moment of a reporting period ending now; null for all time. */
export function periodStart(period: Period, now: Date): Date | null {
  switch (period) {
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "30d":
      return new Date(now.getTime() - THIRTY_DAYS * DAY_MS);
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    case "all":
      return null;
  }
}

/** The ledger entry fields these pages read (accounting.listLedgerEntries). */
export interface LedgerEntryView {
  id: string;
  tripId: string | null;
  bookingId: string | null;
  entryType: string;
  direction: string;
  grossAmountMinor: number;
  netAmountMinor: number;
  currencyCode: string;
  status: string;
  invoiceNumber: string | null;
  description: string;
  occurredAt: string | Date;
  createdAt: string | Date;
}

/** The booking fields these pages read (booking.listOrganizationBookings). */
export interface BookingView {
  id: string;
  tripId: string;
  bookingReference: string;
  passengersCount: number;
  couponId: string | null;
  subtotalMinor: number;
  programsTotalMinor: number;
  discountMinor: number;
  totalAmountMinor: number;
  currencyCode: string;
  status: string;
  createdAt: string | Date;
}

/** The check-in fields these pages read (checkIn.listTripManifest). */
export interface CheckInView {
  id: string;
  vehicleId: string | null;
  passengerName: string;
  status: string;
}

/** Rows of a query whose output type may be loose: typed as the fields a page reads. */
export function rowsOf<T>(data: unknown): readonly T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}
