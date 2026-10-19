// Zod schemas that validate input at the boundary.
import { z } from "zod/v4";

import { NEGOTIATION_STATUSES, PLATFORM_SUPPLIER_ROLES, SUPPORTED_CURRENCIES } from "../../model";

export const createNegotiationOfferInputSchema = z.object({
  tripId: z.uuid(),
  vehicleId: z.uuid().nullable().optional(),
  supplierAccountId: z.uuid(),
  supplierRole: z.enum(PLATFORM_SUPPLIER_ROLES),
  offerAmountMinor: z.number().int().min(100).max(100_000_000),
  currencyCode: z.enum(SUPPORTED_CURRENCIES).optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  expiryHours: z.number().int().min(1).max(168).optional(),
});

export const respondNegotiationOfferInputSchema = z.object({
  negotiationId: z.uuid(),
  action: z.enum(["accept", "counter", "decline", "cancel"]),
  counterOfferMinor: z.number().int().min(100).max(100_000_000).optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const listNegotiationsInputSchema = z
  .object({
    tripId: z.uuid().optional(),
    status: z.enum(NEGOTIATION_STATUSES).optional(),
  })
  .optional();
