import { bookingPassengerSchema } from "@trips-app/db/zod";
import { z } from "zod/v4";

export const createBookingSchema = z.object({
  tripId: z.uuid(),
  vehicleId: z.uuid().nullable().optional(),
  passengers: z.array(bookingPassengerSchema).min(1).max(20),
  selectedProgramIds: z.array(z.uuid()).default([]),
  seatLabels: z.array(z.string().trim().min(1).max(16)).default([]),
  couponCode: z.string().trim().min(3).max(40).nullable().optional(),
  paymentGateway: z.enum(["stripe", "paymob", "fawry"]).default("paymob"),
  /** Traveler plan used for the program-only discount (Explorer 5% / VIP 10%). */
  planTier: z.enum(["free", "explorer", "vip"]).default("free"),
});

export const cancelBookingSchema = z.object({
  bookingId: z.uuid(),
  reason: z.string().trim().min(2).max(500),
});

export const getBookingSchema = z.object({
  bookingId: z.uuid(),
});

export const listOrganizationBookingsSchema = z
  .object({
    tripId: z.uuid().optional(),
  })
  .optional();
