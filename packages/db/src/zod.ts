// Table-derived Zod schemas. One factory for the package, so every schema binds to the same zod instance.
// Coercion stays off: boundary input is validated exactly as it arrives.
import { createSchemaFactory } from "drizzle-orm/zod";
import { z } from "zod/v4";

import * as schema from "./schema";

// Backend schemas import from "@trips-app/db/zod" only. That subpath exposes the factory and the table
// definitions for derivation, and nothing that opens a database connection.
export { schema };

export const { createSelectSchema, createInsertSchema, createUpdateSchema } = createSchemaFactory({
  zodInstance: z,
  coerce: undefined,
});

export const seatLayoutCellSchema = z.object({
  row: z.number().int().min(0).max(50),
  col: z.number().int().min(0).max(20),
  type: z.enum(["seat", "aisle", "driver", "moderator", "door", "empty"]),
  seatLabel: z.string().trim().min(1).max(16).nullable().optional(),
  isAccessible: z.boolean().optional(),
  isPriority: z.boolean().optional(),
});

export const seatLayoutConfigSchema = z.object({
  rows: z.number().int().min(1).max(50),
  cols: z.number().int().min(1).max(20),
  cells: z.array(seatLayoutCellSchema).min(1).max(1000),
});

export const tripRoutePointSchema = z.object({
  nameAr: z.string().trim().min(1).max(200),
  nameEn: z.string().trim().min(1).max(200),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  regionLookupCode: z.string().trim().min(1).max(80).nullable().optional(),
});

export const tripWizardStepsSchema = z.object({
  basics: z.boolean(),
  schedule: z.boolean(),
  vehicles: z.boolean(),
  staffing: z.boolean(),
  programs: z.boolean(),
  seating: z.boolean(),
  pricing: z.boolean(),
  publish: z.boolean(),
});

// Privacy Requests
export const selectPrivacyRequestsSchema = createSelectSchema(schema.privacyRequests);
export const insertPrivacyRequestsSchema = createInsertSchema(schema.privacyRequests, {
  requestType: () => z.enum(["data_export", "account_deletion"]),
  status: () => z.enum(["pending", "processing", "completed", "cancelled"]),
});
export const updatePrivacyRequestsSchema = createUpdateSchema(schema.privacyRequests, {
  requestType: () => z.enum(["data_export", "account_deletion"]),
  status: () => z.enum(["pending", "processing", "completed", "cancelled"]),
});
export const selectPrivacyRequestSchema = selectPrivacyRequestsSchema;
export const insertPrivacyRequestSchema = insertPrivacyRequestsSchema;
export const updatePrivacyRequestSchema = updatePrivacyRequestsSchema;

// Vehicle Types
export const selectVehicleTypesSchema = createSelectSchema(schema.vehicleTypes);
export const insertVehicleTypesSchema = createInsertSchema(schema.vehicleTypes, {
  scope: () => z.enum(["platform", "organization"]),
  status: () => z.enum(["active", "archived"]),
  seatLayout: () => seatLayoutConfigSchema,
});
export const updateVehicleTypesSchema = createUpdateSchema(schema.vehicleTypes, {
  scope: () => z.enum(["platform", "organization"]),
  status: () => z.enum(["active", "archived"]),
  seatLayout: () => seatLayoutConfigSchema,
});
export const selectVehicleTypeSchema = selectVehicleTypesSchema;
export const insertVehicleTypeSchema = insertVehicleTypesSchema;
export const updateVehicleTypeSchema = updateVehicleTypesSchema;

// Vehicles
export const selectVehiclesSchema = createSelectSchema(schema.vehicles);
export const insertVehiclesSchema = createInsertSchema(schema.vehicles, {
  registrationStatus: () => z.enum(["valid", "pending_renewal", "expired"]),
  status: () => z.enum(["active", "maintenance", "retired"]),
  photoUrls: () => z.array(z.string().trim().min(1)),
  amenityCodes: () => z.array(z.string().trim().min(1)),
});
export const updateVehiclesSchema = createUpdateSchema(schema.vehicles, {
  registrationStatus: () => z.enum(["valid", "pending_renewal", "expired"]),
  status: () => z.enum(["active", "maintenance", "retired"]),
  photoUrls: () => z.array(z.string().trim().min(1)),
  amenityCodes: () => z.array(z.string().trim().min(1)),
});
export const selectVehicleSchema = selectVehiclesSchema;
export const insertVehicleSchema = insertVehiclesSchema;
export const updateVehicleSchema = updateVehiclesSchema;

