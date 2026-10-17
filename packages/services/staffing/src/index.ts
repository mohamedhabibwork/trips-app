// Staffing service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "staffing";
export { STAFFING_ERROR_CODE_MAP, StaffingServiceError, mapStaffingError } from "./errors";
export { routes } from "./routes";
export type * from "./types";
