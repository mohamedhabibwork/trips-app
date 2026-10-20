// Zod schemas that validate input at the boundary.
import {
  insertTripSeatInventorySchema,
  selectTripSeatInventorySchema,
  updateTripSeatInventorySchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

export const tripSeatInventorySelectSchema = selectTripSeatInventorySchema;
export const tripSeatInventoryInsertSchema = insertTripSeatInventorySchema;
export const tripSeatInventoryUpdateSchema = updateTripSeatInventorySchema;

export const getSeatMapInputSchema = z.object({
  tripId: z.uuid(),
  vehicleId: z.uuid().optional(),
});

export const holdSeatsInputSchema = z.object({
  tripId: z.uuid(),
  vehicleId: z.uuid(),
  seatLabels: z.array(z.string().trim().min(1).max(16)).min(1).max(20),
});

export const releaseSeatHoldInputSchema = z.object({
  tripId: z.uuid(),
  vehicleId: z.uuid(),
  seatLabels: z.array(z.string().trim().min(1).max(16)).min(1).max(20),
});

export const assignSeatByOrgInputSchema = insertTripSeatInventorySchema
  .pick({
    tripId: true,
    vehicleId: true,
    seatLabel: true,
    bookingId: true,
    passengerName: true,
  })
  .extend({
    seatLabel: z.string().trim().min(1).max(16),
    status: z.enum(["available", "reserved", "blocked"]),
    bookingId: z.uuid().nullable().optional(),
    passengerName: z.string().trim().max(200).nullable().optional(),
  });
