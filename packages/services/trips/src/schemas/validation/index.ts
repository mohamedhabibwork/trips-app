// Zod schemas that validate input at the boundary.
// Derived from @trips-app/db/zod table definitions (see .claude/rules/drizzle-zod-schemas.md).
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  schema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

import {
  SUPPORTED_CURRENCIES,
  SUPPORTED_LOCALES,
  TRIP_PUBLISH_MODES,
  TRIP_SEAT_ASSIGNMENT_MODES,
  TRIP_STAFF_SOURCES,
  TRIP_STATES,
} from "../../model";

export const tripRoutePointSchema = z.object({
  nameAr: z.string().trim().min(1).max(160),
  nameEn: z.string().trim().min(1).max(160),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  regionLookupCode: z.string().trim().min(1).max(120).nullable().optional(),
});

export const moneyInputSchema = z.object({
  amountMinor: z.number().int().min(0).max(100_000_000),
  currency: z.enum(SUPPORTED_CURRENCIES),
});

export const tripSelectSchema = createSelectSchema(schema.trips);

export const tripInsertBaseSchema = createInsertSchema(schema.trips, {
  titleAr: (column) => column.trim().min(1).max(200),
  titleEn: (column) => column.trim().min(1).max(200),
  descriptionAr: (column) => column.trim().max(4000),
  descriptionEn: (column) => column.trim().max(4000),
  categoryLookupCode: (column) => column.trim().min(1).max(120),
  language: () => z.enum(SUPPORTED_LOCALES),
  coverImageUrl: (column) => column.trim().max(2048),
  galleryImageUrls: () => z.array(z.string().trim().min(1).max(2048)).max(20),
  timezone: (column) => column.trim().min(1).max(80),
  origin: () => tripRoutePointSchema,
  destinations: () => z.array(tripRoutePointSchema).min(1).max(20),
  seatAssignmentMode: () => z.enum(TRIP_SEAT_ASSIGNMENT_MODES),
  seatPriorityWindowHours: (column) => column.int().min(0).max(720),
  basePriceMinor: (column) => column.int().min(0).max(100_000_000),
  currencyCode: () => z.enum(SUPPORTED_CURRENCIES),
  publishMode: () => z.enum(TRIP_PUBLISH_MODES),
  targetedAudienceIds: () => z.array(z.uuid()).max(500),
  state: () => z.enum(TRIP_STATES),
});

export const tripUpdateBaseSchema = createUpdateSchema(schema.trips, {
  titleAr: (column) => column.trim().min(1).max(200),
  titleEn: (column) => column.trim().min(1).max(200),
  descriptionAr: (column) => column.trim().max(4000),
  descriptionEn: (column) => column.trim().max(4000),
  categoryLookupCode: (column) => column.trim().min(1).max(120),
  language: () => z.enum(SUPPORTED_LOCALES),
  coverImageUrl: (column) => column.trim().max(2048),
  galleryImageUrls: () => z.array(z.string().trim().min(1).max(2048)).max(20),
  timezone: (column) => column.trim().min(1).max(80),
  origin: () => tripRoutePointSchema,
  destinations: () => z.array(tripRoutePointSchema).min(1).max(20),
  seatAssignmentMode: () => z.enum(TRIP_SEAT_ASSIGNMENT_MODES),
  seatPriorityWindowHours: (column) => column.int().min(0).max(720),
  basePriceMinor: (column) => column.int().min(0).max(100_000_000),
  currencyCode: () => z.enum(SUPPORTED_CURRENCIES),
  publishMode: () => z.enum(TRIP_PUBLISH_MODES),
  targetedAudienceIds: () => z.array(z.uuid()).max(500),
  state: () => z.enum(TRIP_STATES),
});

export const createDraftTripInputSchema = tripInsertBaseSchema
  .pick({
    titleAr: true,
    titleEn: true,
    categoryLookupCode: true,
  })
  .extend({
    descriptionAr: z.string().trim().max(4000).optional(),
    descriptionEn: z.string().trim().max(4000).optional(),
    language: z.enum(SUPPORTED_LOCALES).optional(),
    coverImageUrl: z.string().trim().max(2048).nullable().optional(),
    galleryImageUrls: z.array(z.string().trim().min(1).max(2048)).max(20).optional(),
    fileIds: z.array(z.uuid()).max(25).optional(),
  });

