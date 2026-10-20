import {
  insertAccountingLedgerEntriesSchema,
  selectAccountingLedgerEntriesSchema,
  updateAccountingLedgerEntriesSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

import { LEDGER_ENTRY_STATUSES } from "../../model";

// Table Base Schemas
export const accountingLedgerEntrySelectSchema = selectAccountingLedgerEntriesSchema;
export const accountingLedgerEntryInsertSchema = insertAccountingLedgerEntriesSchema;
export const accountingLedgerEntryUpdateSchema = updateAccountingLedgerEntriesSchema;

// Boundary Procedure Schemas
export const listLedgerEntriesSchema = selectAccountingLedgerEntriesSchema
  .pick({
    tripId: true,
    status: true,
  })
  .extend({
    tripId: z.uuid().optional(),
    status: z.enum(LEDGER_ENTRY_STATUSES).optional(),
  })
  .optional();

export const createPayoutSettlementSchema = insertAccountingLedgerEntriesSchema
  .pick({
    currencyCode: true,
    invoiceNumber: true,
    description: true,
  })
  .extend({
    amountMinor: z.number().int().min(100).max(500_000_000),
    currencyCode: insertAccountingLedgerEntriesSchema.shape.currencyCode.default("EGP"),
    invoiceNumber: z.string().trim().min(2).max(80).optional(),
    description: z.string().trim().min(3).max(300),
  });

export const flagReconciliationExceptionSchema = selectAccountingLedgerEntriesSchema
  .pick({
    id: true,
  })
  .extend({
    entryId: selectAccountingLedgerEntriesSchema.shape.id,
    reason: z.string().trim().min(3).max(500),
  })
  .omit({ id: true });
