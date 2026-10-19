import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
  type SharedErrorCode,
} from "@trips-app/domain";

export type { SharedErrorCode };

export type PhotographerErrorCode =
  | "PHOTOGRAPHER_NOT_FOUND"
  | "PHOTOGRAPHER_PROFILE_NOT_FOUND"
  | "TRIP_NOT_FOUND"
  | "ALBUM_NOT_FOUND"
  | "FORBIDDEN_ALBUM_ACCESS";

export const PHOTOGRAPHER_ERROR_CODE_MAP: Readonly<Record<PhotographerErrorCode, SharedErrorCode>> =
  {
    PHOTOGRAPHER_NOT_FOUND: "RESOURCE_NOT_FOUND",
    PHOTOGRAPHER_PROFILE_NOT_FOUND: "RESOURCE_NOT_FOUND",
    TRIP_NOT_FOUND: "RESOURCE_NOT_FOUND",
    ALBUM_NOT_FOUND: "RESOURCE_NOT_FOUND",
    FORBIDDEN_ALBUM_ACCESS: "FORBIDDEN",
  };

export class PhotographerServiceError extends ServiceError {
  constructor(
    code: PhotographerErrorCode | SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    const sharedCode =
      code in PHOTOGRAPHER_ERROR_CODE_MAP
        ? PHOTOGRAPHER_ERROR_CODE_MAP[code as PhotographerErrorCode]
        : (code as SharedErrorCode);
    super(sharedCode, message, detailsOrOptions, "photographer");
    this.name = "PhotographerServiceError";
  }
}

export const mapPhotographerError = createServiceErrorMapper(
  "photographer",
  PHOTOGRAPHER_ERROR_CODE_MAP,
);
