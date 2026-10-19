// Moderator service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "moderator";
export {
  mapModeratorError,
  MODERATOR_ERROR_CODE_MAP,
  ModeratorServiceError,
  type ModeratorErrorCode,
} from "./errors";
export type { ModeratorAssignmentSummary } from "./model";
export { createModeratorRepository, type ModeratorRepository } from "./repository";
export { routes } from "./routes";
export * from "./schemas";
export { createModeratorService, type ModeratorService } from "./services";
export type * from "./types";
