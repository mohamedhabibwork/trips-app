// Zod schemas that validate input at the boundary.
// Derived from @trips-app/db/zod table definitions.
import {
  insertPaymentTransactionsSchema,
  selectPaymentTransactionsSchema,
  updatePaymentTransactionsSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

export const paymentTransactionSelectSchema = selectPaymentTransactionsSchema;
export const paymentTransactionInsertSchema = insertPaymentTransactionsSchema;
export const paymentTransactionUpdateSchema = updatePaymentTransactionsSchema;

export const createPaymentIntentSchema = insertPaymentTransactionsSchema
  .pick({
    bookingId: true,
    gateway: true,
  })
  .extend({
    bookingId: z.uuid().nullable().optional(),
    purpose: z.enum(["trip_booking", "subscription_upgrade"]).default("trip_booking"),
    amountMinor: z.number().int().min(100).max(500_000_000).optional(),
    currencyCode: insertPaymentTransactionsSchema.shape.currencyCode.default("EGP"),
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

export const processGatewayCallbackSchema = z.object({
  gateway: insertPaymentTransactionsSchema.shape.gateway,
  providerReference: z.string().trim().min(4).max(120),
  outcome: z.enum(["succeeded", "failed"]),
  /** Gateway event id; repeated deliveries must be idempotent (FR-PAY-02). */
  eventId: z.string().trim().min(1).max(200).optional(),
});

export const expireStalePaymentsSchema = z
  .object({
    /** Override the D-30 window in seconds (tests only). */
    olderThanSeconds: z.number().int().min(1).max(3600).optional(),
  })
  .optional();

export const getReceiptSchema = z.object({
  paymentId: z.uuid(),
});
