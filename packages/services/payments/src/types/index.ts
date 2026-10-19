import type { z } from "zod/v4";
import type { paymentTransactionDtoSchema, receiptDtoSchema } from "../schemas";
import type {
  confirmPaymentSchema,
  createPaymentIntentSchema,
  getReceiptSchema,
  openDisputeSchema,
  refundPaymentSchema,
  resolveDisputeSchema,
} from "../schemas/validation";

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
export type OpenDisputeInput = z.infer<typeof openDisputeSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
export type PaymentTransactionDto = z.infer<typeof paymentTransactionDtoSchema>;
export type GetReceiptInput = z.infer<typeof getReceiptSchema>;
export type ReceiptDto = z.infer<typeof receiptDtoSchema>;
