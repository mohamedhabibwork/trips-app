// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const MEDIA_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {
  FILE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  FILE_EXPIRED: "INVALID_STATE_TRANSITION",
  FILE_DELETED: "INVALID_STATE_TRANSITION",
  FILE_ALREADY_LINKED_DIFFERENT_ENTITY: "CONFLICT",
  FILE_TOO_LARGE: "VALIDATION_ERROR",
  UNSUPPORTED_MIME_TYPE: "VALIDATION_ERROR",
};

export class MediaServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "media");
    this.name = "MediaServiceError";
  }
}

export const mapMediaError = createServiceErrorMapper("media", MEDIA_ERROR_CODE_MAP);
