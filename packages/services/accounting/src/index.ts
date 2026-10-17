// Accounting service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "accounting";
export { ACCOUNTING_ERROR_CODE_MAP, AccountingServiceError, mapAccountingError } from "./errors";
export { routes } from "./routes";
export type * from "./types";
