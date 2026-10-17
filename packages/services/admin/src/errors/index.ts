// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const ADMIN_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {
  FOUR_EYES_REQUIRED: "FOUR_EYES_APPROVAL_REQUIRED",
  SUBROLE_FORBIDDEN: "ADMIN_SUBROLE_FORBIDDEN",
};

export class AdminServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "admin");
    this.name = "AdminServiceError";
  }
}

export const mapAdminError = createServiceErrorMapper("admin", ADMIN_ERROR_CODE_MAP);
