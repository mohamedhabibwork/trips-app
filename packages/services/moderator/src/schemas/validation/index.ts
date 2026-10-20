import {
  insertCheckInRecordsSchema,
  insertTripTrackingEventsSchema,
  selectCheckInRecordsSchema,
  selectTripTrackingEventsSchema,
  updateCheckInRecordsSchema,
  updateTripTrackingEventsSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

// Table Base Schemas
export const checkInRecordSelectSchema = selectCheckInRecordsSchema;
export const checkInRecordInsertSchema = insertCheckInRecordsSchema;
export const checkInRecordUpdateSchema = updateCheckInRecordsSchema;

export const tripTrackingEventSelectSchema = selectTripTrackingEventsSchema;
export const tripTrackingEventInsertSchema = insertTripTrackingEventsSchema;
export const tripTrackingEventUpdateSchema = updateTripTrackingEventsSchema;

// Boundary Procedure Schemas
export const recordBoardingCheckInSchema = updateCheckInRecordsSchema
  .pick({
    status: true,
    notes: true,
  })
  .extend({
    checkInRecordId: selectCheckInRecordsSchema.shape.id,
    status: z.enum(["checked_in", "no_show"]).default("checked_in"),
    notes: z.string().trim().max(400).optional(),
  });

export const recordHeadcountSchema = z.object({
  countedPassengers: z.number().int().min(0).max(200),
  notes: z.string().trim().max(400).optional(),
});

export const raiseSafetyAlertSchema = insertTripTrackingEventsSchema
  .pick({
    severity: true,
    messageAr: true,
    messageEn: true,
  })
  .extend({
    severity: z.enum(["warning", "critical"]).default("warning"),
    messageAr: z.string().trim().min(3).max(500),
    messageEn: z.string().trim().min(3).max(500),
  });
