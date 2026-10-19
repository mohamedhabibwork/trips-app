import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
  type SharedErrorCode,
} from "@trips-app/domain";

export type { SharedErrorCode };

export type AccountingErrorCode =
  | "ACCOUNTING_NOT_FOUND"
  | "LEDGER_ENTRY_NOT_FOUND"
  | "INSUFFICIENT_SETTLEMENT_BALANCE";

export const ACCOUNTING_ERROR_CODE_MAP: Readonly<Record<AccountingErrorCode, SharedErrorCode>> = {
  ACCOUNTING_NOT_FOUND: "RESOURCE_NOT_FOUND",
  LEDGER_ENTRY_NOT_FOUND: "RESOURCE_NOT_FOUND",
  INSUFFICIENT_SETTLEMENT_BALANCE: "CONFLICT",
};

export class AccountingServiceError extends ServiceError {
  constructor(
    code: AccountingErrorCode | SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    const sharedCode =
      code in ACCOUNTING_ERROR_CODE_MAP
        ? ACCOUNTING_ERROR_CODE_MAP[code as AccountingErrorCode]
        : (code as SharedErrorCode);
    super(sharedCode, message, detailsOrOptions, "accounting");
    this.name = "AccountingServiceError";
  }
}

export const mapAccountingError = createServiceErrorMapper("accounting", ACCOUNTING_ERROR_CODE_MAP);
