import type { z } from "zod/v4";
import type { bookingDetailDtoSchema, bookingDtoSchema } from "../schemas";
import type { cancelBookingSchema, createBookingSchema } from "../schemas/validation";

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type BookingDto = z.infer<typeof bookingDtoSchema>;
export type BookingDetailDto = z.infer<typeof bookingDetailDtoSchema>;
