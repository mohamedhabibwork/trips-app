import { z } from "zod/v4";

export const createPaymentIntentSchema = z.object({
  bookingId: z.uuid().nullable().optional(),
  purpose: z.enum(["trip_booking", "subscription_upgrade"]).default("trip_booking"),
  gateway: z.enum(["stripe", "paymob", "fawry"]),
  amountMinor: z.number().int().min(100).max(500_000_000).optional(),
  currencyCode: z.enum(["EGP", "SAR", "AED"]).default("EGP"),
});

export const confirmPaymentSchema = z.object({
  paymentId: z.uuid(),
});

export const refundPaymentSchema = z.object({
  paymentId: z.uuid(),
  refundAmountMinor: z.number().int().min(1).max(500_000_000).optional(),
  reason: z.string().trim().min(2).max(500).optional(),
});

export const openDisputeSchema = z.object({
  paymentId: z.uuid(),
  reason: z.string().trim().min(5).max(1000),
});

export const resolveDisputeSchema = z.object({
  paymentId: z.uuid(),
  resolution: z.enum(["resolved_refund", "resolved_merchant"]),
});