export const wizardStepBasicsSchema = z.object({
  tripId: z.uuid(),
  step: z.literal("basics"),
  titleAr: z.string().trim().min(1).max(200),
  titleEn: z.string().trim().min(1).max(200),
  descriptionAr: z.string().trim().max(4000).optional(),
  descriptionEn: z.string().trim().max(4000).optional(),
  categoryLookupCode: z.string().trim().min(1).max(120),
  language: z.enum(SUPPORTED_LOCALES).optional(),
  coverImageUrl: z.string().trim().max(2048).nullable().optional(),
  galleryImageUrls: z.array(z.string().trim().min(1).max(2048)).max(20).optional(),
  fileIds: z.array(z.uuid()).max(25).optional(),
});

export const wizardStepScheduleSchema = z.object({
  tripId: z.uuid(),
  step: z.literal("schedule"),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  timezone: z.string().trim().min(1).max(80).optional(),
  origin: tripRoutePointSchema,
  destinations: z.array(tripRoutePointSchema).min(1).max(20),
});

export const wizardStepVehiclesSchema = z.object({
  tripId: z.uuid(),
  step: z.literal("vehicles"),
  vehicleIds: z.array(z.uuid()).min(1).max(50),
});

export const tripVehicleStaffAssignmentSchema = z.object({
  vehicleId: z.uuid(),
  driverSource: z.enum(TRIP_STAFF_SOURCES),
  driverAccountId: z.uuid().nullable().optional(),
  moderatorSource: z.enum(TRIP_STAFF_SOURCES),
  moderatorAccountId: z.uuid().nullable().optional(),
  photographerSource: z.enum(TRIP_STAFF_SOURCES).optional(),
  photographerAccountId: z.uuid().nullable().optional(),
});

export const wizardStepStaffingSchema = z.object({
  tripId: z.uuid(),
  step: z.literal("staffing"),
  assignments: z.array(tripVehicleStaffAssignmentSchema).min(1).max(50),
});

export const wizardStepProgramsSchema = z.object({
  tripId: z.uuid(),
  step: z.literal("programs"),
  notes: z.string().trim().max(2000).optional(),
});

export const wizardStepSeatingSchema = z.object({
  tripId: z.uuid(),
  step: z.literal("seating"),
  seatAssignmentMode: z.enum(TRIP_SEAT_ASSIGNMENT_MODES),
  seatPriorityWindowHours: z.number().int().min(0).max(720).optional(),
});

export const wizardStepPricingSchema = z.object({
  tripId: z.uuid(),
  step: z.literal("pricing"),
  basePrice: moneyInputSchema,
  childTrackingEnabled: z.boolean().optional(),
});

export const wizardStepPublishVisibilitySchema = z.object({
  tripId: z.uuid(),
  step: z.literal("publish"),
  publishMode: z.enum(TRIP_PUBLISH_MODES),
  targetedAudienceIds: z.array(z.uuid()).max(500).optional(),
  vipEarlyAccessUntil: z.iso.datetime().nullable().optional(),
});

export const saveWizardStepInputSchema = z.discriminatedUnion("step", [
  wizardStepBasicsSchema,
  wizardStepScheduleSchema,
  wizardStepVehiclesSchema,
  wizardStepStaffingSchema,
  wizardStepProgramsSchema,
  wizardStepSeatingSchema,
  wizardStepPricingSchema,
  wizardStepPublishVisibilitySchema,
]);

export const publishTripInputSchema = z.object({
  tripId: z.uuid(),
  publishMode: z.enum(["public", "targeted"]).optional(),
  targetedAudienceIds: z.array(z.uuid()).max(500).optional(),
  vipEarlyAccessUntil: z.iso.datetime().nullable().optional(),
});

export const transitionTripStateInputSchema = z.object({
  tripId: z.uuid(),
  targetState: z.enum(["scheduled", "Selection", "in_progress", "completed"]),
  reason: z.string().trim().max(500).optional(),
});

export const cancelTripInputSchema = z.object({
  tripId: z.uuid(),
  reason: z.string().trim().min(3).max(500),
});

export const listOrganizationTripsInputSchema = z
  .object({
    state: z.enum(TRIP_STATES).optional(),
    search: z.string().trim().max(160).optional(),
    hasStaffingGap: z.boolean().optional(),
  })
  .optional();

export const getOrganizationTripInputSchema = z.object({
  tripId: z.uuid(),
});

export const browsePublicTripsInputSchema = z
  .object({
    search: z.string().trim().max(160).optional(),
    categoryLookupCode: z.string().trim().max(120).optional(),
    regionLookupCode: z.string().trim().max(120).optional(),
    maxPriceMinor: z.number().int().min(0).optional(),
  })
  .optional();

export const getPublicTripDetailInputSchema = z
  .object({
    tripId: z.uuid().optional(),
  })
  .optional();
