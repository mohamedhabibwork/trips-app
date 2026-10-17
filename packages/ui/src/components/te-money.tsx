import { cn } from "@trips-app/ui/lib/utils";

export const TE_MONEY_DEFAULT_LOCALE = "en-US";

/**
 * Amount with its ISO currency code always shown (UI-06), for example "USD 1,250.00".
 * A malformed currency code or locale falls back to plain text instead of throwing.
 */
export function formatMoney(
  amount: number,
  currency: string,
  locale = TE_MONEY_DEFAULT_LOCALE,
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "code",
    }).format(amount);
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export interface TeMoneyProps {
  amount: number;
  currency: string;
  locale?: string;
  label?: string;
  className?: string;
}

export function TeMoney({ amount, currency, locale, label, className }: TeMoneyProps) {
  return (
    <span className={cn("te-money", className)}>
      {label ? <span className="te-money__label">{label}</span> : null}
      <data className="te-money__value" value={amount}>
        {formatMoney(amount, currency, locale)}
      </data>
    </span>
  );
}
