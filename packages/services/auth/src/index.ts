// Auth service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "auth";
export { AUTH_ERROR_CODE_MAP, AuthServiceError, mapAuthError } from "./errors";
export { computeTotpCode } from "./model";
export { routes } from "./routes";
export { createAuthService } from "./services";
export type * from "./types";
