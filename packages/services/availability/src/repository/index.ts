// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { and, asc, eq, gt, lt, schema } from "@trips-app/db";
import type { ServiceDatabase } from "@trips-app/db";

import type { AvailabilityBlockType, SupplierRole } from "../model";

export type { ServiceDatabase };

const { supplierAvailabilityBlocks } = schema;

export function createAvailabilityRepository(db: ServiceDatabase) {
  return {
    async listBlocksForSupplier(
      supplierAccountId: string,
      range?: {
        from?: Date;
        to?: Date;
        blockType?: AvailabilityBlockType;
        limit?: number;
        offset?: number;
      },
    ) {
      let query = db.select().from(supplierAvailabilityBlocks).$dynamic();

      const conditions = [eq(supplierAvailabilityBlocks.supplierAccountId, supplierAccountId)];
      if (range?.from) {
        conditions.push(gt(supplierAvailabilityBlocks.endsAt, range.from));
      }
      if (range?.to) {
        conditions.push(lt(supplierAvailabilityBlocks.startsAt, range.to));
      }
      if (range?.blockType) {
        conditions.push(eq(supplierAvailabilityBlocks.blockType, range.blockType));
      }

      query = query.where(and(...conditions)).orderBy(asc(supplierAvailabilityBlocks.startsAt));
      if (range?.limit !== undefined) query = query.limit(range.limit);
      if (range?.offset !== undefined) query = query.offset(range.offset);
      return query;
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

    async insertBlocks(
      blocks: Array<{
        supplierAccountId: string;
        supplierRole: SupplierRole;
        tenantId: string | null;
        blockType: AvailabilityBlockType;
        startsAt: Date;
        endsAt: Date;
        tripId: string | null;
        notes: string | null;
      }>,
    ) {
      if (blocks.length === 0) return [];
      const now = new Date();
      return db
        .insert(supplierAvailabilityBlocks)
        .values(blocks.map((b) => ({ ...b, createdAt: now, updatedAt: now })))
        .returning();
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
