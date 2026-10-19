// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const STAFFING_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {
  TRIP_NOT_FOUND: "RESOURCE_NOT_FOUND",
  VEHICLE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  ASSIGNMENT_NOT_FOUND: "RESOURCE_NOT_FOUND",
};

export class StaffingServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "staffing");
    this.name = "StaffingServiceError";
  }
}

export const mapStaffingError = createServiceErrorMapper("staffing", STAFFING_ERROR_CODE_MAP);
