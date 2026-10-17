// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const ONBOARDING_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {
  REAPPLY_COOLDOWN_ACTIVE: "ONBOARDING_COOLDOWN_ACTIVE",
  CHANGES_WINDOW_EXPIRED: "ONBOARDING_CHANGES_WINDOW_EXPIRED",
  DUPLICATE_APPLICATION: "DUPLICATE_RESOURCE",
  INVALID_APPLICATION_TRANSITION: "INVALID_STATE_TRANSITION",
};

export class OnboardingServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "onboarding");
    this.name = "OnboardingServiceError";
  }
}

export const mapOnboardingError = createServiceErrorMapper("onboarding", ONBOARDING_ERROR_CODE_MAP);
