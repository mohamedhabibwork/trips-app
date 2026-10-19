// Zod schemas that validate input at the boundary.
import { createInsertSchema, schema } from "@trips-app/db/zod";
import { z } from "zod/v4";

import { SUPPORTED_CURRENCIES, TRIP_PROGRAM_STATUSES } from "../../model";

export const tripProgramInsertBaseSchema = createInsertSchema(schema.tripPrograms, {
  titleAr: (col) => col.trim().min(1).max(200),
  titleEn: (col) => col.trim().min(1).max(200),
  descriptionAr: (col) => col.trim().max(4000),
  descriptionEn: (col) => col.trim().max(4000),
  dayNumber: (col) => col.int().min(1).max(60),
  priceMinor: (col) => col.int().min(0).max(100_000_000),
  currencyCode: () => z.enum(SUPPORTED_CURRENCIES),
  status: () => z.enum(TRIP_PROGRAM_STATUSES),
  attachmentUrls: () => z.array(z.string().trim().min(1).max(2048)).max(15),
});

export const createProgramInputSchema = z.object({
  tripId: z.uuid(),
  titleAr: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().min(1).max(200),
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

export const updateProgramInputSchema = z.object({
  programId: z.uuid(),
  titleAr: z.string().trim().min(1).max(200).optional(),
  titleEn: z.string().trim().min(1).max(200).optional(),
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
  status: z.enum(TRIP_PROGRAM_STATUSES).optional(),
  fileIds: z.array(z.uuid()).max(15).optional(),
});

export const deleteProgramInputSchema = z.object({
  programId: z.uuid(),
});

export const listTripProgramsInputSchema = z.object({
  tripId: z.uuid(),
  includeCancelled: z.boolean().optional(),
});

export const listPublicTripProgramsInputSchema = z
  .object({
    tripId: z.uuid().optional(),
  })
  .optional();
