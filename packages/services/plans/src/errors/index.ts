// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const PLANS_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {};

export class PlansServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "plans");
    this.name = "PlansServiceError";
  }
}

export const mapPlansError = createServiceErrorMapper("plans", PLANS_ERROR_CODE_MAP);
