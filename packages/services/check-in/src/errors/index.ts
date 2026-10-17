// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const CHECK_IN_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {};

export class CheckInServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "check-in");
    this.name = "CheckInServiceError";
  }
}

export const mapCheckInError = createServiceErrorMapper("check-in", CHECK_IN_ERROR_CODE_MAP);
