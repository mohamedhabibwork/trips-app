import { selectCheckInRecordsSchema, selectTripTrackingEventsSchema } from "@trips-app/db/zod";
import { z } from "zod/v4";

export const moderatorManifestItemDtoSchema = selectCheckInRecordsSchema;
export const moderatorTrackingEventDtoSchema = selectTripTrackingEventsSchema;

export const moderatorAssignmentDtoSchema = z.object({
  tenantId: z.uuid(),
  tripId: z.uuid(),
  vehicleId: z.uuid(),
  tripTitleAr: z.string(),
  tripTitleEn: z.string(),
  totalPassengers: z.number().int(),
  checkedInPassengers: z.number().int(),
});
