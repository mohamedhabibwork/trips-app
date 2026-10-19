import type { z } from "zod/v4";
import type { paymentTransactionDtoSchema } from "../schemas";
import type {
  confirmPaymentSchema,
  createPaymentIntentSchema,
  openDisputeSchema,
  refundPaymentSchema,
  resolveDisputeSchema,
  processGatewayCallbackSchema,
} from "../schemas/validation";

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
export type OpenDisputeInput = z.infer<typeof openDisputeSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
export type PaymentTransactionDto = z.infer<typeof paymentTransactionDtoSchema>;
export type ProcessGatewayCallbackInput = z.infer<typeof processGatewayCallbackSchema>;
