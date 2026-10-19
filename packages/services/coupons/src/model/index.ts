// Entities and aggregates with their invariants. No I/O.
import {
  type CouponDiscountType,
  type CouponScope,
  type CouponStatus,
  type CurrencyCode,
  findPlanCatalogEntry,
  type Money,
  money,
  type UserRole,
} from "@trips-app/domain";

export {
  type CouponDiscountType,
  type CouponScope,
  type CouponStatus,
  type CurrencyCode,
  findPlanCatalogEntry,
  type Money,
  money,
  type UserRole,
};

export const COUPON_SCOPES = [
  "organization",
  "platform",
  "driver",
] as const satisfies readonly CouponScope[];

export const COUPON_DISCOUNT_TYPES = [
  "percentage",
  "fixed_amount",
] as const satisfies readonly CouponDiscountType[];

export const COUPON_STATUSES = [
  "active",
  "paused",
  "expired",
] as const satisfies readonly CouponStatus[];

export const SUPPORTED_CURRENCIES = [
  "EGP",
  "SAR",
  "AED",
] as const satisfies readonly CurrencyCode[];

export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function calculateCouponDiscountMinor(
  subtotalMinor: number,
  coupon: {
    discountType: CouponDiscountType;
    discountValue: number;
    maxDiscountMinor: number | null;
  },
): number {
  if (subtotalMinor <= 0) return 0;
  let discount = 0;
  if (coupon.discountType === "percentage") {
    // discountValue is basis points (1000 = 10%) or integer percent (1..100): support both cleanly
    const bps = coupon.discountValue <= 100 ? coupon.discountValue * 100 : coupon.discountValue;
    discount = Math.floor((subtotalMinor * Math.min(10_000, bps)) / 10_000);
  } else {
    discount = coupon.discountValue;
  }
  if (coupon.maxDiscountMinor !== null && discount > coupon.maxDiscountMinor) {
    discount = coupon.maxDiscountMinor;
  }
  return Math.min(subtotalMinor, Math.max(0, discount));
}
