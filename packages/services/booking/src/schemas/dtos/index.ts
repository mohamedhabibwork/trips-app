import { selectBookingsSchema, selectCheckInRecordsSchema } from "@trips-app/db/zod";
import { z } from "zod/v4";

export const bookingDtoSchema = selectBookingsSchema;
export const checkInRecordDtoSchema = selectCheckInRecordsSchema;

export type BookingPricingDto = z.infer<typeof bookingPricingDtoSchema>;

export const bookingPricingDtoSchema = z.object({
  subtotalMinor: z.number().int().nonnegative(),
  programsTotalMinor: z.number().int().nonnegative(),
  /** Plan discount applies to selected programs only, never the trip base price. */
  planDiscountMinor: z.number().int().nonnegative(),
  couponDiscountMinor: z.number().int().nonnegative(),
  totalAmountMinor: z.number().int().nonnegative(),
  planTier: z.enum(["free", "explorer", "vip"]),
  couponCode: z.string().nullable(),
  couponFailureReason: z.string().nullable(),
});

export const bookingDetailDtoSchema = z.object({
  booking: bookingDtoSchema,
  boardingPasses: z.array(checkInRecordDtoSchema),
  pricing: bookingPricingDtoSchema.optional(),
});
