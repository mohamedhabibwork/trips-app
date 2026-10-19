import type {
  CurrencyCode,
  LedgerEntryDirection,
  LedgerEntryStatus,
  LedgerEntryType,
} from "@trips-app/domain";

export type { CurrencyCode, LedgerEntryDirection, LedgerEntryStatus, LedgerEntryType };

export interface AccountingSummary {
  grossRevenueMinor: number;
  platformCommissionMinor: number;
  refundsMinor: number;
  payoutsSettledMinor: number;
  availableBalanceMinor: number;
  currencyCode: CurrencyCode;
}
