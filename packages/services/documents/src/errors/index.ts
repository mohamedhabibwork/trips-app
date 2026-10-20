// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const DOCUMENTS_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {
  RENDERER_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  RENDER_FAILED: "INTERNAL_ERROR",
  EMAIL_SEND_FAILED: "INTERNAL_ERROR",
  DOCUMENT_TYPE_UNSUPPORTED: "INVALID_INPUT",
};

export class DocumentsServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "documents");
    this.name = "DocumentsServiceError";
  }
}

export const mapDocumentsError = createServiceErrorMapper("documents", DOCUMENTS_ERROR_CODE_MAP);
