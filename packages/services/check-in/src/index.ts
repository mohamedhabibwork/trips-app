// Check In service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "check-in";
export { CHECK_IN_ERROR_CODE_MAP, CheckInServiceError, mapCheckInError } from "./errors";
export { routes } from "./routes";
export type * from "./types";
