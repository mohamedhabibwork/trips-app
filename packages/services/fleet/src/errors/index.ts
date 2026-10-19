// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const FLEET_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {
  VEHICLE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  VEHICLE_TYPE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  DUPLICATE_PLATE: "DUPLICATE_RESOURCE",
  SEAT_COUNT_MISMATCH: "BUSINESS_RULE_VIOLATION",
  VEHICLE_IN_USE: "BUSINESS_RULE_VIOLATION",
  INVALID_SEAT_LAYOUT: "VALIDATION_ERROR",
};

export class FleetServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "fleet");
    this.name = "FleetServiceError";
  }
}

export const mapFleetError = createServiceErrorMapper("fleet", FLEET_ERROR_CODE_MAP);
