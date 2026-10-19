import {
  createServiceErrorMapper,
  ServiceError,
  type ServiceErrorOptions,
  type SharedErrorCode,
} from "@trips-app/domain";

export type { SharedErrorCode };

export type BookingErrorCode =
  | "BOOKING_NOT_FOUND"
  | "TRIP_NOT_AVAILABLE"
  | "INSUFFICIENT_CAPACITY"
  | "SEAT_UNAVAILABLE"
  | "COUPON_INVALID"
  | "BOOKING_ALREADY_CANCELLED"
  | "FORBIDDEN_BOOKING_ACCESS";

export const BOOKING_ERROR_CODE_MAP: Readonly<Record<BookingErrorCode, SharedErrorCode>> = {
  BOOKING_NOT_FOUND: "RESOURCE_NOT_FOUND",
  TRIP_NOT_AVAILABLE: "VALIDATION_ERROR",
  INSUFFICIENT_CAPACITY: "CONFLICT",
  SEAT_UNAVAILABLE: "CONFLICT",
  COUPON_INVALID: "VALIDATION_ERROR",
  BOOKING_ALREADY_CANCELLED: "CONFLICT",
  FORBIDDEN_BOOKING_ACCESS: "FORBIDDEN",
};

export class BookingServiceError extends ServiceError {
  constructor(
    code: BookingErrorCode | SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
  ) {
    const sharedCode =
      code in BOOKING_ERROR_CODE_MAP
        ? BOOKING_ERROR_CODE_MAP[code as BookingErrorCode]
        : (code as SharedErrorCode);
    super(sharedCode, message, detailsOrOptions, "booking");
    this.name = "BookingServiceError";
  }
}

export const mapBookingError = createServiceErrorMapper("booking", BOOKING_ERROR_CODE_MAP);
