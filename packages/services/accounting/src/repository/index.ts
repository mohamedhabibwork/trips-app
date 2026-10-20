import { and, desc, eq, gte, lte } from "@trips-app/db";
import type { ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";
import type { CurrencyCode, LedgerEntryStatus } from "../model";

export type { ServiceDatabase };

export function createAccountingRepository(db: ServiceDatabase) {
  return {
    async listEntriesByTenant(
      tenantId: string,
      filters?: {
        tripId?: string;
        status?: LedgerEntryStatus;
        from?: Date;
        to?: Date;
        limit?: number;
        offset?: number;
      },
    ) {
      let query = db.select().from(schema.accountingLedgerEntries).$dynamic();

      const conditions = [eq(schema.accountingLedgerEntries.tenantId, tenantId)];
      if (filters?.tripId) {
        conditions.push(eq(schema.accountingLedgerEntries.tripId, filters.tripId));
      }
      if (filters?.status) {
        conditions.push(eq(schema.accountingLedgerEntries.status, filters.status));
      }
      if (filters?.from) {
        conditions.push(gte(schema.accountingLedgerEntries.occurredAt, filters.from));
      }
      if (filters?.to) {
        conditions.push(lte(schema.accountingLedgerEntries.occurredAt, filters.to));
      }

      query = query
        .where(and(...conditions))
        .orderBy(desc(schema.accountingLedgerEntries.occurredAt));
      if (filters?.limit !== undefined) query = query.limit(filters.limit);
      if (filters?.offset !== undefined) query = query.offset(filters.offset);
      return query;
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

    async insertLedgerEntries(entries: Array<typeof schema.accountingLedgerEntries.$inferInsert>) {
      if (entries.length === 0) return [];
      return db.insert(schema.accountingLedgerEntries).values(entries).returning();
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

    async listAllReconciliationExceptions(pagination?: { limit?: number; offset?: number }) {
      let query = db
        .select()
        .from(schema.accountingLedgerEntries)
        .$dynamic()
        .where(eq(schema.accountingLedgerEntries.status, "reconciliation_exception"))
        .orderBy(desc(schema.accountingLedgerEntries.occurredAt));
      if (pagination?.limit !== undefined) query = query.limit(pagination.limit);
      if (pagination?.offset !== undefined) query = query.offset(pagination.offset);
      return query;
    },
  };
}

export type AccountingRepository = ReturnType<typeof createAccountingRepository>;
