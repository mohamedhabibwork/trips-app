// Zod schemas that validate input at the boundary.
import {
  insertSupplierAvailabilityBlocksSchema,
  selectSupplierAvailabilityBlocksSchema,
  updateSupplierAvailabilityBlocksSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

// Table Base Schemas
export const supplierAvailabilityBlockSelectSchema = selectSupplierAvailabilityBlocksSchema;
export const supplierAvailabilityBlockInsertSchema = insertSupplierAvailabilityBlocksSchema;
export const supplierAvailabilityBlockUpdateSchema = updateSupplierAvailabilityBlocksSchema;

// Boundary Procedure Schemas
export const listMyBlocksInputSchema = z
  .object({
    from: z.iso.datetime().optional(),
    to: z.iso.datetime().optional(),
  })
  .optional();

export const upsertAvailabilityBlockInputSchema = insertSupplierAvailabilityBlocksSchema
  .pick({
    blockType: true,
    tripId: true,
    notes: true,
  })
  .extend({
    blockType: insertSupplierAvailabilityBlocksSchema.shape.blockType,
    startsAt: z.iso.datetime(),
    endsAt: z.iso.datetime(),
    tripId: z.uuid().nullable().optional(),
    notes: z.string().trim().max(500).nullable().optional(),
  });

export const deleteAvailabilityBlockInputSchema = selectSupplierAvailabilityBlocksSchema
  .pick({ id: true })
  .extend({
    blockId: selectSupplierAvailabilityBlocksSchema.shape.id,
  })
  .omit({ id: true });

export const checkSupplierAvailabilityInputSchema = insertSupplierAvailabilityBlocksSchema
  .pick({
    supplierAccountId: true,
  })
  .extend({
    supplierAccountId: selectSupplierAvailabilityBlocksSchema.shape.supplierAccountId,
    startsAt: z.iso.datetime(),
    endsAt: z.iso.datetime(),
  });
