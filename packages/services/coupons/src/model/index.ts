// Entities and aggregates with their invariants. No I/O.
import {
  COUPON_DISCOUNT_TYPES,
  COUPON_SCOPES,
  COUPON_STATUSES,
  CURRENCY_CODES,
  findPlanCatalogEntry,
  type Money,
  money,
  type CouponDiscountType,
  type CouponScope,
  type CouponStatus,
  type CurrencyCode,
  type UserRole,
} from "@trips-app/domain";

export {
  COUPON_DISCOUNT_TYPES,
  COUPON_SCOPES,
  COUPON_STATUSES,
  CURRENCY_CODES,
  CURRENCY_CODES as SUPPORTED_CURRENCIES,
  findPlanCatalogEntry,
  type Money,
  money,
  type CouponDiscountType,
  type CouponScope,
  type CouponStatus,
  type CurrencyCode,
  type UserRole,
};

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
