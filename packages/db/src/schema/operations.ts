import type {
  AvailabilityBlockType,
  CouponDiscountType,
  CouponScope,
  CouponStatus,
  CurrencyCode,
  NegotiationOfferParty,
  NegotiationStatus,
  PlatformSupplierRole,
  SeatInventoryStatus,
  SupplierRole,
  TripProgramStatus,
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
import { trips } from "./trips";

export const tripPrograms = pgTable(
  "trip_programs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    tripId: uuid("trip_id")
      .references(() => trips.id, { onDelete: "cascade" })
      .notNull(),
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    descriptionAr: text("description_ar").default("").notNull(),
    descriptionEn: text("description_en").default("").notNull(),
    dayNumber: integer("day_number").default(1).notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    locationNameAr: text("location_name_ar"),
    locationNameEn: text("location_name_en"),
    priceMinor: integer("price_minor").default(0).notNull(),
    currencyCode: text("currency_code").$type<CurrencyCode>().default("EGP").notNull(),
    isIncludedInBase: boolean("is_included_in_base").default(true).notNull(),
    capacity: integer("capacity"),
    bookedCount: integer("booked_count").default(0).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    attachmentUrls: jsonb("attachment_urls").$type<string[]>().default([]).notNull(),
    status: text("status").$type<TripProgramStatus>().default("active").notNull(),
    createdByAccountId: uuid("created_by_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("trip_programs_tenant_idx").on(table.tenantId),
    index("trip_programs_trip_idx").on(table.tripId),
    index("trip_programs_created_by_idx").on(table.createdByAccountId),
  ],
);

export const supplierAvailabilityBlocks = pgTable(
  "supplier_availability_blocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    supplierAccountId: uuid("supplier_account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    supplierRole: text("supplier_role").$type<SupplierRole>().notNull(),
    tenantId: uuid("tenant_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    blockType: text("block_type").$type<AvailabilityBlockType>().default("unavailable").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    tripId: uuid("trip_id").references(() => trips.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("supplier_availability_supplier_idx").on(table.supplierAccountId),
    index("supplier_availability_tenant_idx").on(table.tenantId),
    index("supplier_availability_trip_idx").on(table.tripId),
    index("supplier_availability_window_idx").on(table.startsAt, table.endsAt),
  ],
);

export const supplierNegotiations = pgTable(
  "supplier_negotiations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    tripId: uuid("trip_id")
      .references(() => trips.id, { onDelete: "cascade" })
      .notNull(),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id, {
      onDelete: "set null",
    }),
    supplierAccountId: uuid("supplier_account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    supplierRole: text("supplier_role").$type<PlatformSupplierRole>().notNull(),
    status: text("status").$type<NegotiationStatus>().default("pending_supplier").notNull(),
    initialOfferMinor: integer("initial_offer_minor").notNull(),
    currentOfferMinor: integer("current_offer_minor").notNull(),
    agreedPriceMinor: integer("agreed_price_minor"),
    currencyCode: text("currency_code").$type<CurrencyCode>().default("EGP").notNull(),
    lastOfferedBy: text("last_offered_by")
      .$type<NegotiationOfferParty>()
      .default("organization")
      .notNull(),
    roundsCount: integer("rounds_count").default(1).notNull(),
    notes: text("notes"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    createdByAccountId: uuid("created_by_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("supplier_negotiations_tenant_idx").on(table.tenantId),
    index("supplier_negotiations_trip_idx").on(table.tripId),
    index("supplier_negotiations_vehicle_idx").on(table.vehicleId),
    index("supplier_negotiations_supplier_idx").on(table.supplierAccountId),
    index("supplier_negotiations_created_by_idx").on(table.createdByAccountId),
    index("supplier_negotiations_status_idx").on(table.status),
  ],
);

export const tripSeatInventory = pgTable(
  "trip_seat_inventory",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    tripId: uuid("trip_id")
      .references(() => trips.id, { onDelete: "cascade" })
      .notNull(),
    vehicleId: uuid("vehicle_id")
      .references(() => vehicles.id, { onDelete: "cascade" })
      .notNull(),
    seatLabel: text("seat_label").notNull(),
    rowIndex: integer("row_index").default(0).notNull(),
    colIndex: integer("col_index").default(0).notNull(),
    isAccessible: boolean("is_accessible").default(false).notNull(),
    isPriority: boolean("is_priority").default(false).notNull(),
    status: text("status").$type<SeatInventoryStatus>().default("available").notNull(),
    heldByAccountId: uuid("held_by_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    holdExpiresAt: timestamp("hold_expires_at", { withTimezone: true }),
    bookingId: uuid("booking_id"),
    passengerName: text("passenger_name"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("trip_seat_inventory_tenant_idx").on(table.tenantId),
    index("trip_seat_inventory_trip_idx").on(table.tripId),
    index("trip_seat_inventory_vehicle_idx").on(table.vehicleId),
    index("trip_seat_inventory_held_by_idx").on(table.heldByAccountId),
    index("trip_seat_inventory_booking_idx").on(table.bookingId),
    uniqueIndex("trip_seat_inventory_trip_vehicle_seat_uidx").on(
      table.tripId,
      table.vehicleId,
      table.seatLabel,
    ),
  ],
);

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scope: text("scope").$type<CouponScope>().default("organization").notNull(),
    tenantId: uuid("tenant_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    ownerAccountId: uuid("owner_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    code: text("code").notNull(),
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    discountType: text("discount_type").$type<CouponDiscountType>().notNull(),
    discountValue: integer("discount_value").notNull(),
    maxDiscountMinor: integer("max_discount_minor"),
    minOrderMinor: integer("min_order_minor").default(0).notNull(),
    currencyCode: text("currency_code").$type<CurrencyCode>().default("EGP").notNull(),
    maxRedemptions: integer("max_redemptions"),
    redemptionsCount: integer("redemptions_count").default(0).notNull(),
    tripId: uuid("trip_id").references(() => trips.id, {
      onDelete: "set null",
    }),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    status: text("status").$type<CouponStatus>().default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("coupons_tenant_idx").on(table.tenantId),
    index("coupons_owner_idx").on(table.ownerAccountId),
    index("coupons_trip_idx").on(table.tripId),
    uniqueIndex("coupons_code_uidx").on(table.code),
    index("coupons_status_idx").on(table.status),
  ],
);
