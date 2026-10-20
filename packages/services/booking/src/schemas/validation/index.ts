import {
  bookingPassengerSchema,
  insertBookingsSchema,
  selectBookingsSchema,
  updateBookingsSchema,
} from "@trips-app/db/zod";
import { TRAVELER_PLAN_CODES } from "@trips-app/domain";
import { z } from "zod/v4";

// Table Base Schemas
export const bookingSelectSchema = selectBookingsSchema;
export const bookingInsertSchema = insertBookingsSchema;
export const bookingUpdateSchema = updateBookingsSchema;

// Boundary Procedure Schemas
export const createBookingSchema = insertBookingsSchema
  .pick({
    tripId: true,
    vehicleId: true,
    passengers: true,
    selectedProgramIds: true,
    seatLabels: true,
    couponCode: true,
    paymentGateway: true,
  })
  .extend({
    vehicleId: z.uuid().nullable().optional(),
    passengers: z.array(bookingPassengerSchema).min(1).max(20),
    selectedProgramIds: z.array(z.uuid()).default([]),
    seatLabels: z.array(z.string().trim().min(1).max(16)).default([]),
    couponCode: z.string().trim().min(3).max(40).nullable().optional(),
    // "stub" is the dev/test dry-run gateway (see PaymentGatewayCode in domain).
    paymentGateway: z.enum(["stripe", "paymob", "fawry", "stub"]).default("paymob"),
    /** Traveler plan used for the program-only discount (Explorer 5% / VIP 10%). */
    planTier: z.enum(TRAVELER_PLAN_CODES).default("free"),
  });

export const cancelBookingSchema = selectBookingsSchema
  .pick({
    id: true,
  })
  .extend({
    bookingId: selectBookingsSchema.shape.id,
    reason: z.string().trim().min(2).max(500),
  })
  .omit({ id: true });

export const getBookingSchema = selectBookingsSchema
  .pick({
    id: true,
  })
  .extend({
    bookingId: selectBookingsSchema.shape.id,
  })
  .omit({ id: true });

export const listOrganizationBookingsSchema = selectBookingsSchema
  .pick({
    tripId: true,
  })
  .partial()
  .optional();
