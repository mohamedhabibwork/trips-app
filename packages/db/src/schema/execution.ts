import type {
  CheckInMethod,
  CheckInStatus,
  DriverLabTestKind,
  DriverLabTestStatus,
  NotificationCategory,
  NotificationDeliveryChannel,
  ParentChildLinkStatus,
  TrackingAlertSeverity,
  TrackingCoordinates,
  TrackingEventType,
  TripPhotoAlbumStatus,
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
import { bookings } from "./commerce";
import { vehicles } from "./fleet";
import { trips } from "./trips";

export const checkInRecords = pgTable(
  "check_in_records",
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
    bookingId: uuid("booking_id")
      .references(() => bookings.id, { onDelete: "cascade" })
      .notNull(),
    passengerId: text("passenger_id").notNull(),
    passengerName: text("passenger_name").notNull(),
    seatLabel: text("seat_label"),
    qrCodeToken: text("qr_code_token").notNull(),
    status: text("status").$type<CheckInStatus>().default("pending").notNull(),
    checkedInByAccountId: uuid("checked_in_by_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    method: text("method").$type<CheckInMethod | null>(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("check_in_records_qr_token_uidx").on(table.qrCodeToken),
    index("check_in_records_tenant_idx").on(table.tenantId),
    index("check_in_records_trip_idx").on(table.tripId),
    index("check_in_records_vehicle_idx").on(table.vehicleId),
    index("check_in_records_booking_idx").on(table.bookingId),
    index("check_in_records_checked_in_by_idx").on(table.checkedInByAccountId),
  ],
);

export const tripTrackingEvents = pgTable(
  "trip_tracking_events",
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
    recordedByAccountId: uuid("recorded_by_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    eventType: text("event_type").$type<TrackingEventType>().notNull(),
    coordinates: jsonb("coordinates").$type<TrackingCoordinates | null>(),
    severity: text("severity").$type<TrackingAlertSeverity>().default("info").notNull(),
    childPassengerId: text("child_passenger_id"),
    messageAr: text("message_ar"),
    messageEn: text("message_en"),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("trip_tracking_events_tenant_idx").on(table.tenantId),
    index("trip_tracking_events_trip_idx").on(table.tripId),
    index("trip_tracking_events_vehicle_idx").on(table.vehicleId),
    index("trip_tracking_events_recorded_by_idx").on(table.recordedByAccountId),
    index("trip_tracking_events_occurred_at_idx").on(table.occurredAt),
  ],
);

export const parentChildLinks = pgTable(
  "parent_child_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    parentAccountId: uuid("parent_account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    tenantId: uuid("tenant_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    tripId: uuid("trip_id")
      .references(() => trips.id, { onDelete: "cascade" })
      .notNull(),
    bookingId: uuid("booking_id")
      .references(() => bookings.id, { onDelete: "cascade" })
      .notNull(),
    childPassengerId: text("child_passenger_id").notNull(),
    childFullName: text("child_full_name").notNull(),
    relationship: text("relationship").default("guardian").notNull(),
    consentSigned: boolean("consent_signed").default(true).notNull(),
    status: text("status").$type<ParentChildLinkStatus>().default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("parent_child_links_parent_idx").on(table.parentAccountId),
    index("parent_child_links_tenant_idx").on(table.tenantId),
    index("parent_child_links_trip_idx").on(table.tripId),
    index("parent_child_links_booking_idx").on(table.bookingId),
  ],
);

export const tripPhotoAlbums = pgTable(
  "trip_photo_albums",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    tripId: uuid("trip_id")
      .references(() => trips.id, { onDelete: "cascade" })
      .notNull(),
    photographerAccountId: uuid("photographer_account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    coverPhotoUrl: text("cover_photo_url"),
    photoUrls: jsonb("photo_urls").$type<string[]>().default([]).notNull(),
    photoCount: integer("photo_count").default(0).notNull(),
    watermarked: boolean("watermarked").default(false).notNull(),
    audience: text("audience").$type<TripPhotoAlbumAudience>().default("public").notNull(),
    audienceAccountIds: jsonb("audience_account_ids").$type<string[]>().default([]).notNull(),
    status: text("status").$type<TripPhotoAlbumStatus>().default("draft").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("trip_photo_albums_tenant_idx").on(table.tenantId),
    index("trip_photo_albums_trip_idx").on(table.tripId),
    index("trip_photo_albums_photographer_idx").on(table.photographerAccountId),
  ],
);

/** Who may open a published album (SCR-TRV-17 privacy rules). */
export type TripPhotoAlbumAudience = "public" | "selected_travelers";

/** Lifecycle of a traveler-facing shared album link (32-char token). */
export type AlbumSharedLinkStatus = "active" | "revoked";

export const albumSharedLinks = pgTable(
  "album_shared_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    albumId: uuid("album_id")
      .references(() => tripPhotoAlbums.id, { onDelete: "cascade" })
      .notNull(),
    token: text("token").notNull(),
    createdByAccountId: uuid("created_by_account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    status: text("status").$type<AlbumSharedLinkStatus>().default("active").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("album_shared_links_token_uidx").on(table.token),
    index("album_shared_links_album_idx").on(table.albumId),
    index("album_shared_links_tenant_idx").on(table.tenantId),
    index("album_shared_links_status_idx").on(table.status),
  ],
);

export const driverLabTests = pgTable(
  "driver_lab_tests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    driverAccountId: uuid("driver_account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    requestedByAdminAccountId: uuid("requested_by_admin_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    status: text("status").$type<DriverLabTestStatus>().default("requested").notNull(),
    testType: text("test_type").$type<DriverLabTestKind>().default("both").notNull(),
    labCenterName: text("lab_center_name"),
    appointmentAt: timestamp("appointment_at", { withTimezone: true }),
    deadlineAt: timestamp("deadline_at", { withTimezone: true }).notNull(),
    resultDocumentUrl: text("result_document_url"),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }),
    reviewedByAdminAccountId: uuid("reviewed_by_admin_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewNotes: text("review_notes"),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("driver_lab_tests_driver_idx").on(table.driverAccountId),
    index("driver_lab_tests_requested_by_idx").on(table.requestedByAdminAccountId),
    index("driver_lab_tests_reviewed_by_idx").on(table.reviewedByAdminAccountId),
    index("driver_lab_tests_status_idx").on(table.status),
  ],
);

export const notificationMessages = pgTable(
  "notification_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recipientAccountId: uuid("recipient_account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    tenantId: uuid("tenant_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    category: text("category").$type<NotificationCategory>().default("operations").notNull(),
    channel: text("channel").$type<NotificationDeliveryChannel>().default("in_app").notNull(),
    titleAr: text("title_ar").notNull(),
    titleEn: text("title_en").notNull(),
    bodyAr: text("body_ar").notNull(),
    bodyEn: text("body_en").notNull(),
    actionUrl: text("action_url"),
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notification_messages_recipient_idx").on(table.recipientAccountId),
    index("notification_messages_tenant_idx").on(table.tenantId),
    index("notification_messages_read_idx").on(table.recipientAccountId, table.isRead),
  ],
);
