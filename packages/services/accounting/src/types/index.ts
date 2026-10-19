import type { z } from "zod/v4";
import type { accountingSummaryDtoSchema, ledgerEntryDtoSchema } from "../schemas";
import type {
  createPayoutSettlementSchema,
  flagReconciliationExceptionSchema,
} from "../schemas/validation";

export type CreatePayoutSettlementInput = z.infer<typeof createPayoutSettlementSchema>;
export type FlagReconciliationExceptionInput = z.infer<typeof flagReconciliationExceptionSchema>;
export type LedgerEntryDto = z.infer<typeof ledgerEntryDtoSchema>;
export type AccountingSummaryDto = z.infer<typeof accountingSummaryDtoSchema>;
