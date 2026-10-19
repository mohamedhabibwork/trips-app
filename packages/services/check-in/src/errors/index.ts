import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
  type SharedErrorCode,
} from "@trips-app/domain";

export type { SharedErrorCode };

export type CheckInErrorCode =
  | "CHECK_IN_NOT_FOUND"
  | "BOARDING_PASS_NOT_FOUND"
  | "ALREADY_CHECKED_IN"
  | "FORBIDDEN_CHECK_IN";

export const CHECK_IN_ERROR_CODE_MAP: Readonly<Record<CheckInErrorCode, SharedErrorCode>> = {
  CHECK_IN_NOT_FOUND: "RESOURCE_NOT_FOUND",
  BOARDING_PASS_NOT_FOUND: "RESOURCE_NOT_FOUND",
  ALREADY_CHECKED_IN: "CONFLICT",
  FORBIDDEN_CHECK_IN: "FORBIDDEN",
};

export class CheckInServiceError extends ServiceError {
  constructor(
    code: CheckInErrorCode | SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    const sharedCode =
      code in CHECK_IN_ERROR_CODE_MAP
        ? CHECK_IN_ERROR_CODE_MAP[code as CheckInErrorCode]
        : (code as SharedErrorCode);
    super(sharedCode, message, detailsOrOptions, "check-in");
    this.name = "CheckInServiceError";
  }
}

export const mapCheckInError = createServiceErrorMapper("check-in", CHECK_IN_ERROR_CODE_MAP);
