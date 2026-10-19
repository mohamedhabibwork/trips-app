import { describe, expect, it } from "bun:test";

import {
  ALBUM_PUBLIC_SIGNED_URL_SECONDS,
  ALBUM_SELECTED_SIGNED_URL_SECONDS,
  COUPON_GENERIC_FAILURE_MESSAGE,
  PAYMENT_CONFIRM_TIMEOUT_SECONDS,
  SEAT_HOLD_MINUTES,
  SEAT_PRIORITY_WINDOW_HOURS,
  SHARED_LINK_TOKEN_LENGTH,
  computePlanDiscountMinor,
  computeRefundMinor,
  evaluateCouponFailure,
  generateSharedLinkToken,
  isWithinSeatPriorityWindow,
  isValidSharedLinkToken,
  resolveRefundTier,
  seatHoldExpiry,
} from "./index";

describe("traveler pricing (plan discount, coupons, refunds, holds)", () => {
  it("applies the plan discount to programs only (Explorer 5% / VIP 10% / Free 0%)", () => {
    expect(computePlanDiscountMinor("free", 100_000)).toBe(0);
    expect(computePlanDiscountMinor("explorer", 100_000)).toBe(5_000);
    expect(computePlanDiscountMinor("vip", 100_000)).toBe(10_000);
  });

  it("returns the first failing coupon reason", () => {
    const base = {
      status: "active",
      startsAt: null,
      expiresAt: null,
      maxRedemptions: null,
      redemptionsCount: 0,
      minOrderMinor: 0,
      grossMinor: 500_000,
      tenantId: "t1",
    };

    expect(evaluateCouponFailure(base)).toBeNull();
    // Status is checked before the clock.
    expect(evaluateCouponFailure({ ...base, status: "paused" })).toBe("paused");
    expect(evaluateCouponFailure({ ...base, status: "revoked" })).toBe("revoked");
    expect(evaluateCouponFailure({ ...base, status: null })).toBe("not_found");

    const past = new Date(Date.now() - 60_000);
    const future = new Date(Date.now() + 60_000);
    expect(evaluateCouponFailure({ ...base, expiresAt: past })).toBe("expired");
    expect(evaluateCouponFailure({ ...base, startsAt: future })).toBe("not_yet_active");
    expect(evaluateCouponFailure({ ...base, maxRedemptions: 5, redemptionsCount: 5 })).toBe(
      "exhausted",
    );
    expect(evaluateCouponFailure({ ...base, minOrderMinor: 600_000 })).toBe("min_spend");
    expect(
      evaluateCouponFailure({
        ...base,
        requiresFirstBooking: true,
        viewerHasConfirmedBooking: true,
      }),
    ).toBe("first_booking");
    expect(evaluateCouponFailure({ ...base, alreadyDiscounted: true })).toBe("not_stackable");
    // Ownership mismatch collapses into the generic reason.
    expect(evaluateCouponFailure({ ...base, scopedToOtherOwner: true })).toBe("not_applicable");
  });

  it("exposes the generic not-applicable message for foreign-creator coupons", () => {
    expect(COUPON_GENERIC_FAILURE_MESSAGE).toBe("This coupon is not applicable to this booking.");
  });

  it("computes refund tiers D-07: 80% >= 48h, 50% in 24-48h, 0% < 24h", () => {
    expect(resolveRefundTier(72).refundPercent).toBe(80);
    expect(resolveRefundTier(48).refundPercent).toBe(80);
    expect(resolveRefundTier(47.9).refundPercent).toBe(50);
    expect(resolveRefundTier(24).refundPercent).toBe(50);
    expect(resolveRefundTier(23.9).refundPercent).toBe(0);
    expect(resolveRefundTier(0).refundPercent).toBe(0);

    const departure = new Date("2026-05-02T10:00:00Z");
    const now = new Date("2026-04-29T10:00:00Z"); // exactly 72h before
    expect(computeRefundMinor(100_000, departure, now)).toEqual({
      amountMinor: 80_000,
      tier: { minHoursBeforeDeparture: 48, refundPercent: 80 },
    });
    const inside24h = new Date("2026-05-02T09:00:00Z"); // 1h before
    expect(computeRefundMinor(100_000, departure, inside24h).amountMinor).toBe(0);
  });

  it("holds seats for 15 minutes (BRL-08)", () => {
    const now = new Date("2026-05-01T10:00:00Z");
    expect(SEAT_HOLD_MINUTES).toBe(15);
    expect(seatHoldExpiry(now).getTime()).toBe(now.getTime() + 15 * 60 * 1000);
  });

  it("gates the seat selection priority window to Explorer/VIP within 24h of departure", () => {
    const departure = new Date("2026-05-02T10:00:00Z");
    const withinWindow = new Date("2026-05-01T15:00:00Z");
    const beforeWindow = new Date("2026-04-30T00:00:00Z");

    expect(
      isWithinSeatPriorityWindow({ tripStartsAt: departure, planTier: "vip", now: withinWindow }),
    ).toBe(true);
    expect(
      isWithinSeatPriorityWindow({
        tripStartsAt: departure,
        planTier: "explorer",
        now: withinWindow,
      }),
    ).toBe(true);
    expect(
      isWithinSeatPriorityWindow({ tripStartsAt: departure, planTier: "vip", now: beforeWindow }),
    ).toBe(false);
    expect(
      isWithinSeatPriorityWindow({ tripStartsAt: departure, planTier: "free", now: withinWindow }),
    ).toBe(false);
    expect(SEAT_PRIORITY_WINDOW_HOURS).toBe(24);
  });

  it("uses a 30-second payment confirm deadline (D-30)", () => {
    expect(PAYMENT_CONFIRM_TIMEOUT_SECONDS).toBe(30);
    const created = new Date("2026-05-01T10:00:00Z");
    const deadline = new Date(created.getTime() + PAYMENT_CONFIRM_TIMEOUT_SECONDS * 1000);
    expect(deadline.toISOString()).toBe("2026-05-01T10:00:30.000Z");
  });

  it("generates and validates 32-character shared link tokens", () => {
    const token = generateSharedLinkToken();
    expect(token.length).toBe(SHARED_LINK_TOKEN_LENGTH);
    expect(isValidSharedLinkToken(token)).toBe(true);
    expect(isValidSharedLinkToken("short")).toBe(false);
    expect(isValidSharedLinkToken(`${token}/../etc`)).toBe(false);
  });

  it("signs public album URLs for 24h and selected-user albums for 15 minutes", () => {
    expect(ALBUM_PUBLIC_SIGNED_URL_SECONDS).toBe(24 * 60 * 60);
    expect(ALBUM_SELECTED_SIGNED_URL_SECONDS).toBe(15 * 60);
  });
});
