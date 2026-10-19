import { selectBookingsSchema, selectCheckInRecordsSchema } from "@trips-app/db/zod";
import { z } from "zod/v4";

export const bookingDtoSchema = selectBookingsSchema;
export const checkInRecordDtoSchema = selectCheckInRecordsSchema;

export const bookingDetailDtoSchema = z.object({
  booking: bookingDtoSchema,
  boardingPasses: z.array(checkInRecordDtoSchema),
});
