// Check-in service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "check-in";
export {
  CHECK_IN_ERROR_CODE_MAP,
  CheckInServiceError,
  mapCheckInError,
  type CheckInErrorCode,
} from "./errors";
export type { CheckInMethod, CheckInStatus } from "./model";
export { createCheckInRepository, type CheckInRepository } from "./repository";
export { routes } from "./routes";
export * from "./schemas";
export { createCheckInService, type CheckInService } from "./services";
export type * from "./types";
