import type { z } from "zod/v4";
import type { trackingEventDtoSchema, tripLiveTrackingDtoSchema } from "../schemas";
import type { recordChildSafetyEventSchema, recordGpsPingSchema } from "../schemas/validation";

export type RecordGpsPingInput = z.infer<typeof recordGpsPingSchema>;
export type RecordChildSafetyEventInput = z.infer<typeof recordChildSafetyEventSchema>;
export type TrackingEventDto = z.infer<typeof trackingEventDtoSchema>;
export type TripLiveTrackingDto = z.infer<typeof tripLiveTrackingDtoSchema>;
