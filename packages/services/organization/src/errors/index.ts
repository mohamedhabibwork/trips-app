// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const ORGANIZATION_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {
  CROSS_TENANT_ACCESS: "TENANT_NOT_FOUND",
  ORGANIZATION_NOT_FOUND: "TENANT_NOT_FOUND",
  PLAN_FEATURE_GATED: "PLAN_REQUIRED",
  WEBHOOK_LIMIT_EXCEEDED: "PLAN_LIMIT_EXCEEDED",
};

export class OrganizationServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "organization");
    this.name = "OrganizationServiceError";
  }
}

export const mapOrganizationError = createServiceErrorMapper(
  "organization",
  ORGANIZATION_ERROR_CODE_MAP,
);