// Trips
export const selectTripsSchema = createSelectSchema(schema.trips);
export const insertTripsSchema = createInsertSchema(schema.trips, {
  language: () => z.enum(["ar", "en"]),
  currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
  seatAssignmentMode: () => z.enum(["organization_assigned", "traveler_choice"]),
  state: () =>
    z.enum([
      "draft",
      "published",
      "scheduled",
      "Selection",
      "in_progress",
      "completed",
      "cancelled",
    ]),
  publishMode: () => z.enum(["draft", "public", "targeted"]),
  galleryImageUrls: () => z.array(z.string().trim().min(1)),
  origin: () => tripRoutePointSchema,
  destinations: () => z.array(tripRoutePointSchema),
  targetedAudienceIds: () => z.array(z.string().trim().min(1)),
  wizardSteps: () => tripWizardStepsSchema,
});
export const updateTripsSchema = createUpdateSchema(schema.trips, {
  language: () => z.enum(["ar", "en"]),
  currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
  seatAssignmentMode: () => z.enum(["organization_assigned", "traveler_choice"]),
  state: () =>
    z.enum([
      "draft",
      "published",
      "scheduled",
      "Selection",
      "in_progress",
      "completed",
      "cancelled",
    ]),
  publishMode: () => z.enum(["draft", "public", "targeted"]),
  galleryImageUrls: () => z.array(z.string().trim().min(1)),
  origin: () => tripRoutePointSchema,
  destinations: () => z.array(tripRoutePointSchema),
  targetedAudienceIds: () => z.array(z.string().trim().min(1)),
  wizardSteps: () => tripWizardStepsSchema,
});
export const selectTripSchema = selectTripsSchema;
export const insertTripSchema = insertTripsSchema;
export const updateTripSchema = updateTripsSchema;

// Trip Vehicles
export const selectTripVehiclesSchema = createSelectSchema(schema.tripVehicles);
export const insertTripVehiclesSchema = createInsertSchema(schema.tripVehicles, {
  seatLayoutSnapshot: () => seatLayoutConfigSchema,
  driverSource: () => z.enum(["org_staff", "platform_supplier", "unassigned"]),
  moderatorSource: () => z.enum(["org_staff", "platform_supplier", "unassigned"]),
  photographerSource: () => z.enum(["org_staff", "platform_supplier", "unassigned"]),
});
export const updateTripVehiclesSchema = createUpdateSchema(schema.tripVehicles, {
  seatLayoutSnapshot: () => seatLayoutConfigSchema,
  driverSource: () => z.enum(["org_staff", "platform_supplier", "unassigned"]),
  moderatorSource: () => z.enum(["org_staff", "platform_supplier", "unassigned"]),
  photographerSource: () => z.enum(["org_staff", "platform_supplier", "unassigned"]),
});
export const selectTripVehicleSchema = selectTripVehiclesSchema;
export const insertTripVehicleSchema = insertTripVehiclesSchema;
export const updateTripVehicleSchema = updateTripVehiclesSchema;

// Trip Programs
export const selectTripProgramsSchema = createSelectSchema(schema.tripPrograms);
export const insertTripProgramsSchema = createInsertSchema(schema.tripPrograms, {
  currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
  status: () => z.enum(["active", "cancelled"]),
  attachmentUrls: () => z.array(z.string().trim().min(1)),
});
export const updateTripProgramsSchema = createUpdateSchema(schema.tripPrograms, {
  currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
  status: () => z.enum(["active", "cancelled"]),
  attachmentUrls: () => z.array(z.string().trim().min(1)),
});

