// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const EMPLOYEES_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {
  EMPLOYEE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  EMPLOYEE_QUOTA_EXCEEDED: "PLAN_LIMIT_EXCEEDED",
  EMPLOYEE_ALREADY_EXISTS: "DUPLICATE_RESOURCE",
  INVITE_EXPIRED: "PRECONDITION_FAILED",
  INVALID_STATUS_TRANSITION: "INVALID_STATE_TRANSITION",
};

export class EmployeesServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "employees");
    this.name = "EmployeesServiceError";
  }
}

export const mapEmployeesError = createServiceErrorMapper("employees", EMPLOYEES_ERROR_CODE_MAP);
