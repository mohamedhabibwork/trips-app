import {
  BOOKING_STATUSES,
  computePlanDiscountMinor,
  DEFAULT_SYSTEM_SETTINGS,
  evaluateCouponFailure,
  PAYMENT_CONFIRM_TIMEOUT_SECONDS,
  TRAVELER_PLAN_CODES,
  type BookingPassenger,
  type BookingStatus,
  type CurrencyCode,
  type PaymentGatewayCode,
  type TravelerPlanCode,
} from "@trips-app/domain";

export {
  BOOKING_STATUSES,
  PAYMENT_CONFIRM_TIMEOUT_SECONDS,
  TRAVELER_PLAN_CODES,
  type BookingPassenger,
  type BookingStatus,
  type CurrencyCode,
  type PaymentGatewayCode,
  type TravelerPlanCode,
};

export function generateBookingReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `BK-${Array.from(bytes, (b) => chars[b % chars.length]).join("")}`;
}

export function generateQrCodeToken(bookingRef: string, passengerIndex: number): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `QR-${bookingRef}-${passengerIndex + 1}-${hex}`;
}

export function calculateRefundAmountMinor(
  totalAmountMinor: number,
  departureAt: Date | null,
  now: Date = new Date(),
): number {
  if (!departureAt) {
    return totalAmountMinor;
  }
  const hoursBeforeDeparture = (departureAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  const tiers = [...DEFAULT_SYSTEM_SETTINGS.refundPolicyTiers].sort(
    (a, b) => b.minHoursBeforeDeparture - a.minHoursBeforeDeparture,
  );
  for (const tier of tiers) {
    if (hoursBeforeDeparture >= tier.minHoursBeforeDeparture) {
      return Math.floor((totalAmountMinor * tier.refundPercent) / 100);
    }
  }
  return 0;
}

/** Everything `computeBookingPricing` needs to know about a coupon row. */
export interface BookingCouponLike {
  id: string;
  code: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  maxDiscountMinor: number | null;
  minOrderMinor: number;
  status: string;
  startsAt: Date | null;
  expiresAt: Date | null;
  maxRedemptions: number | null;
  redemptionsCount: number;
  tripId: string | null;
  tenantId: string | null;
}

export interface BookingPricingComputation {
  subtotalMinor: number;
  programsTotalMinor: number;
  grossMinor: number;
  planDiscountMinor: number;
  couponDiscountMinor: number;
  totalAmountMinor: number;
  couponCode: string | null;
  couponFailureReason: string | null;
}

/**
 * Full booking quote (plan + coupon) as one pure computation so the math is testable
 * without a database. Plan discount applies to programs only; the coupon applies to the
 * gross amount. Returns `couponFailureReason` (and zero coupon discount) instead of throwing.
 */
export function computeBookingPricing(input: {
  subtotalMinor: number;
  programsTotalMinor: number;
  planTier: TravelerPlanCode;
  coupon: BookingCouponLike | null;
  tripId: string;
  tripTenantId: string;
  now?: Date;
}): BookingPricingComputation {
  const grossMinor = input.subtotalMinor + input.programsTotalMinor;
  const planDiscountMinor = computePlanDiscountMinor(input.planTier, input.programsTotalMinor);

  let couponDiscountMinor = 0;
  let couponCode: string | null = null;
  let couponFailureReason: string | null = null;

  const coupon = input.coupon;
  if (coupon) {
    const applicableToTrip = coupon.tripId === null || coupon.tripId === input.tripId;
    const scopedToTripOwner = coupon.tenantId === null || coupon.tenantId === input.tripTenantId;
    const failure = evaluateCouponFailure({
      status: coupon.status,
      startsAt: coupon.startsAt,
      expiresAt: coupon.expiresAt,
      maxRedemptions: coupon.maxRedemptions,
      redemptionsCount: coupon.redemptionsCount,
      minOrderMinor: coupon.minOrderMinor,
      grossMinor,
      tenantId: coupon.tenantId,
      scopedToOtherOwner: !scopedToTripOwner,
    });
    if (failure !== null || !applicableToTrip) {
      couponFailureReason = failure ?? "not_applicable";
    } else {
      couponCode = coupon.code;
      if (coupon.discountType === "percentage") {
        const raw = Math.floor((grossMinor * coupon.discountValue) / 100);
        couponDiscountMinor =
          coupon.maxDiscountMinor !== null ? Math.min(raw, coupon.maxDiscountMinor) : raw;
      } else {
        couponDiscountMinor = Math.min(grossMinor, coupon.discountValue);
      }
    }
  }

  return {
    subtotalMinor: input.subtotalMinor,
    programsTotalMinor: input.programsTotalMinor,
    grossMinor,
    planDiscountMinor,
    couponDiscountMinor,
    totalAmountMinor: Math.max(0, grossMinor - planDiscountMinor - couponDiscountMinor),
    couponCode,
    couponFailureReason,
  };
}
