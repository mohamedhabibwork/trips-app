import { trackingCoordinatesSchema } from "@trips-app/db/zod";
import { z } from "zod/v4";

export const recordGpsPingSchema = z.object({
  tripId: z.uuid(),
  vehicleId: z.uuid().nullable().optional(),
  coordinates: trackingCoordinatesSchema,
});

export const recordChildSafetyEventSchema = z.object({
  tripId: z.uuid(),
  vehicleId: z.uuid().nullable().optional(),
  childPassengerId: z.string().trim().min(1).max(80),
  eventType: z.enum(["child_boarded", "child_disembarked"]),
  messageAr: z.string().trim().max(400).optional(),
  messageEn: z.string().trim().max(400).optional(),
});

export const getTripLiveTrackingSchema = z.object({
  tripId: z.uuid(),
});
