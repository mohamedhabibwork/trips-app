// Money and query helpers shared by the finance screens (SCR-ADM-25..28). Amounts arrive in minor
// units with an ISO currency code; every amount on screen shows its code (UI-06).
import { formatMoney } from "@trips-app/ui/components/te-money";

const MINOR_UNITS_PER_MAJOR = 100;

export const SUPPORTED_PAYOUT_CURRENCIES = ["EGP", "SAR", "AED"] as const;
export type PayoutCurrency = (typeof SUPPORTED_PAYOUT_CURRENCIES)[number];

export function isPayoutCurrency(code: string): code is PayoutCurrency {
  return (SUPPORTED_PAYOUT_CURRENCIES as readonly string[]).includes(code);
}

/** "EGP 1,250.00" from 125000 minor units. */
export function formatMinor(amountMinor: number, currency: string, locale?: string): string {
  return formatMoney(amountMinor / MINOR_UNITS_PER_MAJOR, currency, locale);
}

export interface CurrencyTotal {
  currency: string;
  amountMinor: number;
}

/** Sums amounts per currency; amounts in different currencies are never added together. */
export function totalsByCurrency(
  items: readonly { amountMinor: number; currency: string }[],
): readonly CurrencyTotal[] {
  const totals = items.reduce<ReadonlyMap<string, number>>(
    (acc, item) =>
      new Map(acc).set(item.currency, (acc.get(item.currency) ?? 0) + item.amountMinor),
    new Map(),
  );
  return [...totals.entries()].map(([currency, amountMinor]) => ({ currency, amountMinor }));
}

/** One line per currency, or an em dash when there is nothing to total. */
export function formatTotals(totals: readonly CurrencyTotal[], locale?: string): string {
  if (totals.length === 0) return "—";
  return totals.map((total) => formatMinor(total.amountMinor, total.currency, locale)).join(" · ");
}

export interface QueryLike {
  isPending: boolean;
  isError: boolean;
  refetch: () => unknown;
}

/** Several queries seen as one by AdminQueryState: loading or failed if any of them is. */
export function combineQueries(queries: readonly QueryLike[]): QueryLike {
  return {
    isPending: queries.some((query) => query.isPending),
    isError: queries.some((query) => query.isError),
    refetch: () => queries.filter((query) => query.isError).forEach((query) => query.refetch()),
  };
}

/** The Monday (UTC) of the week a date falls in, as YYYY-MM-DD. */
export function weekStart(value: string | Date): string {
  const date = new Date(value);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  const monday = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - daysSinceMonday),
  );
  return monday.toISOString().slice(0, 10);
}

export function formatDate(value: string | Date, locale?: string): string {
  return new Date(value).toLocaleDateString(locale);
}
