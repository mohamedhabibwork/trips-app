// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const TRIPS_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {
  TRIP_NOT_FOUND: "RESOURCE_NOT_FOUND",
  VEHICLE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  INVALID_TRANSITION: "INVALID_STATE_TRANSITION",
  WIZARD_INCOMPLETE: "PRECONDITION_FAILED",
  STAFFING_GAP: "PRECONDITION_FAILED",
  VEHICLE_LIMIT_EXCEEDED: "PLAN_LIMIT_EXCEEDED",
  MONTHLY_TRIP_LIMIT_EXCEEDED: "PLAN_LIMIT_EXCEEDED",
  FEATURE_NOT_IN_PLAN: "PLAN_REQUIRED",
  ORG_SUBSCRIPTION_INACTIVE: "SUBSCRIPTION_INACTIVE",
};

export class TripsServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "trips");
    this.name = "TripsServiceError";
  }
}

export const mapTripsError = createServiceErrorMapper("trips", TRIPS_ERROR_CODE_MAP);
