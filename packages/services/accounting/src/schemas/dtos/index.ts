import { selectAccountingLedgerEntriesSchema } from "@trips-app/db/zod";
import { z } from "zod/v4";

export const ledgerEntryDtoSchema = selectAccountingLedgerEntriesSchema;

export const accountingSummaryDtoSchema = z.object({
  grossRevenueMinor: z.number().int(),
  platformCommissionMinor: z.number().int(),
  refundsMinor: z.number().int(),
  payoutsSettledMinor: z.number().int(),
  availableBalanceMinor: z.number().int(),
  currencyCode: z.enum(["EGP", "SAR", "AED"]),
});
