// Parent service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "parent";
export {
  mapParentError,
  PARENT_ERROR_CODE_MAP,
  ParentServiceError,
  type ParentErrorCode,
} from "./errors";
export type { ParentChildLinkStatus } from "./model";
export { createParentRepository, type ParentRepository } from "./repository";
export { routes } from "./routes";
export * from "./schemas";
export { createParentService, type ParentService } from "./services";
export type * from "./types";
