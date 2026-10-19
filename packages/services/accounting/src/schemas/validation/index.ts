import { z } from "zod/v4";

export const listLedgerEntriesSchema = z
  .object({
    tripId: z.uuid().optional(),
    status: z.enum(["posted", "settled", "reconciliation_exception"]).optional(),
  })
  .optional();

export const createPayoutSettlementSchema = z.object({
  amountMinor: z.number().int().min(100).max(500_000_000),
  currencyCode: z.enum(["EGP", "SAR", "AED"]).default("EGP"),
  invoiceNumber: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().min(3).max(300),
});

export const flagReconciliationExceptionSchema = z.object({
  entryId: z.uuid(),
  reason: z.string().trim().min(3).max(500),
});