// Supplier Availability Blocks
export const selectSupplierAvailabilityBlocksSchema = createSelectSchema(
  schema.supplierAvailabilityBlocks,
);
export const insertSupplierAvailabilityBlocksSchema = createInsertSchema(
  schema.supplierAvailabilityBlocks,
  {
    supplierRole: () =>
      z.enum(["platform_driver", "org_driver", "platform_photographer", "org_photographer"]),
    blockType: () => z.enum(["available", "unavailable", "assigned_trip"]),
  },
);
export const updateSupplierAvailabilityBlocksSchema = createUpdateSchema(
  schema.supplierAvailabilityBlocks,
  {
    supplierRole: () =>
      z.enum(["platform_driver", "org_driver", "platform_photographer", "org_photographer"]),
    blockType: () => z.enum(["available", "unavailable", "assigned_trip"]),
  },
);

// Supplier Negotiations
export const selectSupplierNegotiationsSchema = createSelectSchema(schema.supplierNegotiations);
export const insertSupplierNegotiationsSchema = createInsertSchema(schema.supplierNegotiations, {
  supplierRole: () => z.enum(["platform_driver", "platform_photographer"]),
  status: () =>
    z.enum([
      "pending_supplier",
      "countered_by_supplier",
      "countered_by_org",
      "accepted",
      "declined",
      "expired",
      "cancelled",
    ]),
  currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
  lastOfferedBy: () => z.enum(["organization", "supplier"]),
});
export const updateSupplierNegotiationsSchema = createUpdateSchema(schema.supplierNegotiations, {
  supplierRole: () => z.enum(["platform_driver", "platform_photographer"]),
  status: () =>
    z.enum([
      "pending_supplier",
      "countered_by_supplier",
      "countered_by_org",
      "accepted",
      "declined",
      "expired",
      "cancelled",
    ]),
  currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
  lastOfferedBy: () => z.enum(["organization", "supplier"]),
});

// Trip Seat Inventory
export const selectTripSeatInventorySchema = createSelectSchema(schema.tripSeatInventory);
export const insertTripSeatInventorySchema = createInsertSchema(schema.tripSeatInventory, {
  status: () => z.enum(["available", "held", "reserved", "blocked"]),
});
export const updateTripSeatInventorySchema = createUpdateSchema(schema.tripSeatInventory, {
  status: () => z.enum(["available", "held", "reserved", "blocked"]),
});

// Coupons
export const selectCouponsSchema = createSelectSchema(schema.coupons);
export const insertCouponsSchema = createInsertSchema(schema.coupons, {
  scope: () => z.enum(["organization", "platform", "driver"]),
  discountType: () => z.enum(["percentage", "fixed_amount"]),
  currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
  status: () => z.enum(["active", "paused", "expired"]),
});
export const updateCouponsSchema = createUpdateSchema(schema.coupons, {
  scope: () => z.enum(["organization", "platform", "driver"]),
  discountType: () => z.enum(["percentage", "fixed_amount"]),
  currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
  status: () => z.enum(["active", "paused", "expired"]),
});

// Bookings
export const bookingPassengerSchema = z.object({
  id: z.string().trim().min(1),
  fullName: z.string().trim().min(2).max(200),
  isChild: z.boolean(),
  age: z.number().int().min(0).max(120).nullable().optional(),
  seatLabel: z.string().trim().min(1).max(16).nullable().optional(),
  guardianPhoneE164: z.string().trim().min(7).max(24).nullable().optional(),
});
export const selectBookingsSchema = createSelectSchema(schema.bookings);
export const insertBookingsSchema = createInsertSchema(schema.bookings, {
  passengers: () => z.array(bookingPassengerSchema).min(1),
  selectedProgramIds: () => z.array(z.uuid()),
  seatLabels: () => z.array(z.string().trim().min(1)),
  currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
  status: () =>
    z.enum(["pending_payment", "confirmed", "checked_in", "completed", "cancelled", "refunded"]),
  paymentGateway: () => z.enum(["stripe", "paymob", "fawry"]).nullable().optional(),
});
export const updateBookingsSchema = createUpdateSchema(schema.bookings, {
  passengers: () => z.array(bookingPassengerSchema).min(1),
  selectedProgramIds: () => z.array(z.uuid()),
  seatLabels: () => z.array(z.string().trim().min(1)),
  currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
  status: () =>
    z.enum(["pending_payment", "confirmed", "checked_in", "completed", "cancelled", "refunded"]),
  paymentGateway: () => z.enum(["stripe", "paymob", "fawry"]).nullable().optional(),
});

