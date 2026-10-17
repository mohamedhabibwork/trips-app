// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const PROGRAMS_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {};

export class ProgramsServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "programs");
    this.name = "ProgramsServiceError";
  }
}

export const mapProgramsError = createServiceErrorMapper("programs", PROGRAMS_ERROR_CODE_MAP);
