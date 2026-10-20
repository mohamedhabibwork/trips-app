import {
  insertTripTrackingEventsSchema,
  selectTripTrackingEventsSchema,
  trackingCoordinatesSchema,
  updateTripTrackingEventsSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

export const tripTrackingEventSelectSchema = selectTripTrackingEventsSchema;
export const tripTrackingEventInsertSchema = insertTripTrackingEventsSchema;
export const tripTrackingEventUpdateSchema = updateTripTrackingEventsSchema;

export const recordGpsPingSchema = insertTripTrackingEventsSchema
  .pick({
    tripId: true,
    vehicleId: true,
    coordinates: true,
  })
  .extend({
    vehicleId: z.uuid().nullable().optional(),
    coordinates: trackingCoordinatesSchema,
  });

export const recordChildSafetyEventSchema = insertTripTrackingEventsSchema
  .pick({
    tripId: true,
    vehicleId: true,
    childPassengerId: true,
    messageAr: true,
    messageEn: true,
  })
  .extend({
    vehicleId: z.uuid().nullable().optional(),
    childPassengerId: z.string().trim().min(1).max(80),
    eventType: z.enum(["child_boarded", "child_disembarked"]),
    messageAr: z.string().trim().max(400).optional(),
    messageEn: z.string().trim().max(400).optional(),
  });

export const getTripLiveTrackingSchema = z.object({
  tripId: z.uuid(),
});
