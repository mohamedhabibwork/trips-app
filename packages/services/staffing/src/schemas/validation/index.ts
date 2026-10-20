// Zod schemas that validate input at the boundary.
import {
  insertModeratorAssignmentsSchema,
  insertTripVehiclesSchema,
  selectModeratorAssignmentsSchema,
  selectTripVehiclesSchema,
  updateModeratorAssignmentsSchema,
  updateTripVehiclesSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

import { TRIP_STAFF_SOURCES } from "../../model";

export const tripVehicleSelectSchema = selectTripVehiclesSchema;
export const tripVehicleInsertSchema = insertTripVehiclesSchema;
export const tripVehicleUpdateSchema = updateTripVehiclesSchema;

export const moderatorAssignmentSelectSchema = selectModeratorAssignmentsSchema;
export const moderatorAssignmentInsertSchema = insertModeratorAssignmentsSchema;
export const moderatorAssignmentUpdateSchema = updateModeratorAssignmentsSchema;

export const listTripStaffingInputSchema = z.object({
  tripId: z.uuid(),
});

export const assignVehicleStaffInputSchema = updateTripVehiclesSchema
  .pick({
    tripId: true,
    vehicleId: true,
    driverSource: true,
    driverAccountId: true,
    moderatorSource: true,
    moderatorAccountId: true,
    photographerSource: true,
    photographerAccountId: true,
  })
  .extend({
    tripId: z.uuid(),
    vehicleId: z.uuid(),
    driverSource: z.enum(TRIP_STAFF_SOURCES),
    driverAccountId: z.uuid().nullable().optional(),
    moderatorSource: z.enum(TRIP_STAFF_SOURCES),
    moderatorAccountId: z.uuid().nullable().optional(),
    photographerSource: z.enum(TRIP_STAFF_SOURCES).optional(),
    photographerAccountId: z.uuid().nullable().optional(),
  });

export const issueModeratorStaffCodeInputSchema = insertModeratorAssignmentsSchema
  .pick({
    tripId: true,
    vehicleId: true,
  })
  .extend({
    moderatorAccountId: z.uuid(),
    validFrom: z.iso.datetime().optional(),
    validUntil: z.iso.datetime().optional(),
  });

export const revokeModeratorAssignmentInputSchema = z.object({
  assignmentId: z.uuid(),
});
