import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { CouponsServiceError, mapCouponsError } from "../src/errors";
import { calculateCouponDiscountMinor, normalizeCouponCode } from "../src/model";
import {
  createCouponInputSchema,
  listCouponsInputSchema,
  updateCouponStatusInputSchema,
  validateCouponInputSchema,
} from "../src/schemas/validation";

describe("Unit: coupons validation schemas, discount calculation & error mapping (@trips-app/service-coupons)", () => {
  test("normalizeCouponCode and calculateCouponDiscountMinor enforce discount caps", () => {
    expect(normalizeCouponCode("  ramadan 20  ")).toBe("RAMADAN20");
    expect(
      calculateCouponDiscountMinor(100_000, {
        discountType: "percentage",
        discountValue: 15,
        maxDiscountMinor: 10_000,
      }),
    ).toBe(10_000);
    expect(
      calculateCouponDiscountMinor(100_000, {
        discountType: "fixed_amount",
        discountValue: 25_000,
        maxDiscountMinor: null,
      }),
    ).toBe(25_000);
    expect(
      calculateCouponDiscountMinor(10_000, {
        discountType: "fixed_amount",
        discountValue: 25_000,
        maxDiscountMinor: null,
      }),
    ).toBe(10_000);
  });

  test("coupons Zod schemas and error mapper validate boundary inputs", () => {
    expect(
      createCouponInputSchema.safeParse({
        code: "WINTER25",
        titleAr: "خصم الشتاء",
        titleEn: "Winter Discount",
        discountType: "percentage",
        discountValue: 25,
      }).success,
    ).toBe(true);
    expect(
      updateCouponStatusInputSchema.safeParse({
        couponId: randomUUID(),
        status: "paused",
      }).success,
    ).toBe(true);
    expect(listCouponsInputSchema.safeParse(undefined).success).toBe(true);
    expect(
      validateCouponInputSchema.safeParse({
        code: "WINTER25",
        subtotalMinor: 100_000,
      }).success,
    ).toBe(true);

    const err = new CouponsServiceError("COUPON_INVALID_OR_EXPIRED", "Expired coupon");
    expect(mapCouponsError(err).code).toBe("COUPON_INVALID_OR_EXPIRED");
  });
});
