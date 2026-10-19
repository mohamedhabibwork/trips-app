// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { and, asc, type Database, eq, gt, lt, schema } from "@trips-app/db";

import type { AvailabilityBlockType, SupplierRole } from "../model";

export type { Database as ServiceDatabase } from "@trips-app/db";

const { supplierAvailabilityBlocks } = schema;

export function createAvailabilityRepository(db: Database) {
  return {
    async listBlocksForSupplier(supplierAccountId: string, range?: { from?: Date; to?: Date }) {
      const conditions = [eq(supplierAvailabilityBlocks.supplierAccountId, supplierAccountId)];
      if (range?.from) {
        conditions.push(gt(supplierAvailabilityBlocks.endsAt, range.from));
      }
      if (range?.to) {
        conditions.push(lt(supplierAvailabilityBlocks.startsAt, range.to));
      }
      return db
        .select()
        .from(supplierAvailabilityBlocks)
        .where(and(...conditions))
        .orderBy(asc(supplierAvailabilityBlocks.startsAt));
    },

    async insertBlock(values: {
      supplierAccountId: string;
      supplierRole: SupplierRole;
      tenantId: string | null;
      blockType: AvailabilityBlockType;
      startsAt: Date;
      endsAt: Date;
      tripId: string | null;
      notes: string | null;
    }) {
      const now = new Date();
      const [created] = await db
        .insert(supplierAvailabilityBlocks)
        .values({
          ...values,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      return created!;
    },

    async deleteBlockForSupplier(supplierAccountId: string, blockId: string) {
      const [deleted] = await db
        .delete(supplierAvailabilityBlocks)
        .where(
          and(
            eq(supplierAvailabilityBlocks.id, blockId),
            eq(supplierAvailabilityBlocks.supplierAccountId, supplierAccountId),
          ),
        )
        .returning();
      return deleted ?? null;
    },
  };
}
