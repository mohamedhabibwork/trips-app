// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.
import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
} from "@trips-app/domain";

import type { SharedErrorCode } from "../types";

export const COUPONS_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {
  COUPON_NOT_FOUND: "RESOURCE_NOT_FOUND",
  COUPON_EXPIRED: "COUPON_INVALID_OR_EXPIRED",
  COUPON_INVALID: "COUPON_INVALID_OR_EXPIRED",
};

export class CouponsServiceError extends ServiceError {
  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    super(code, message, detailsOrOptions, "coupons");
    this.name = "CouponsServiceError";
  }
}

export const mapCouponsError = createServiceErrorMapper("coupons", COUPONS_ERROR_CODE_MAP);
