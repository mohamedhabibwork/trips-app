// Tracking service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "tracking";
export {
  mapTrackingError,
  TRACKING_ERROR_CODE_MAP,
  TrackingServiceError,
  type TrackingErrorCode,
} from "./errors";
export type { TrackingAlertSeverity, TrackingCoordinates, TrackingEventType } from "./model";
export { createTrackingRepository, type TrackingRepository } from "./repository";
export { routes } from "./routes";
export * from "./schemas";
export { createTrackingService, type TrackingService } from "./services";
export type * from "./types";
