// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const NOTIFICATIONS_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {};

export class NotificationsServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "notifications");
    this.name = "NotificationsServiceError";
  }
}

export const mapNotificationsError = createServiceErrorMapper(
  "notifications",
  NOTIFICATIONS_ERROR_CODE_MAP,
);
