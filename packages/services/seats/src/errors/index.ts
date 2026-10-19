// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const SEATS_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {
  SEAT_NOT_FOUND: "RESOURCE_NOT_FOUND",
  SEAT_UNAVAILABLE: "SEAT_NOT_AVAILABLE",
  HOLD_EXPIRED: "SEAT_HOLD_EXPIRED",
};

export class SeatsServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "seats");
    this.name = "SeatsServiceError";
  }
}

export const mapSeatsError = createServiceErrorMapper("seats", SEATS_ERROR_CODE_MAP);
