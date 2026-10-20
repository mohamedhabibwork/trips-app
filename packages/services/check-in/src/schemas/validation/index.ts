import {
  insertCheckInRecordsSchema,
  selectCheckInRecordsSchema,
  updateCheckInRecordsSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

// Table Base Schemas
export const checkInRecordSelectSchema = selectCheckInRecordsSchema;
export const checkInRecordInsertSchema = insertCheckInRecordsSchema;
export const checkInRecordUpdateSchema = updateCheckInRecordsSchema;

// Boundary Procedure Schemas
export const listTripManifestSchema = selectCheckInRecordsSchema
  .pick({
    tripId: true,
    vehicleId: true,
  })
  .extend({
    vehicleId: z.uuid().optional(),
  });

export const verifyAndCheckInByQrSchema = selectCheckInRecordsSchema
  .pick({
    qrCodeToken: true,
  })
  .extend({
    qrCodeToken: z.string().trim().min(4).max(120),
  });

export const manualCheckInOverrideSchema = updateCheckInRecordsSchema
  .pick({
    status: true,
    notes: true,
  })
  .extend({
    checkInRecordId: selectCheckInRecordsSchema.shape.id,
    status: z.enum(["checked_in", "no_show"]),
    notes: z.string().trim().min(2).max(500),
  });

export const getMyBoardingPassesSchema = selectCheckInRecordsSchema
  .pick({
    bookingId: true,
  })
  .partial()
  .optional();