// Payment Transactions
export const selectPaymentTransactionsSchema = createSelectSchema(schema.paymentTransactions);
export const insertPaymentTransactionsSchema = createInsertSchema(schema.paymentTransactions, {
  purpose: () => z.enum(["trip_booking", "subscription_upgrade"]),
  gateway: () => z.enum(["stripe", "paymob", "fawry"]),
  currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
  status: () =>
    z.enum(["pending", "requires_action", "succeeded", "failed", "refunded", "disputed"]),
  disputeStatus: () =>
    z.enum(["open", "resolved_refund", "resolved_merchant"]).nullable().optional(),
});
export const updatePaymentTransactionsSchema = createUpdateSchema(schema.paymentTransactions, {
  purpose: () => z.enum(["trip_booking", "subscription_upgrade"]),
  gateway: () => z.enum(["stripe", "paymob", "fawry"]),
  currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
  status: () =>
    z.enum(["pending", "requires_action", "succeeded", "failed", "refunded", "disputed"]),
  disputeStatus: () =>
    z.enum(["open", "resolved_refund", "resolved_merchant"]).nullable().optional(),
});

// Subscription Records
export const selectSubscriptionRecordsSchema = createSelectSchema(schema.subscriptionRecords);
export const insertSubscriptionRecordsSchema = createInsertSchema(schema.subscriptionRecords, {
  scope: () => z.enum(["account", "organization"]),
  role: () => z.enum(["traveler", "organization", "platform_driver", "platform_photographer"]),
  billingCycle: () => z.enum(["monthly", "annual"]),
  currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
  status: () => z.enum(["active", "trialing", "past_due", "cancelled"]),
});
export const updateSubscriptionRecordsSchema = createUpdateSchema(schema.subscriptionRecords, {
  scope: () => z.enum(["account", "organization"]),
  role: () => z.enum(["traveler", "organization", "platform_driver", "platform_photographer"]),
  billingCycle: () => z.enum(["monthly", "annual"]),
  currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
  status: () => z.enum(["active", "trialing", "past_due", "cancelled"]),
});

// Accounting Ledger Entries
export const selectAccountingLedgerEntriesSchema = createSelectSchema(
  schema.accountingLedgerEntries,
);
export const insertAccountingLedgerEntriesSchema = createInsertSchema(
  schema.accountingLedgerEntries,
  {
    entryType: () =>
      z.enum([
        "booking_revenue",
        "platform_commission",
        "supplier_payout",
        "refund_debit",
        "payout_settlement",
      ]),
    direction: () => z.enum(["credit", "debit"]),
    currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
    status: () => z.enum(["posted", "settled", "reconciliation_exception"]),
  },
);
export const updateAccountingLedgerEntriesSchema = createUpdateSchema(
  schema.accountingLedgerEntries,
  {
    entryType: () =>
      z.enum([
        "booking_revenue",
        "platform_commission",
        "supplier_payout",
        "refund_debit",
        "payout_settlement",
      ]),
    direction: () => z.enum(["credit", "debit"]),
    currencyCode: () => z.enum(["EGP", "SAR", "AED"]),
    status: () => z.enum(["posted", "settled", "reconciliation_exception"]),
  },
);

// Check-In Records
export const selectCheckInRecordsSchema = createSelectSchema(schema.checkInRecords);
export const insertCheckInRecordsSchema = createInsertSchema(schema.checkInRecords, {
  status: () => z.enum(["pending", "checked_in", "no_show"]),
  method: () => z.enum(["qr_scan", "manual_override"]).nullable().optional(),
});
export const updateCheckInRecordsSchema = createUpdateSchema(schema.checkInRecords, {
  status: () => z.enum(["pending", "checked_in", "no_show"]),
  method: () => z.enum(["qr_scan", "manual_override"]).nullable().optional(),
});

