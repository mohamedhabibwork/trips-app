// Negotiation service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "negotiation";
export { NEGOTIATION_ERROR_CODE_MAP, NegotiationServiceError, mapNegotiationError } from "./errors";
export { routes } from "./routes";
export type * from "./types";
