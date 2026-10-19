// Staffing service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "staffing";
export { mapStaffingError, STAFFING_ERROR_CODE_MAP, StaffingServiceError } from "./errors";
export { computeTripStaffingGap, generateSixDigitStaffCode, TRIP_STAFF_SOURCES } from "./model";
export { routes } from "./routes";
export {
  assignVehicleStaffInputSchema,
  issueModeratorStaffCodeInputSchema,
  listTripStaffingInputSchema,
  revokeModeratorAssignmentInputSchema,
} from "./schemas/validation";
export { createStaffingService } from "./services";
export type * from "./types";
