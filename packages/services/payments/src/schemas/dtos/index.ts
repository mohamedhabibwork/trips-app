import { selectPaymentTransactionsSchema } from "@trips-app/db/zod";
import { z } from "zod/v4";

export const paymentTransactionDtoSchema = selectPaymentTransactionsSchema;

const receiptLineDtoSchema = z.object({
  kind: z.enum(["trip", "programs", "discount", "subscription"]),
  titleAr: z.string().nullable(),
  titleEn: z.string().nullable(),
  couponCode: z.string().nullable(),
  quantity: z.number().int(),
  amountMinor: z.number().int(),
});

/** A receipt for one paid payment (SCR-SHR-12). Amounts are minor units in `currencyCode`. */
export const receiptDtoSchema = z.object({
  paymentId: z.uuid(),
  invoiceNumber: z.string(),
  status: selectPaymentTransactionsSchema.shape.status,
  gateway: selectPaymentTransactionsSchema.shape.gateway,
  issuedAt: z.date(),
  billedToName: z.string(),
  bookingReference: z.string().nullable(),
  lines: z.array(receiptLineDtoSchema),
  subtotalMinor: z.number().int(),
  totalMinor: z.number().int(),
  refundedMinor: z.number().int(),
  currencyCode: selectPaymentTransactionsSchema.shape.currencyCode,
});
