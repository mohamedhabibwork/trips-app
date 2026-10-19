import type {
  CurrencyCode,
  SeatLayoutConfig,
  SupportedLocale,
  TripPublishMode,
  TripRoutePoint,
  TripSeatAssignmentMode,
  TripStaffSource,
  TripState,
  TripWizardStepCompletion,
} from "@trips-app/domain";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { accounts, organizations } from "./auth";
import { vehicles } from "./fleet";

export const DEFAULT_TRIP_WIZARD_STEPS: TripWizardStepCompletion = {
  basics: false,
  schedule: false,
  vehicles: false,
  staffing: false,
  programs: false,
  seating: false,
  pricing: false,
  publish: false,
};

export const trips = pgTable(
  "trips",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    descriptionAr: text("description_ar").default("").notNull(),
    descriptionEn: text("description_en").default("").notNull(),
    categoryLookupCode: text("category_lookup_code").notNull(),
    language: text("language").$type<SupportedLocale>().default("ar").notNull(),
    coverImageUrl: text("cover_image_url"),
    galleryImageUrls: jsonb("gallery_image_urls").$type<string[]>().default([]).notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    timezone: text("timezone").default("Africa/Cairo").notNull(),
    origin: jsonb("origin").$type<TripRoutePoint | null>(),
    destinations: jsonb("destinations").$type<TripRoutePoint[]>().default([]).notNull(),
    seatAssignmentMode: text("seat_assignment_mode")
      .$type<TripSeatAssignmentMode>()
      .default("organization_assigned")
      .notNull(),
    seatPriorityWindowHours: integer("seat_priority_window_hours").default(0).notNull(),
    basePriceMinor: integer("base_price_minor").default(0).notNull(),
    currencyCode: text("currency_code").$type<CurrencyCode>().default("EGP").notNull(),
    totalCapacity: integer("total_capacity").default(0).notNull(),
    confirmedSeatsCount: integer("confirmed_seats_count").default(0).notNull(),
    heldSeatsCount: integer("held_seats_count").default(0).notNull(),
    childTrackingEnabled: boolean("child_tracking_enabled").default(false).notNull(),
    state: text("state").$type<TripState>().default("draft").notNull(),
    publishMode: text("publish_mode").$type<TripPublishMode>().default("draft").notNull(),
    targetedAudienceIds: jsonb("targeted_audience_ids").$type<string[]>().default([]).notNull(),
    vipEarlyAccessUntil: timestamp("vip_early_access_until", { withTimezone: true }),
    wizardSteps: jsonb("wizard_steps")
      .$type<TripWizardStepCompletion>()
      .default(DEFAULT_TRIP_WIZARD_STEPS)
      .notNull(),
    hasStaffingGap: boolean("has_staffing_gap").default(true).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
    cancelledByAccountId: uuid("cancelled_by_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    createdByAccountId: uuid("created_by_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("trips_tenant_idx").on(table.tenantId),
    index("trips_state_idx").on(table.state),
    index("trips_starts_at_idx").on(table.startsAt),
    index("trips_cancelled_by_idx").on(table.cancelledByAccountId),
    index("trips_created_by_idx").on(table.createdByAccountId),
  ],
);

export const tripVehicles = pgTable(
  "trip_vehicles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    tripId: uuid("trip_id")
      .references(() => trips.id, { onDelete: "cascade" })
      .notNull(),
    vehicleId: uuid("vehicle_id")
      .references(() => vehicles.id, { onDelete: "restrict" })
      .notNull(),
    seatCountSnapshot: integer("seat_count_snapshot").notNull(),
    seatLayoutSnapshot: jsonb("seat_layout_snapshot").$type<SeatLayoutConfig>().notNull(),
    driverSource: text("driver_source").$type<TripStaffSource>().default("unassigned").notNull(),
    driverAccountId: uuid("driver_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    moderatorSource: text("moderator_source")
      .$type<TripStaffSource>()
      .default("unassigned")
      .notNull(),
    moderatorAccountId: uuid("moderator_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    photographerSource: text("photographer_source")
      .$type<TripStaffSource>()
      .default("unassigned")
      .notNull(),
    photographerAccountId: uuid("photographer_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("trip_vehicles_tenant_idx").on(table.tenantId),
    index("trip_vehicles_trip_idx").on(table.tripId),
    index("trip_vehicles_vehicle_idx").on(table.vehicleId),
    index("trip_vehicles_driver_idx").on(table.driverAccountId),
    index("trip_vehicles_moderator_idx").on(table.moderatorAccountId),
    index("trip_vehicles_photographer_idx").on(table.photographerAccountId),
    uniqueIndex("trip_vehicles_trip_vehicle_uidx").on(table.tripId, table.vehicleId),
  ],
);
