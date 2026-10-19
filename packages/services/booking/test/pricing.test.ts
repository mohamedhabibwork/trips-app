import { describe, expect, it } from "bun:test";

import { computeBookingPricing, type BookingCouponLike } from "../src/model";

const TRIP_ID = "11111111-1111-1111-1111-111111111111";
const TRIP_TENANT = "22222222-2222-2222-2222-222222222222";
const OTHER_TENANT = "33333333-3333-3333-3333-333333333333";

function coupon(overrides: Partial<BookingCouponLike> = {}): BookingCouponLike {
  return {
    id: "44444444-4444-4444-4444-444444444444",
    code: "TRAVEL10",
    discountType: "percentage",
    discountValue: 10,
    maxDiscountMinor: null,
    minOrderMinor: 0,
    status: "active",
    startsAt: null,
    expiresAt: null,
    maxRedemptions: null,
    redemptionsCount: 0,
    tripId: null,
    tenantId: null,
    ...overrides,
  };
}

describe("computeBookingPricing", () => {
  it("applies the plan discount to programs only and never the base price", () => {
    const result = computeBookingPricing({
      subtotalMinor: 250_000, // trip base price
      programsTotalMinor: 150_000, // paid program
      planTier: "vip",
      coupon: null,
      tripId: TRIP_ID,
      tripTenantId: TRIP_TENANT,
    });
    expect(result.planDiscountMinor).toBe(15_000); // 10% of programs only
    expect(result.couponDiscountMinor).toBe(0);
    expect(result.totalAmountMinor).toBe(385_000);
  });

  it("gives the Free plan no discount", () => {
    const result = computeBookingPricing({
      subtotalMinor: 250_000,
      programsTotalMinor: 150_000,
      planTier: "free",
      coupon: null,
      tripId: TRIP_ID,
      tripTenantId: TRIP_TENANT,
    });
    expect(result.planDiscountMinor).toBe(0);
    expect(result.totalAmountMinor).toBe(400_000);
  });

  it("stacks the coupon on the gross amount after the plan discount", () => {
    const result = computeBookingPricing({
      subtotalMinor: 100_000,
      programsTotalMinor: 100_000,
      planTier: "explorer", // 5% of 100_000 = 5_000
      coupon: coupon({ discountValue: 10 }), // 10% of 200_000 gross = 20_000
      tripId: TRIP_ID,
      tripTenantId: TRIP_TENANT,
    });
    expect(result.planDiscountMinor).toBe(5_000);
    expect(result.couponDiscountMinor).toBe(20_000);
    expect(result.totalAmountMinor).toBe(175_000);
  });

  it("caps percentage coupons at maxDiscountMinor", () => {
    const result = computeBookingPricing({
      subtotalMinor: 500_000,
      programsTotalMinor: 0,
      planTier: "free",
      coupon: coupon({ discountValue: 50, maxDiscountMinor: 10_000 }),
      tripId: TRIP_ID,
      tripTenantId: TRIP_TENANT,
    });
    expect(result.couponDiscountMinor).toBe(10_000);
  });

  it("rejects a coupon scoped to another organization with the generic reason", () => {
    const result = computeBookingPricing({
      subtotalMinor: 250_000,
      programsTotalMinor: 0,
      planTier: "free",
      coupon: coupon({ tenantId: OTHER_TENANT }),
      tripId: TRIP_ID,
      tripTenantId: TRIP_TENANT,
    });
    expect(result.couponFailureReason).toBe("not_applicable");
    expect(result.couponCode).toBeNull();
    expect(result.couponDiscountMinor).toBe(0);
  });

  it("reports first-failure reasons: expired, paused, exhausted, min_spend", () => {
    const base = {
      subtotalMinor: 250_000,
      programsTotalMinor: 0,
      planTier: "free" as const,
      tripId: TRIP_ID,
      tripTenantId: TRIP_TENANT,
    };
    const past = new Date(Date.now() - 60_000);
    expect(
      computeBookingPricing({ ...base, coupon: coupon({ expiresAt: past }) }).couponFailureReason,
    ).toBe("expired");
    expect(
      computeBookingPricing({ ...base, coupon: coupon({ status: "paused" }) }).couponFailureReason,
    ).toBe("paused");
    expect(
      computeBookingPricing({
        ...base,
        coupon: coupon({ maxRedemptions: 5, redemptionsCount: 5 }),
      }).couponFailureReason,
    ).toBe("exhausted");
    expect(
      computeBookingPricing({
        ...base,
        coupon: coupon({ minOrderMinor: 300_000 }),
      }).couponFailureReason,
    ).toBe("min_spend");
  });

  it("rejects a coupon pinned to a different trip", () => {
    const result = computeBookingPricing({
      subtotalMinor: 250_000,
      programsTotalMinor: 0,
      planTier: "free",
      coupon: coupon({ tripId: "99999999-9999-9999-9999-999999999999" }),
      tripId: TRIP_ID,
      tripTenantId: TRIP_TENANT,
    });
    expect(result.couponFailureReason).toBe("not_applicable");
  });
});
