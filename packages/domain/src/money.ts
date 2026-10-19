// Money is always an amount plus its currency code, never a bare number (DAT-06, IF-02).
// The amount is in minor units (for example piasters for EGP), so no float rounding happens here.
import type { CurrencyCode, Money } from "./types";

export function money(amountMinor: number, currency: CurrencyCode): Money {
  if (!Number.isInteger(amountMinor)) {
    throw new RangeError("Money amount must be an integer number of minor units");
  }
  return { amountMinor, currency };
}
