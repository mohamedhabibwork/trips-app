// Admin service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "admin";
export { ADMIN_ERROR_CODE_MAP, AdminServiceError, mapAdminError } from "./errors";
export { routes } from "./routes";
export { createAdminService } from "./services";
export type * from "./types";
