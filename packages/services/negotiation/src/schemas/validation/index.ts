// Zod schemas that validate input at the boundary.
// Derived from @trips-app/db/zod table definitions.
import {
  insertSupplierNegotiationsSchema,
  selectSupplierNegotiationsSchema,
  updateSupplierNegotiationsSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

import { NEGOTIATION_STATUSES } from "../../model";

export const supplierNegotiationSelectSchema = selectSupplierNegotiationsSchema;
export const supplierNegotiationInsertSchema = insertSupplierNegotiationsSchema;
export const supplierNegotiationUpdateSchema = updateSupplierNegotiationsSchema;

export const createNegotiationOfferInputSchema = insertSupplierNegotiationsSchema
  .pick({
    tripId: true,
    supplierAccountId: true,
    supplierRole: true,
  })
  .extend({
    vehicleId: z.uuid().nullable().optional(),
    offerAmountMinor: z.number().int().min(100).max(100_000_000),
    currencyCode: insertSupplierNegotiationsSchema.shape.currencyCode.optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
    expiryHours: z.number().int().min(1).max(168).optional(),
  });

export const respondNegotiationOfferInputSchema = z.object({
  negotiationId: z.uuid(),
  action: z.enum(["accept", "counter", "decline", "cancel"]),
  counterOfferMinor: z.number().int().min(100).max(100_000_000).optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const listNegotiationsInputSchema = selectSupplierNegotiationsSchema
  .pick({
    tripId: true,
    status: true,
  })
  .extend({
    tripId: selectSupplierNegotiationsSchema.shape.tripId.optional(),
    status: z.enum(NEGOTIATION_STATUSES).optional(),
  })
  .optional();
