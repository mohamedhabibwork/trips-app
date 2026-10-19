// Trips service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "trips";
export { mapTripsError, TRIPS_ERROR_CODE_MAP, TripsServiceError } from "./errors";
export {
  CANCELLABLE_TRIP_STATES,
  canCancelTripState,
  canTransitionTripState,
  computeHasStaffingGap,
  DEFAULT_WIZARD_STEPS,
  isTripEligibleForTravelerDiscovery,
  isValidTripCategoryCode,
  PUBLIC_DISCOVERABLE_TRIP_STATES,
  SUPPORTED_CURRENCIES,
  SUPPORTED_LOCALES,
  TRIP_PUBLISH_MODES,
  TRIP_SEAT_ASSIGNMENT_MODES,
  TRIP_STAFF_SOURCES,
  TRIP_STATES,
} from "./model";
export { routes } from "./routes";
export {
  browsePublicTripsInputSchema,
  cancelTripInputSchema,
  createDraftTripInputSchema,
  getOrganizationTripInputSchema,
  getPublicTripDetailInputSchema,
  listOrganizationTripsInputSchema,
  moneyInputSchema,
  publishTripInputSchema,
  saveWizardStepInputSchema,
  transitionTripStateInputSchema,
  tripRoutePointSchema,
} from "./schemas/validation";
export { createTripsService } from "./services";
export type * from "./types";
