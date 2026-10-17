// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const AUTH_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {
  INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  SESSION_EXPIRED: "AUTH_SESSION_EXPIRED",
  ACCOUNT_LOCKED: "AUTH_ACCOUNT_LOCKED",
  ACCOUNT_SUSPENDED: "AUTH_ACCOUNT_SUSPENDED",
  DELETION_PENDING: "AUTH_DELETION_PENDING",
  OTP_EXPIRED: "AUTH_OTP_EXPIRED",
  OTP_INVALID: "AUTH_OTP_INVALID",
  OTP_PAUSED: "AUTH_OTP_PAUSED",
  OTP_COOLDOWN: "AUTH_OTP_COOLDOWN",
  MFA_REQUIRED: "AUTH_MFA_REQUIRED",
  VERIFICATION_REQUIRED: "AUTH_VERIFICATION_REQUIRED",
  WEB_ONLY_REGISTRATION: "AUTH_WEB_ONLY_REGISTRATION",
};

export class AuthServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "auth");
    this.name = "AuthServiceError";
  }
}

export const mapAuthError = createServiceErrorMapper("auth", AUTH_ERROR_CODE_MAP);
