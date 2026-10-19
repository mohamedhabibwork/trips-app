import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
  type SharedErrorCode,
} from "@trips-app/domain";

export type { SharedErrorCode };

export type PaymentsErrorCode =
  | "PAYMENT_NOT_FOUND"
  | "PAYMENTS_NOT_FOUND"
  | "BOOKING_NOT_FOUND"
  | "INVALID_PAYMENT_STATE"
  | "REFUND_EXCEEDS_AMOUNT"
  | "FORBIDDEN_PAYMENT_ACCESS";

export const PAYMENTS_ERROR_CODE_MAP: Readonly<Record<PaymentsErrorCode, SharedErrorCode>> = {
  PAYMENT_NOT_FOUND: "RESOURCE_NOT_FOUND",
  PAYMENTS_NOT_FOUND: "RESOURCE_NOT_FOUND",
  BOOKING_NOT_FOUND: "RESOURCE_NOT_FOUND",
  INVALID_PAYMENT_STATE: "CONFLICT",
  REFUND_EXCEEDS_AMOUNT: "VALIDATION_ERROR",
  FORBIDDEN_PAYMENT_ACCESS: "FORBIDDEN",
};

export class PaymentsServiceError extends ServiceError {
  constructor(
    code: PaymentsErrorCode | SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    const sharedCode =
      code in PAYMENTS_ERROR_CODE_MAP
        ? PAYMENTS_ERROR_CODE_MAP[code as PaymentsErrorCode]
        : (code as SharedErrorCode);
    super(sharedCode, message, detailsOrOptions, "payments");
    this.name = "PaymentsServiceError";
  }
}

export const mapPaymentsError = createServiceErrorMapper("payments", PAYMENTS_ERROR_CODE_MAP);
