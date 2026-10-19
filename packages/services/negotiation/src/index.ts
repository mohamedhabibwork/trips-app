// Negotiation service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "negotiation";
export { mapNegotiationError, NEGOTIATION_ERROR_CODE_MAP, NegotiationServiceError } from "./errors";
export {
  isActiveNegotiationStatus,
  NEGOTIATION_STATUSES,
  PLATFORM_SUPPLIER_ROLES,
  SUPPORTED_CURRENCIES,
} from "./model";
export { routes } from "./routes";
export {
  createNegotiationOfferInputSchema,
  listNegotiationsInputSchema,
  respondNegotiationOfferInputSchema,
} from "./schemas/validation";
export { createNegotiationService } from "./services";
export type * from "./types";
