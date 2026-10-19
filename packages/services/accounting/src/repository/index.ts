import { and, desc, eq } from "@trips-app/db";
import type { Database, Database as ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";
import type { CurrencyCode, LedgerEntryStatus } from "../model";

export type { ServiceDatabase };

export function createAccountingRepository(db: Database) {
  return {
    async listEntriesByTenant(
      tenantId: string,
      filters?: { tripId?: string; status?: LedgerEntryStatus },
    ) {
      const conditions = [eq(schema.accountingLedgerEntries.tenantId, tenantId)];
      if (filters?.tripId) {
        conditions.push(eq(schema.accountingLedgerEntries.tripId, filters.tripId));
      }
      if (filters?.status) {
        conditions.push(eq(schema.accountingLedgerEntries.status, filters.status));
      }
      return db
        .select()
        .from(schema.accountingLedgerEntries)
        .where(and(...conditions))
        .orderBy(desc(schema.accountingLedgerEntries.occurredAt));
    },

    async insertPayoutSettlement(values: {
      tenantId: string;
      amountMinor: number;
      currencyCode: CurrencyCode;
      invoiceNumber: string | null;
      description: string;
    }) {
      const [created] = await db
        .insert(schema.accountingLedgerEntries)
        .values({
          tenantId: values.tenantId,
          entryType: "payout_settlement",
          direction: "debit",
          grossAmountMinor: values.amountMinor,
          commissionAmountMinor: 0,
          netAmountMinor: values.amountMinor,
          currencyCode: values.currencyCode,
          status: "settled",
          invoiceNumber: values.invoiceNumber,
          description: values.description,
        })
        .returning();
      return created!;
    },

    async findEntryById(entryId: string) {
      const [row] = await db
        .select()
        .from(schema.accountingLedgerEntries)
        .where(eq(schema.accountingLedgerEntries.id, entryId))
        .limit(1);
      return row ?? null;
    },

    async flagEntryException(entryId: string, reason: string) {
      const [updated] = await db
        .update(schema.accountingLedgerEntries)
        .set({
          status: "reconciliation_exception",
          description: reason,
        })
        .where(eq(schema.accountingLedgerEntries.id, entryId))
        .returning();
      return updated ?? null;
    },

    async listAllReconciliationExceptions() {
      return db
        .select()
        .from(schema.accountingLedgerEntries)
        .where(eq(schema.accountingLedgerEntries.status, "reconciliation_exception"))
        .orderBy(desc(schema.accountingLedgerEntries.occurredAt));
    },
  };
}

export type AccountingRepository = ReturnType<typeof createAccountingRepository>;
