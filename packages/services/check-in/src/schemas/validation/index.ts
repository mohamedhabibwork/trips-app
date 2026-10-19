import { z } from "zod/v4";

export const listTripManifestSchema = z.object({
  tripId: z.uuid(),
  vehicleId: z.uuid().optional(),
});

export const verifyAndCheckInByQrSchema = z.object({
  qrCodeToken: z.string().trim().min(4).max(120),
});

export const manualCheckInOverrideSchema = z.object({
  checkInRecordId: z.uuid(),
  status: z.enum(["checked_in", "no_show"]),
  notes: z.string().trim().min(2).max(500),
});

export const getMyBoardingPassesSchema = z
  .object({
    bookingId: z.uuid().optional(),
  })
  .optional();
