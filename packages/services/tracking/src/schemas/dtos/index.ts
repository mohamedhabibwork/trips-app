import { selectTripTrackingEventsSchema, trackingCoordinatesSchema } from "@trips-app/db/zod";
import { z } from "zod/v4";

export const trackingEventDtoSchema = selectTripTrackingEventsSchema;

export const tripLiveTrackingDtoSchema = z.object({
  tripId: z.string().uuid(),
  latestCoordinates: trackingCoordinatesSchema.nullable(),
  events: z.array(trackingEventDtoSchema),
});
