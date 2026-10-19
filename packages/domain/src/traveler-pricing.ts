// Pure traveler-side commerce rules (pricing, coupons, refunds, holds).
// No I/O and no framework imports (see packages/domain/README.md).
import type { TravelerPlanCode } from "./types";

/**
 * Traveler plan discount (SRS plan matrix, BRL plan discount rule):
 * applies to selected programs ONLY — never to the trip base price.
 */
export const PLAN_DISCOUNT_BPS: Record<TravelerPlanCode, number> = {
  free: 0,
  explorer: 500, // 5%
  vip: 1000, // 10%
};

export function computePlanDiscountMinor(
  planTier: TravelerPlanCode,
  programsTotalMinor: number,
): number {
  const bps = PLAN_DISCOUNT_BPS[planTier] ?? 0;
  return Math.floor((programsTotalMinor * bps) / 10_000);
}

/** First-failing-reason codes for coupon application (SCR-TRV-05 checkout, FR-CPN-03). */
export type CouponFailureReason =
  | "not_found"
  | "paused"
  | "expired"
  | "not_yet_active"
  | "exhausted"
  | "revoked"
  | "min_spend"
  | "first_booking"
  | "not_stackable"
  | "not_applicable";

/** The message returned when a coupon cannot be linked to the current viewer (privacy rule). */
export const COUPON_GENERIC_FAILURE_MESSAGE = "This coupon is not applicable to this booking.";

export interface CouponEvaluationInput {
  status: string | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  maxRedemptions: number | null;
  redemptionsCount: number;
  minOrderMinor: number;
  grossMinor: number;
  /** Coupon ownership scope — used to derive the generic "not applicable" reason. */
  tenantId: string | null;
  /** Coupon requires the viewer's first booking (first_booking rule). */
  requiresFirstBooking?: boolean;
  /** Whether this viewer has any prior confirmed booking (first_booking rule). */
  viewerHasConfirmedBooking?: boolean;
  /** Whether another coupon/discount is already applied (stacking rule). */
  alreadyDiscounted?: boolean;
  /**
   * True when the coupon is scoped to another creator/organization than the trip's —
   * collapses every ownership mismatch into the generic not_applicable reason.
   */
  scopedToOtherOwner?: boolean;
}

export function evaluateCouponFailure(input: CouponEvaluationInput): CouponFailureReason | null {
  if (input.scopedToOtherOwner) {
    return "not_applicable";
  }
  if (!input.status) {
    return "not_found";
  }
  if (input.status === "revoked") {
    return "revoked";
  }
  if (input.status === "paused") {
    return "paused";
  }
  const now = new Date();
  if (input.startsAt && input.startsAt.getTime() > now.getTime()) {
    return "not_yet_active";
  }
  if (input.expiresAt && input.expiresAt.getTime() <= now.getTime()) {
    return "expired";
  }
  if (input.maxRedemptions !== null && input.redemptionsCount >= input.maxRedemptions) {
    return "exhausted";
  }
  if (input.minOrderMinor > 0 && input.grossMinor < input.minOrderMinor) {
    return "min_spend";
  }
  if (input.requiresFirstBooking === true && input.viewerHasConfirmedBooking) {
    return "first_booking";
  }
  if (input.alreadyDiscounted) {
    return "not_stackable";
  }
  return null;
}

/**
 * Refund policy tiers (D-07): 80% at 48h+ before departure, 50% in the 24–48h band,
 * 0% inside 24h. Numbers mirror DEFAULT_SYSTEM_SETTINGS.refundPolicyTiers.
 */
export interface RefundTier {
  minHoursBeforeDeparture: number;
  refundPercent: number;
}

export const REFUND_POLICY_TIERS: readonly RefundTier[] = [
  { minHoursBeforeDeparture: 48, refundPercent: 80 },
  { minHoursBeforeDeparture: 24, refundPercent: 50 },
  { minHoursBeforeDeparture: 0, refundPercent: 0 },
];

export function resolveRefundTier(hoursBeforeDeparture: number): RefundTier {
  const sorted = [...REFUND_POLICY_TIERS].sort(
    (a, b) => b.minHoursBeforeDeparture - a.minHoursBeforeDeparture,
  );
  for (const tier of sorted) {
    if (hoursBeforeDeparture >= tier.minHoursBeforeDeparture) {
      return tier;
    }
  }
  return REFUND_POLICY_TIERS[REFUND_POLICY_TIERS.length - 1]!;
}

export function computeRefundMinor(
  totalAmountMinor: number,
  departureAt: Date | null,
  now: Date = new Date(),
): { amountMinor: number; tier: RefundTier } {
  if (!departureAt) {
    return { amountMinor: totalAmountMinor, tier: REFUND_POLICY_TIERS[0]! };
  }
  const hours = (departureAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  const tier = resolveRefundTier(hours);
  return { amountMinor: Math.floor((totalAmountMinor * tier.refundPercent) / 100), tier };
}

/** BRL-08: a seat hold lives for 15 minutes. */
export const SEAT_HOLD_MINUTES = 15;

export function seatHoldExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + SEAT_HOLD_MINUTES * 60 * 1000);
}

/** VIP/Explorer priority window for seat selection (BRL-08): 24h before public selection. */
export const SEAT_PRIORITY_WINDOW_HOURS = 24;

export function isWithinSeatPriorityWindow(input: {
  tripStartsAt: Date | null;
  planTier: TravelerPlanCode;
  now?: Date;
}): boolean {
  if (input.planTier === "free") {
    return false;
  }
  if (!input.tripStartsAt) {
    return false;
  }
  const now = input.now ?? new Date();
  const windowStart = new Date(
    input.tripStartsAt.getTime() - SEAT_PRIORITY_WINDOW_HOURS * 60 * 60 * 1000,
  );
  return now.getTime() >= windowStart.getTime();
}

/** D-30: a gateway callback is expected within 30 seconds of handoff. */
export const PAYMENT_CONFIRM_TIMEOUT_SECONDS = 30;

export function paymentConfirmDeadline(createdAt: Date): Date {
  return new Date(createdAt.getTime() + PAYMENT_CONFIRM_TIMEOUT_SECONDS * 1000);
}

/** Shared album links use opaque 32-character URL-safe tokens. */
export const SHARED_LINK_TOKEN_LENGTH = 32;

export function generateSharedLinkToken(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(SHARED_LINK_TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function isValidSharedLinkToken(token: string): boolean {
  return token.length === SHARED_LINK_TOKEN_LENGTH && /^[A-Za-z0-9]+$/.test(token);
}

/** Privacy rule: public albums sign URLs for 24h, selected-user albums for 15 minutes. */
export const ALBUM_PUBLIC_SIGNED_URL_SECONDS = 24 * 60 * 60;
export const ALBUM_SELECTED_SIGNED_URL_SECONDS = 15 * 60;
