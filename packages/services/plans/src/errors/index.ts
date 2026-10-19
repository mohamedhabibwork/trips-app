import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
  type SharedErrorCode,
} from "@trips-app/domain";

export type { SharedErrorCode };

export type PlansErrorCode =
  | "PLAN_NOT_FOUND"
  | "PLANS_NOT_FOUND"
  | "INVALID_PLAN_SCOPE"
  | "SUBSCRIPTION_NOT_FOUND";

export const PLANS_ERROR_CODE_MAP: Readonly<Record<PlansErrorCode, SharedErrorCode>> = {
  PLAN_NOT_FOUND: "RESOURCE_NOT_FOUND",
  PLANS_NOT_FOUND: "RESOURCE_NOT_FOUND",
  INVALID_PLAN_SCOPE: "VALIDATION_ERROR",
  SUBSCRIPTION_NOT_FOUND: "RESOURCE_NOT_FOUND",
};

export class PlansServiceError extends ServiceError {
  constructor(
    code: PlansErrorCode | SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    const sharedCode =
      code in PLANS_ERROR_CODE_MAP
        ? PLANS_ERROR_CODE_MAP[code as PlansErrorCode]
        : (code as SharedErrorCode);
    super(sharedCode, message, detailsOrOptions, "plans");
    this.name = "PlansServiceError";
  }
}

export const mapPlansError = createServiceErrorMapper("plans", PLANS_ERROR_CODE_MAP);
