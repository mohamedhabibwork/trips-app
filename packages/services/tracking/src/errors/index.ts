import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
  type SharedErrorCode,
} from "@trips-app/domain";

export type { SharedErrorCode };

export type TrackingErrorCode =
  | "TRACKING_NOT_FOUND"
  | "TRIP_NOT_FOUND"
  | "FORBIDDEN_TRACKING_ACCESS";

export const TRACKING_ERROR_CODE_MAP: Readonly<Record<TrackingErrorCode, SharedErrorCode>> = {
  TRACKING_NOT_FOUND: "RESOURCE_NOT_FOUND",
  TRIP_NOT_FOUND: "RESOURCE_NOT_FOUND",
  FORBIDDEN_TRACKING_ACCESS: "FORBIDDEN",
};

export class TrackingServiceError extends ServiceError {
  constructor(
    code: TrackingErrorCode | SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    const sharedCode =
      code in TRACKING_ERROR_CODE_MAP
        ? TRACKING_ERROR_CODE_MAP[code as TrackingErrorCode]
        : (code as SharedErrorCode);
    super(sharedCode, message, detailsOrOptions, "tracking");
    this.name = "TrackingServiceError";
  }
}

export const mapTrackingError = createServiceErrorMapper("tracking", TRACKING_ERROR_CODE_MAP);
