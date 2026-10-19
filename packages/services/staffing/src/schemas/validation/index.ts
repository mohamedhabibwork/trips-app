// Zod schemas that validate input at the boundary.
import { z } from "zod/v4";

import { TRIP_STAFF_SOURCES } from "../../model";

export const listTripStaffingInputSchema = z.object({
  tripId: z.uuid(),
});

export const assignVehicleStaffInputSchema = z.object({
  tripId: z.uuid(),
  vehicleId: z.uuid(),
  driverSource: z.enum(TRIP_STAFF_SOURCES),
  driverAccountId: z.uuid().nullable().optional(),
  moderatorSource: z.enum(TRIP_STAFF_SOURCES),
  moderatorAccountId: z.uuid().nullable().optional(),
  photographerSource: z.enum(TRIP_STAFF_SOURCES).optional(),
  photographerAccountId: z.uuid().nullable().optional(),
});

export const issueModeratorStaffCodeInputSchema = z.object({
  tripId: z.uuid(),
  vehicleId: z.uuid(),
  moderatorAccountId: z.uuid(),
  validFrom: z.iso.datetime().optional(),
  validUntil: z.iso.datetime().optional(),
});

export const revokeModeratorAssignmentInputSchema = z.object({
  assignmentId: z.uuid(),
});
