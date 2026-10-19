// Zod schemas that validate input at the boundary.
import { z } from "zod/v4";

import { AVAILABILITY_BLOCK_TYPES } from "../../model";

export const listMyBlocksInputSchema = z
  .object({
    from: z.iso.datetime().optional(),
    to: z.iso.datetime().optional(),
  })
  .optional();

export const upsertAvailabilityBlockInputSchema = z.object({
  blockType: z.enum(AVAILABILITY_BLOCK_TYPES),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  tripId: z.uuid().nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

export const deleteAvailabilityBlockInputSchema = z.object({
  blockId: z.uuid(),
});

export const checkSupplierAvailabilityInputSchema = z.object({
  supplierAccountId: z.uuid(),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
});
