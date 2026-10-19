import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
  type SharedErrorCode,
} from "@trips-app/domain";

export type { SharedErrorCode };

export type ParentErrorCode =
  | "PARENT_NOT_FOUND"
  | "CHILD_LINK_NOT_FOUND"
  | "BOOKING_NOT_FOUND"
  | "FORBIDDEN_PARENT_ACCESS";

export const PARENT_ERROR_CODE_MAP: Readonly<Record<ParentErrorCode, SharedErrorCode>> = {
  PARENT_NOT_FOUND: "RESOURCE_NOT_FOUND",
  CHILD_LINK_NOT_FOUND: "RESOURCE_NOT_FOUND",
  BOOKING_NOT_FOUND: "RESOURCE_NOT_FOUND",
  FORBIDDEN_PARENT_ACCESS: "FORBIDDEN",
};

export class ParentServiceError extends ServiceError {
  constructor(
    code: ParentErrorCode | SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    const sharedCode =
      code in PARENT_ERROR_CODE_MAP
        ? PARENT_ERROR_CODE_MAP[code as ParentErrorCode]
        : (code as SharedErrorCode);
    super(sharedCode, message, detailsOrOptions, "parent");
    this.name = "ParentServiceError";
  }
}

export const mapParentError = createServiceErrorMapper("parent", PARENT_ERROR_CODE_MAP);
