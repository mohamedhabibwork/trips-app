import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
  type SharedErrorCode,
} from "@trips-app/domain";

export type { SharedErrorCode };

export type ModeratorErrorCode =
  | "MODERATOR_NOT_FOUND"
  | "ASSIGNMENT_NOT_FOUND"
  | "PASSENGER_NOT_IN_VEHICLE_MANIFEST";

export const MODERATOR_ERROR_CODE_MAP: Readonly<Record<ModeratorErrorCode, SharedErrorCode>> = {
  MODERATOR_NOT_FOUND: "RESOURCE_NOT_FOUND",
  ASSIGNMENT_NOT_FOUND: "RESOURCE_NOT_FOUND",
  PASSENGER_NOT_IN_VEHICLE_MANIFEST: "FORBIDDEN",
};

export class ModeratorServiceError extends ServiceError {
  constructor(
    code: ModeratorErrorCode | SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    const sharedCode =
      code in MODERATOR_ERROR_CODE_MAP
        ? MODERATOR_ERROR_CODE_MAP[code as ModeratorErrorCode]
        : (code as SharedErrorCode);
    super(sharedCode, message, detailsOrOptions, "moderator");
    this.name = "ModeratorServiceError";
  }
}

export const mapModeratorError = createServiceErrorMapper("moderator", MODERATOR_ERROR_CODE_MAP);
