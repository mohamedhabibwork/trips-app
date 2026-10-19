// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const AVAILABILITY_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {
  BLOCK_NOT_FOUND: "RESOURCE_NOT_FOUND",
  AVAILABILITY_CONFLICT: "CONFLICT",
};

export class AvailabilityServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "availability");
    this.name = "AvailabilityServiceError";
  }
}

export const mapAvailabilityError = createServiceErrorMapper(
  "availability",
  AVAILABILITY_ERROR_CODE_MAP,
);
