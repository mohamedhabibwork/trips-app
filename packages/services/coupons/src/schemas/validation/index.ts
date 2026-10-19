// Zod schemas that validate input at the boundary.
import { z } from "zod/v4";

import { COUPON_DISCOUNT_TYPES, COUPON_STATUSES, SUPPORTED_CURRENCIES } from "../../model";

export const createCouponInputSchema = z.object({
  code: z.string().trim().min(3).max(40),
  titleAr: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().min(1).max(200),
  discountType: z.enum(COUPON_DISCOUNT_TYPES),
  discountValue: z.number().int().min(1).max(10_000_000),
  maxDiscountMinor: z.number().int().min(1).max(100_000_000).nullable().optional(),
  minOrderMinor: z.number().int().min(0).max(100_000_000).optional(),
  currencyCode: z.enum(SUPPORTED_CURRENCIES).optional(),
  maxRedemptions: z.number().int().min(1).max(1_000_000).nullable().optional(),
  tripId: z.uuid().nullable().optional(),
  startsAt: z.iso.datetime().nullable().optional(),
  expiresAt: z.iso.datetime().nullable().optional(),
});

export const updateCouponStatusInputSchema = z.object({
  couponId: z.uuid(),
  status: z.enum(COUPON_STATUSES),
});

export const listCouponsInputSchema = z
  .object({
    status: z.enum(COUPON_STATUSES).optional(),
  })
  .optional();

export const validateCouponInputSchema = z.object({
  code: z.string().trim().min(1).max(40),
  tripId: z.uuid().optional(),
  subtotalMinor: z.number().int().min(0).max(100_000_000),
});
