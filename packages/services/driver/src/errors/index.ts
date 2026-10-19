import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
  type SharedErrorCode,
} from "@trips-app/domain";

export type { SharedErrorCode };

export type DriverErrorCode =
  | "DRIVER_NOT_FOUND"
  | "DRIVER_PROFILE_NOT_FOUND"
  | "LAB_TEST_NOT_FOUND"
  | "FORBIDDEN_LAB_TEST_ACCESS";

export const DRIVER_ERROR_CODE_MAP: Readonly<Record<DriverErrorCode, SharedErrorCode>> = {
  DRIVER_NOT_FOUND: "RESOURCE_NOT_FOUND",
  DRIVER_PROFILE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  LAB_TEST_NOT_FOUND: "RESOURCE_NOT_FOUND",
  FORBIDDEN_LAB_TEST_ACCESS: "FORBIDDEN",
};

export class DriverServiceError extends ServiceError {
  constructor(
    code: DriverErrorCode | SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    const sharedCode =
      code in DRIVER_ERROR_CODE_MAP
        ? DRIVER_ERROR_CODE_MAP[code as DriverErrorCode]
        : (code as SharedErrorCode);
    super(sharedCode, message, detailsOrOptions, "driver");
    this.name = "DriverServiceError";
  }
}

export const mapDriverError = createServiceErrorMapper("driver", DRIVER_ERROR_CODE_MAP);
