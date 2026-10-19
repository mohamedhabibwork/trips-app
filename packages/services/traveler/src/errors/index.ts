// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const TRAVELER_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {
  ACCOUNT_NOT_FOUND: "RESOURCE_NOT_FOUND",
  CONTACT_REQUIRED: "VALIDATION_ERROR",
  DUPLICATE_CONTACT: "DUPLICATE_RESOURCE",
  INVALID_COUNTRY: "VALIDATION_ERROR",
};

export class TravelerServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "traveler");
    this.name = "TravelerServiceError";
  }
}

export const mapTravelerError = createServiceErrorMapper("traveler", TRAVELER_ERROR_CODE_MAP);
