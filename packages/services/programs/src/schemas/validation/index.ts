// Zod schemas that validate input at the boundary.
// Derived from @trips-app/db/zod table definitions.
import {
  insertTripProgramsSchema,
  selectTripProgramsSchema,
  updateTripProgramsSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

import { SUPPORTED_CURRENCIES } from "../../model";

export const tripProgramSelectSchema = selectTripProgramsSchema;
export const tripProgramInsertSchema = insertTripProgramsSchema;
export const tripProgramUpdateSchema = updateTripProgramsSchema;

export const tripProgramInsertBaseSchema = insertTripProgramsSchema.extend({
  titleAr: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().min(1).max(200),
  descriptionAr: z.string().trim().max(4000),
  descriptionEn: z.string().trim().max(4000),
  dayNumber: z.number().int().min(1).max(60),
  priceMinor: z.number().int().min(0).max(100_000_000),
  currencyCode: z.enum(SUPPORTED_CURRENCIES),
  status: insertTripProgramsSchema.shape.status,
  attachmentUrls: z.array(z.string().trim().min(1).max(2048)).max(15),
});

export const createProgramInputSchema = tripProgramInsertBaseSchema
  .pick({
    tripId: true,
    titleAr: true,
    titleEn: true,
  })
  .extend({
    descriptionAr: z.string().trim().max(4000).optional(),
    descriptionEn: z.string().trim().max(4000).optional(),
    dayNumber: z.number().int().min(1).max(60).optional(),
    startsAt: z.iso.datetime().nullable().optional(),
    endsAt: z.iso.datetime().nullable().optional(),
    locationNameAr: z.string().trim().max(200).nullable().optional(),
    locationNameEn: z.string().trim().max(200).nullable().optional(),
    priceMinor: z.number().int().min(0).max(100_000_000).optional(),
    currencyCode: z.enum(SUPPORTED_CURRENCIES).optional(),
    isIncludedInBase: z.boolean().optional(),
    capacity: z.number().int().min(1).max(10_000).nullable().optional(),
    sortOrder: z.number().int().min(0).max(500).optional(),
    attachmentUrls: z.array(z.string().trim().min(1).max(2048)).max(15).optional(),
    fileIds: z.array(z.uuid()).max(15).optional(),
  });

export const updateProgramInputSchema = createProgramInputSchema
  .omit({ tripId: true })
  .partial()
  .extend({
    programId: z.uuid(),
    status: insertTripProgramsSchema.shape.status.optional(),
    fileIds: z.array(z.uuid()).max(15).optional(),
  });

export const deleteProgramInputSchema = z.object({
  programId: z.uuid(),
});

export const listTripProgramsInputSchema = tripProgramInsertBaseSchema
  .pick({
    tripId: true,
  })
  .extend({
    includeCancelled: z.boolean().optional(),
  });

export const listPublicTripProgramsInputSchema = tripProgramInsertBaseSchema
  .pick({
    tripId: true,
  })
  .partial()
  .optional();
