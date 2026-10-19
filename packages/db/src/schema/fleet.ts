import type {
  SeatLayoutConfig,
  VehicleRegistrationStatus,
  VehicleStatus,
  VehicleTypeScope,
  VehicleTypeStatus,
} from "@trips-app/domain";
import {
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

export const vehicleTypes = pgTable(
  "vehicle_types",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    scope: text("scope").$type<VehicleTypeScope>().default("organization").notNull(),
    categoryLookupCode: text("category_lookup_code").notNull(),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en").notNull(),
    descriptionAr: text("description_ar"),
    descriptionEn: text("description_en"),
    seatCount: integer("seat_count").notNull(),
    seatLayout: jsonb("seat_layout").$type<SeatLayoutConfig>().notNull(),
    status: text("status").$type<VehicleTypeStatus>().default("active").notNull(),
    createdByAccountId: uuid("created_by_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("vehicle_types_tenant_idx").on(table.tenantId),
    index("vehicle_types_created_by_idx").on(table.createdByAccountId),
    index("vehicle_types_scope_status_idx").on(table.scope, table.status),
  ],
);

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    vehicleTypeId: uuid("vehicle_type_id")
      .references(() => vehicleTypes.id, { onDelete: "restrict" })
      .notNull(),
    plateNumber: text("plate_number").notNull(),
    plateNumberNormalized: text("plate_number_normalized").notNull(),
    model: text("model").notNull(),
    manufacturingYear: integer("manufacturing_year").notNull(),
    seatCount: integer("seat_count").notNull(),
    registrationStatus: text("registration_status")
      .$type<VehicleRegistrationStatus>()
      .default("valid")
      .notNull(),
    registrationExpiry: timestamp("registration_expiry", { withTimezone: true }),
    registrationDocumentUrl: text("registration_document_url"),
    photoUrls: jsonb("photo_urls").$type<string[]>().default([]).notNull(),
    amenityCodes: jsonb("amenity_codes").$type<string[]>().default([]).notNull(),
    status: text("status").$type<VehicleStatus>().default("active").notNull(),
    notes: text("notes"),
    createdByAccountId: uuid("created_by_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("vehicles_tenant_idx").on(table.tenantId),
    index("vehicles_vehicle_type_idx").on(table.vehicleTypeId),
    index("vehicles_created_by_idx").on(table.createdByAccountId),
    uniqueIndex("vehicles_tenant_plate_uidx").on(table.tenantId, table.plateNumberNormalized),
    index("vehicles_status_idx").on(table.status),
  ],
);
