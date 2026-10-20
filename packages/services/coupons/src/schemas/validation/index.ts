// Zod schemas that validate input at the boundary.
import { insertCouponsSchema, selectCouponsSchema, updateCouponsSchema } from "@trips-app/db/zod";
import { z } from "zod/v4";

import { COUPON_STATUSES } from "../../model";

// Table Base Schemas
export const couponSelectSchema = selectCouponsSchema;
export const couponInsertSchema = insertCouponsSchema;
export const couponUpdateSchema = updateCouponsSchema;

// Boundary Procedure Schemas
export const createCouponInputSchema = insertCouponsSchema
  .pick({
    code: true,
    titleAr: true,
    titleEn: true,
    discountType: true,
    discountValue: true,
    maxDiscountMinor: true,
    minOrderMinor: true,
    currencyCode: true,
    maxRedemptions: true,
    tripId: true,
  })
  .extend({
    code: z.string().trim().min(3).max(40),
    titleAr: z.string().trim().min(1).max(200),
    titleEn: z.string().trim().min(1).max(200),
    discountType: insertCouponsSchema.shape.discountType,
    discountValue: z.number().int().min(1).max(10_000_000),
    maxDiscountMinor: z.number().int().min(1).max(100_000_000).nullable().optional(),
    minOrderMinor: z.number().int().min(0).max(100_000_000).optional(),
    currencyCode: insertCouponsSchema.shape.currencyCode.optional(),
    maxRedemptions: z.number().int().min(1).max(1_000_000).nullable().optional(),
    tripId: z.uuid().nullable().optional(),
    startsAt: z.iso.datetime().nullable().optional(),
    expiresAt: z.iso.datetime().nullable().optional(),
  });

export const updateCouponStatusInputSchema = updateCouponsSchema
  .pick({
    status: true,
  })
  .extend({
    couponId: selectCouponsSchema.shape.id,
    status: z.enum(COUPON_STATUSES),
  });

export const listCouponsInputSchema = selectCouponsSchema
  .pick({
    status: true,
  })
  .extend({
    status: z.enum(COUPON_STATUSES).optional(),
  })
  .optional();

export const validateCouponInputSchema = selectCouponsSchema
  .pick({
    code: true,
    tripId: true,
  })
  .extend({
    code: z.string().trim().min(1).max(40),
    tripId: z.uuid().optional(),
    subtotalMinor: z.number().int().min(0).max(100_000_000),
  });