// Trip Tracking Events
export const trackingCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speedKmh: z.number().min(0).max(300).nullable().optional(),
  headingDeg: z.number().min(0).max(360).nullable().optional(),
});
export const selectTripTrackingEventsSchema = createSelectSchema(schema.tripTrackingEvents);
export const insertTripTrackingEventsSchema = createInsertSchema(schema.tripTrackingEvents, {
  eventType: () =>
    z.enum([
      "gps_ping",
      "checkpoint_reached",
      "child_boarded",
      "child_disembarked",
      "safety_alert",
      "headcount_verified",
    ]),
  coordinates: () => trackingCoordinatesSchema.nullable().optional(),
  severity: () => z.enum(["info", "warning", "critical"]),
});
export const updateTripTrackingEventsSchema = createUpdateSchema(schema.tripTrackingEvents, {
  eventType: () =>
    z.enum([
      "gps_ping",
      "checkpoint_reached",
      "child_boarded",
      "child_disembarked",
      "safety_alert",
      "headcount_verified",
    ]),
  coordinates: () => trackingCoordinatesSchema.nullable().optional(),
  severity: () => z.enum(["info", "warning", "critical"]),
});

// Parent Child Links
export const selectParentChildLinksSchema = createSelectSchema(schema.parentChildLinks);
export const insertParentChildLinksSchema = createInsertSchema(schema.parentChildLinks, {
  status: () => z.enum(["active", "revoked"]),
});
export const updateParentChildLinksSchema = createUpdateSchema(schema.parentChildLinks, {
  status: () => z.enum(["active", "revoked"]),
});

// Trip Photo Albums
export const selectTripPhotoAlbumsSchema = createSelectSchema(schema.tripPhotoAlbums);
export const insertTripPhotoAlbumsSchema = createInsertSchema(schema.tripPhotoAlbums, {
  photoUrls: () => z.array(z.string().trim().min(1)),
  status: () => z.enum(["draft", "published", "archived"]),
});
export const updateTripPhotoAlbumsSchema = createUpdateSchema(schema.tripPhotoAlbums, {
  photoUrls: () => z.array(z.string().trim().min(1)),
  status: () => z.enum(["draft", "published", "archived"]),
});

// Driver Lab Tests
export const selectDriverLabTestsSchema = createSelectSchema(schema.driverLabTests);
export const insertDriverLabTestsSchema = createInsertSchema(schema.driverLabTests, {
  status: () =>
    z.enum(["requested", "booked", "result_uploaded", "verified_pass", "verified_fail", "expired"]),
});
export const updateDriverLabTestsSchema = createUpdateSchema(schema.driverLabTests, {
  status: () =>
    z.enum(["requested", "booked", "result_uploaded", "verified_pass", "verified_fail", "expired"]),
});

// Notification Messages
export const selectNotificationMessagesSchema = createSelectSchema(schema.notificationMessages);
export const insertNotificationMessagesSchema = createInsertSchema(schema.notificationMessages, {
  category: () =>
    z.enum(["bookings", "trip_updates", "promotions", "security", "safety", "operations"]),
  channel: () => z.enum(["in_app", "email", "sms", "push"]),
});
export const updateNotificationMessagesSchema = createUpdateSchema(schema.notificationMessages, {
  category: () =>
    z.enum(["bookings", "trip_updates", "promotions", "security", "safety", "operations"]),
  channel: () => z.enum(["in_app", "email", "sms", "push"]),
});

// Plan Catalog
export const selectPlanCatalogSchema = createSelectSchema(schema.planCatalog);

// Driver Profiles
export const selectDriverProfilesSchema = createSelectSchema(schema.driverProfiles);
export const updateDriverProfilesSchema = createUpdateSchema(schema.driverProfiles, {
  scope: () => z.enum(["platform", "organization"]),
  serviceAreas: () => z.array(z.string().trim().min(1)),
  planTier: () => z.enum(["basic", "professional", "premium"]).nullable().optional(),
  status: () => z.enum(["pending_approval", "active", "paused_lab_test", "suspended"]),
});

// Photographer Profiles
export const selectPhotographerProfilesSchema = createSelectSchema(schema.photographerProfiles);
export const updatePhotographerProfilesSchema = createUpdateSchema(schema.photographerProfiles, {
  scope: () => z.enum(["platform", "organization"]),
  cameraBodies: () => z.array(z.string().trim().min(1)),
  lenses: () => z.array(z.string().trim().min(1)),
  serviceRegions: () => z.array(z.string().trim().min(1)),
  specialties: () => z.array(z.string().trim().min(1)),
  planTier: () => z.enum(["basic", "studio", "pro"]).nullable().optional(),
  status: () => z.enum(["pending_approval", "active", "suspended"]),
});
