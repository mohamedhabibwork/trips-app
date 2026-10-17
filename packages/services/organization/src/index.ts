// Organization service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "organization";
export {
  mapOrganizationError,
  ORGANIZATION_ERROR_CODE_MAP,
  OrganizationServiceError,
} from "./errors";
export { routes } from "./routes";
export { createOrganizationService } from "./services";
export type * from "./types";
