import {
  selectCheckInRecordsSchema,
  selectParentChildLinksSchema,
  selectTripTrackingEventsSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

export const parentChildLinkDtoSchema = selectParentChildLinksSchema;

export const childTripLiveStatusDtoSchema = z.object({
  link: parentChildLinkDtoSchema,
  checkInRecord: selectCheckInRecordsSchema.nullable(),
  events: z.array(selectTripTrackingEventsSchema),
});
