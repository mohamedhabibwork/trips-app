import {
  CURRENCY_CODES,
  LEDGER_ENTRY_DIRECTIONS,
  LEDGER_ENTRY_STATUSES,
  LEDGER_ENTRY_TYPES,
  type CurrencyCode,
  type LedgerEntryDirection,
  type LedgerEntryStatus,
  type LedgerEntryType,
} from "@trips-app/domain";

export {
  CURRENCY_CODES,
  LEDGER_ENTRY_DIRECTIONS,
  LEDGER_ENTRY_STATUSES,
  LEDGER_ENTRY_TYPES,
  type CurrencyCode,
  type LedgerEntryDirection,
  type LedgerEntryStatus,
  type LedgerEntryType,
};

export interface AccountingSummary {
  grossRevenueMinor: number;
  platformCommissionMinor: number;
  refundsMinor: number;
  payoutsSettledMinor: number;
  availableBalanceMinor: number;
  currencyCode: CurrencyCode;
}
