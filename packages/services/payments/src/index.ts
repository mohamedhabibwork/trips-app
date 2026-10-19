// Payments service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "payments";
export {
  mapPaymentsError,
  PAYMENTS_ERROR_CODE_MAP,
  PaymentsServiceError,
  type PaymentsErrorCode,
} from "./errors";
export {
  DEFAULT_PLATFORM_COMMISSION_BPS,
  FAWRY_EXPIRY_HOURS,
  generateFawryReferenceCode,
  generateProviderReference,
} from "./model";
export { createPaymentsRepository, type PaymentsRepository } from "./repository";
export { routes } from "./routes";
export * from "./schemas";
export { createPaymentsService, type PaymentsService } from "./services";
export type * from "./types";
