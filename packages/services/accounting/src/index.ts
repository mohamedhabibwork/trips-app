// Accounting service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "accounting";
export {
  ACCOUNTING_ERROR_CODE_MAP,
  AccountingServiceError,
  mapAccountingError,
  type AccountingErrorCode,
} from "./errors";
export type { AccountingSummary } from "./model";
export { createAccountingRepository, type AccountingRepository } from "./repository";
export { routes } from "./routes";
export * from "./schemas";
export { createAccountingService, type AccountingService } from "./services";
export type * from "./types";
