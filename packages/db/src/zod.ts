// Table-derived Zod schemas. One factory for the package, so every schema binds to the same zod instance.
// Coercion stays off: boundary input is validated exactly as it arrives.
import { createSchemaFactory } from "drizzle-orm/zod";
import { z } from "zod/v4";

import {
  ACCOUNT_ROLE_STATUSES,
  ACCOUNT_STATUSES,
  ADMIN_SUB_ROLES,
  ALBUM_SHARED_LINK_STATUSES,
  APPLICATION_DOCUMENT_VERIFIED_STATUSES,
  APPLICATION_STATES,
  AVAILABILITY_BLOCK_TYPES,
  BOOKING_STATUSES,
  CHECK_IN_METHODS,
  CHECK_IN_STATUSES,
  CLIENT_SURFACES,
  CONSENT_TYPES,
  COUPON_DISCOUNT_TYPES,
  COUPON_SCOPES,
  COUPON_STATUSES,
  CURRENCY_CODES,
  DISPUTE_RESOLUTION_STATUSES,
  DRIVER_LAB_TEST_KINDS,
  DRIVER_LAB_TEST_STATUSES,
  DRIVER_PLAN_TIERS,
  DRIVER_PROFILE_SCOPES,
  DRIVER_PROFILE_STATUSES,
  EMPLOYEE_MEMBERSHIP_STATUSES,
  LEDGER_ENTRY_DIRECTIONS,
  LEDGER_ENTRY_STATUSES,
  LEDGER_ENTRY_TYPES,
  MEDIA_STORAGE_DISKS,
  MODERATOR_ASSIGNMENT_STATUSES,
  NEGOTIATION_OFFER_PARTIES,
  NEGOTIATION_STATUSES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_DELIVERY_CHANNELS,
  ORGANIZATION_PLAN_TIERS,
  ORGANIZATION_STATUSES,
  ORG_PERMISSION_AREAS,
  ORG_PERMISSION_LEVELS,
  OTP_CHANNELS,
  OTP_DELIVERY_STATUSES,
  OTP_PURPOSES,
  PARENT_CHILD_LINK_STATUSES,
  PAYMENT_GATEWAY_CODES,
  PAYMENT_PURPOSES,
  PAYMENT_TRANSACTION_STATUSES,
  PAYOUT_METHODS,
  PHOTOGRAPHER_PLAN_TIERS,
  PHOTOGRAPHER_PROFILE_STATUSES,
  PLAN_CATALOG_STATUSES,
  PLAN_SCOPES,
  PLATFORM_SUPPLIER_ROLES,
  PRIMARY_SIGN_IN_METHODS,
  PRIVACY_REQUEST_STATUSES,
  PRIVACY_REQUEST_TYPES,
  SEAT_INVENTORY_STATUSES,
  SECOND_FACTOR_RULES,
  SUBSCRIPTION_BILLING_CYCLES,
  SUBSCRIPTION_RECORD_STATUSES,
  SUBSCRIPTION_ROLES,
  SUBSCRIPTION_SCOPES,
  SUPPLIER_APPLICATION_TYPES,
  SUPPLIER_ROLES,
  SUPPORTED_COUNTRY_CODES,
  SUPPORTED_LOCALES,
  TRACKING_ALERT_SEVERITIES,
  TRACKING_EVENT_TYPES,
  TRAVELER_PLAN_CODES,
  TRIP_PHOTO_ALBUM_AUDIENCES,
  TRIP_PHOTO_ALBUM_STATUSES,
  TRIP_PROGRAM_STATUSES,
  TRIP_PUBLISH_MODES,
  TRIP_SEAT_ASSIGNMENT_MODES,
  TRIP_STAFF_SOURCES,
  TRIP_STATES,
  UPLOADED_FILE_STATUSES,
  USER_ROLES,
  VEHICLE_REGISTRATION_STATUSES,
  VEHICLE_STATUSES,
  VEHICLE_TYPE_SCOPES,
  VEHICLE_TYPE_STATUSES,
  VERIFICATION_CHANNEL_RULES,
} from "@trips-app/domain";

import * as schema from "./schema";

// Backend schemas import from "@trips-app/db/zod" only. That subpath exposes the factory and the table
// definitions for derivation, and nothing that opens a database connection.
export { schema };

export const { createSelectSchema, createInsertSchema, createUpdateSchema } = createSchemaFactory({
  zodInstance: z,
  coerce: undefined,
});

export const lookupLocalizedTextSchema = z.object({
  en: z.string(),
  ar: z.string(),
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

export const bookingPassengerSchema = z.object({
  id: z.string().trim().min(1),
  fullName: z.string().trim().min(2).max(200),
  isChild: z.boolean(),
  age: z.number().int().min(0).max(120).nullable().optional(),
  seatLabel: z.string().trim().min(1).max(16).nullable().optional(),
  guardianPhoneE164: z.string().trim().min(7).max(24).nullable().optional(),
});

export const trackingCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speedKmh: z.number().min(0).max(300).nullable().optional(),
  headingDeg: z.number().min(0).max(360).nullable().optional(),
});

// ============================================================================
// 1. Auth Schemas (12 tables)
// ============================================================================

// accounts
export const selectAccountsSchema = createSelectSchema(schema.accounts);
export const insertAccountsSchema = createInsertSchema(schema.accounts, {
  preferredSignInMethod: () => z.enum(PRIMARY_SIGN_IN_METHODS),
  staffSecondFactorMethod: () => z.enum(["sms", "totp"]).nullable().optional(),
  countryCode: () => z.enum(SUPPORTED_COUNTRY_CODES),
  preferredLanguage: () => z.enum(SUPPORTED_LOCALES),
  travelerPlanTier: () => z.enum(TRAVELER_PLAN_CODES),
  status: () => z.enum(ACCOUNT_STATUSES),
  knownDeviceFingerprints: () => z.array(z.string()),
});
export const updateAccountsSchema = createUpdateSchema(schema.accounts, {
  preferredSignInMethod: () => z.enum(PRIMARY_SIGN_IN_METHODS),
  staffSecondFactorMethod: () => z.enum(["sms", "totp"]).nullable().optional(),
  countryCode: () => z.enum(SUPPORTED_COUNTRY_CODES),
  preferredLanguage: () => z.enum(SUPPORTED_LOCALES),
  travelerPlanTier: () => z.enum(TRAVELER_PLAN_CODES),
  status: () => z.enum(ACCOUNT_STATUSES),
  knownDeviceFingerprints: () => z.array(z.string()),
});
export const selectAccountSchema = selectAccountsSchema;
export const insertAccountSchema = insertAccountsSchema;
export const updateAccountSchema = updateAccountsSchema;

// organizations
export const selectOrganizationsSchema = createSelectSchema(schema.organizations);
export const insertOrganizationsSchema = createInsertSchema(schema.organizations, {
  countryCode: () => z.enum(SUPPORTED_COUNTRY_CODES),
  payoutMethod: () => z.enum(PAYOUT_METHODS),
  planTier: () => z.enum(ORGANIZATION_PLAN_TIERS),
  status: () => z.enum(ORGANIZATION_STATUSES),
});
export const updateOrganizationsSchema = createUpdateSchema(schema.organizations, {
  countryCode: () => z.enum(SUPPORTED_COUNTRY_CODES),
  payoutMethod: () => z.enum(PAYOUT_METHODS),
  planTier: () => z.enum(ORGANIZATION_PLAN_TIERS),
  status: () => z.enum(ORGANIZATION_STATUSES),
});
export const selectOrganizationSchema = selectOrganizationsSchema;
export const insertOrganizationSchema = insertOrganizationsSchema;
export const updateOrganizationSchema = updateOrganizationsSchema;

// accountRoles
export const selectAccountRolesSchema = createSelectSchema(schema.accountRoles);
export const insertAccountRolesSchema = createInsertSchema(schema.accountRoles, {
  role: () => z.enum(USER_ROLES),
  adminSubRole: () => z.enum(ADMIN_SUB_ROLES).nullable().optional(),
  status: () => z.enum(ACCOUNT_ROLE_STATUSES),
});
export const updateAccountRolesSchema = createUpdateSchema(schema.accountRoles, {
  role: () => z.enum(USER_ROLES),
  adminSubRole: () => z.enum(ADMIN_SUB_ROLES).nullable().optional(),
  status: () => z.enum(ACCOUNT_ROLE_STATUSES),
});
export const selectAccountRoleSchema = selectAccountRolesSchema;
export const insertAccountRoleSchema = insertAccountRolesSchema;
export const updateAccountRoleSchema = updateAccountRolesSchema;

// employeeMemberships
export const selectEmployeeMembershipsSchema = createSelectSchema(schema.employeeMemberships);
export const insertEmployeeMembershipsSchema = createInsertSchema(schema.employeeMemberships, {
  permissions: () => z.record(z.enum(ORG_PERMISSION_AREAS), z.enum(ORG_PERMISSION_LEVELS)),
  status: () => z.enum(EMPLOYEE_MEMBERSHIP_STATUSES),
});
export const updateEmployeeMembershipsSchema = createUpdateSchema(schema.employeeMemberships, {
  permissions: () => z.record(z.enum(ORG_PERMISSION_AREAS), z.enum(ORG_PERMISSION_LEVELS)),
  status: () => z.enum(EMPLOYEE_MEMBERSHIP_STATUSES),
});
export const selectEmployeeMembershipSchema = selectEmployeeMembershipsSchema;
export const insertEmployeeMembershipSchema = insertEmployeeMembershipsSchema;
export const updateEmployeeMembershipSchema = updateEmployeeMembershipsSchema;

// moderatorAssignments
export const selectModeratorAssignmentsSchema = createSelectSchema(schema.moderatorAssignments);
export const insertModeratorAssignmentsSchema = createInsertSchema(schema.moderatorAssignments, {
  status: () => z.enum(MODERATOR_ASSIGNMENT_STATUSES),
});
export const updateModeratorAssignmentsSchema = createUpdateSchema(schema.moderatorAssignments, {
  status: () => z.enum(MODERATOR_ASSIGNMENT_STATUSES),
});
export const selectModeratorAssignmentSchema = selectModeratorAssignmentsSchema;
export const insertModeratorAssignmentSchema = insertModeratorAssignmentsSchema;
export const updateModeratorAssignmentSchema = updateModeratorAssignmentsSchema;

// adminInvites
export const selectAdminInvitesSchema = createSelectSchema(schema.adminInvites);
export const insertAdminInvitesSchema = createInsertSchema(schema.adminInvites, {
  subRole: () => z.enum(ADMIN_SUB_ROLES),
});
export const updateAdminInvitesSchema = createUpdateSchema(schema.adminInvites, {
  subRole: () => z.enum(ADMIN_SUB_ROLES),
});
export const selectAdminInviteSchema = selectAdminInvitesSchema;
export const insertAdminInviteSchema = insertAdminInvitesSchema;
export const updateAdminInviteSchema = updateAdminInvitesSchema;

// otpVerifications
export const selectOtpVerificationsSchema = createSelectSchema(schema.otpVerifications);
export const insertOtpVerificationsSchema = createInsertSchema(schema.otpVerifications, {
  channel: () => z.enum(OTP_CHANNELS),
  purpose: () => z.enum(OTP_PURPOSES),
  deliveryStatus: () => z.enum(OTP_DELIVERY_STATUSES),
});
export const updateOtpVerificationsSchema = createUpdateSchema(schema.otpVerifications, {
  channel: () => z.enum(OTP_CHANNELS),
  purpose: () => z.enum(OTP_PURPOSES),
  deliveryStatus: () => z.enum(OTP_DELIVERY_STATUSES),
});
export const selectOtpVerificationSchema = selectOtpVerificationsSchema;
export const insertOtpVerificationSchema = insertOtpVerificationsSchema;
export const updateOtpVerificationSchema = updateOtpVerificationsSchema;

// authSessions
export const selectAuthSessionsSchema = createSelectSchema(schema.authSessions);
export const insertAuthSessionsSchema = createInsertSchema(schema.authSessions, {
  activeRole: () => z.enum(USER_ROLES),
  adminSubRole: () => z.enum(ADMIN_SUB_ROLES).nullable().optional(),
  surface: () => z.enum(CLIENT_SURFACES),
});
export const updateAuthSessionsSchema = createUpdateSchema(schema.authSessions, {
  activeRole: () => z.enum(USER_ROLES),
  adminSubRole: () => z.enum(ADMIN_SUB_ROLES).nullable().optional(),
  surface: () => z.enum(CLIENT_SURFACES),
});
export const selectAuthSessionSchema = selectAuthSessionsSchema;
export const insertAuthSessionSchema = insertAuthSessionsSchema;
export const updateAuthSessionSchema = updateAuthSessionsSchema;

// notificationPreferences
export const selectNotificationPreferencesSchema = createSelectSchema(
  schema.notificationPreferences,
);
export const insertNotificationPreferencesSchema = createInsertSchema(
  schema.notificationPreferences,
);
export const updateNotificationPreferencesSchema = createUpdateSchema(
  schema.notificationPreferences,
);
export const selectNotificationPreferenceSchema = selectNotificationPreferencesSchema;
export const insertNotificationPreferenceSchema = insertNotificationPreferencesSchema;
export const updateNotificationPreferenceSchema = updateNotificationPreferencesSchema;

// auditLogs
export const selectAuditLogsSchema = createSelectSchema(schema.auditLogs);
export const insertAuditLogsSchema = createInsertSchema(schema.auditLogs, {
  actorRole: () => z.union([z.enum(USER_ROLES), z.literal("system")]),
  beforeState: () => z.record(z.string(), z.unknown()).nullable().optional(),
  afterState: () => z.record(z.string(), z.unknown()).nullable().optional(),
});
export const updateAuditLogsSchema = createUpdateSchema(schema.auditLogs, {
  actorRole: () => z.union([z.enum(USER_ROLES), z.literal("system")]),
  beforeState: () => z.record(z.string(), z.unknown()).nullable().optional(),
  afterState: () => z.record(z.string(), z.unknown()).nullable().optional(),
});
export const selectAuditLogSchema = selectAuditLogsSchema;
export const insertAuditLogSchema = insertAuditLogsSchema;
export const updateAuditLogSchema = updateAuditLogsSchema;

// idempotencyKeys
export const selectIdempotencyKeysSchema = createSelectSchema(schema.idempotencyKeys);
export const insertIdempotencyKeysSchema = createInsertSchema(schema.idempotencyKeys, {
  responsePayload: () => z.unknown(),
});
export const updateIdempotencyKeysSchema = createUpdateSchema(schema.idempotencyKeys, {
  responsePayload: () => z.unknown(),
});
export const selectIdempotencyKeySchema = selectIdempotencyKeysSchema;
export const insertIdempotencyKeySchema = insertIdempotencyKeysSchema;
export const updateIdempotencyKeySchema = updateIdempotencyKeysSchema;

// privacyRequests
export const selectPrivacyRequestsSchema = createSelectSchema(schema.privacyRequests);
export const insertPrivacyRequestsSchema = createInsertSchema(schema.privacyRequests, {
  requestType: () => z.enum(PRIVACY_REQUEST_TYPES),
  status: () => z.enum(PRIVACY_REQUEST_STATUSES),
});
export const updatePrivacyRequestsSchema = createUpdateSchema(schema.privacyRequests, {
  requestType: () => z.enum(PRIVACY_REQUEST_TYPES),
  status: () => z.enum(PRIVACY_REQUEST_STATUSES),
});
export const selectPrivacyRequestSchema = selectPrivacyRequestsSchema;
export const insertPrivacyRequestSchema = insertPrivacyRequestsSchema;
export const updatePrivacyRequestSchema = updatePrivacyRequestsSchema;

// ============================================================================
// 2. Commerce Schemas (4 tables)
// ============================================================================

// bookings
export const selectBookingsSchema = createSelectSchema(schema.bookings);
export const insertBookingsSchema = createInsertSchema(schema.bookings, {
  passengers: () => z.array(bookingPassengerSchema).min(1),
  selectedProgramIds: () => z.array(z.uuid()),
  seatLabels: () => z.array(z.string().trim().min(1)),
  currencyCode: () => z.enum(CURRENCY_CODES),
  status: () => z.enum(BOOKING_STATUSES),
  paymentGateway: () => z.enum(PAYMENT_GATEWAY_CODES).nullable().optional(),
});
export const updateBookingsSchema = createUpdateSchema(schema.bookings, {
  passengers: () => z.array(bookingPassengerSchema).min(1),
  selectedProgramIds: () => z.array(z.uuid()),
  seatLabels: () => z.array(z.string().trim().min(1)),
  currencyCode: () => z.enum(CURRENCY_CODES),
  status: () => z.enum(BOOKING_STATUSES),
  paymentGateway: () => z.enum(PAYMENT_GATEWAY_CODES).nullable().optional(),
});
export const selectBookingSchema = selectBookingsSchema;
export const insertBookingSchema = insertBookingsSchema;
export const updateBookingSchema = updateBookingsSchema;

// paymentTransactions
export const selectPaymentTransactionsSchema = createSelectSchema(schema.paymentTransactions);
export const insertPaymentTransactionsSchema = createInsertSchema(schema.paymentTransactions, {
  purpose: () => z.enum(PAYMENT_PURPOSES),
  gateway: () => z.enum(PAYMENT_GATEWAY_CODES),
  currencyCode: () => z.enum(CURRENCY_CODES),
  status: () => z.enum(PAYMENT_TRANSACTION_STATUSES),
  disputeStatus: () => z.enum(DISPUTE_RESOLUTION_STATUSES).nullable().optional(),
});
export const updatePaymentTransactionsSchema = createUpdateSchema(schema.paymentTransactions, {
  purpose: () => z.enum(PAYMENT_PURPOSES),
  gateway: () => z.enum(PAYMENT_GATEWAY_CODES),
  currencyCode: () => z.enum(CURRENCY_CODES),
  status: () => z.enum(PAYMENT_TRANSACTION_STATUSES),
  disputeStatus: () => z.enum(DISPUTE_RESOLUTION_STATUSES).nullable().optional(),
});
export const selectPaymentTransactionSchema = selectPaymentTransactionsSchema;
export const insertPaymentTransactionSchema = insertPaymentTransactionsSchema;
export const updatePaymentTransactionSchema = updatePaymentTransactionsSchema;

// subscriptionRecords
export const selectSubscriptionRecordsSchema = createSelectSchema(schema.subscriptionRecords);
export const insertSubscriptionRecordsSchema = createInsertSchema(schema.subscriptionRecords, {
  scope: () => z.enum(SUBSCRIPTION_SCOPES),
  role: () => z.enum(SUBSCRIPTION_ROLES),
  billingCycle: () => z.enum(SUBSCRIPTION_BILLING_CYCLES),
  currencyCode: () => z.enum(CURRENCY_CODES),
  status: () => z.enum(SUBSCRIPTION_RECORD_STATUSES),
});
export const updateSubscriptionRecordsSchema = createUpdateSchema(schema.subscriptionRecords, {
  scope: () => z.enum(SUBSCRIPTION_SCOPES),
  role: () => z.enum(SUBSCRIPTION_ROLES),
  billingCycle: () => z.enum(SUBSCRIPTION_BILLING_CYCLES),
  currencyCode: () => z.enum(CURRENCY_CODES),
  status: () => z.enum(SUBSCRIPTION_RECORD_STATUSES),
});
export const selectSubscriptionRecordSchema = selectSubscriptionRecordsSchema;
export const insertSubscriptionRecordSchema = insertSubscriptionRecordsSchema;
export const updateSubscriptionRecordSchema = updateSubscriptionRecordsSchema;

// accountingLedgerEntries
export const selectAccountingLedgerEntriesSchema = createSelectSchema(
  schema.accountingLedgerEntries,
);
export const insertAccountingLedgerEntriesSchema = createInsertSchema(
  schema.accountingLedgerEntries,
  {
    entryType: () => z.enum(LEDGER_ENTRY_TYPES),
    direction: () => z.enum(LEDGER_ENTRY_DIRECTIONS),
    currencyCode: () => z.enum(CURRENCY_CODES),
    status: () => z.enum(LEDGER_ENTRY_STATUSES),
  },
);
export const updateAccountingLedgerEntriesSchema = createUpdateSchema(
  schema.accountingLedgerEntries,
  {
    entryType: () => z.enum(LEDGER_ENTRY_TYPES),
    direction: () => z.enum(LEDGER_ENTRY_DIRECTIONS),
    currencyCode: () => z.enum(CURRENCY_CODES),
    status: () => z.enum(LEDGER_ENTRY_STATUSES),
  },
);
export const selectAccountingLedgerEntrySchema = selectAccountingLedgerEntriesSchema;
export const insertAccountingLedgerEntrySchema = insertAccountingLedgerEntriesSchema;
export const updateAccountingLedgerEntrySchema = updateAccountingLedgerEntriesSchema;

// ============================================================================
// 3. Execution Schemas (7 tables)
// ============================================================================

// checkInRecords
export const selectCheckInRecordsSchema = createSelectSchema(schema.checkInRecords);
export const insertCheckInRecordsSchema = createInsertSchema(schema.checkInRecords, {
  status: () => z.enum(CHECK_IN_STATUSES),
  method: () => z.enum(CHECK_IN_METHODS).nullable().optional(),
});
export const updateCheckInRecordsSchema = createUpdateSchema(schema.checkInRecords, {
  status: () => z.enum(CHECK_IN_STATUSES),
  method: () => z.enum(CHECK_IN_METHODS).nullable().optional(),
});
export const selectCheckInRecordSchema = selectCheckInRecordsSchema;
export const insertCheckInRecordSchema = insertCheckInRecordsSchema;
export const updateCheckInRecordSchema = updateCheckInRecordsSchema;

// tripTrackingEvents
export const selectTripTrackingEventsSchema = createSelectSchema(schema.tripTrackingEvents);
export const insertTripTrackingEventsSchema = createInsertSchema(schema.tripTrackingEvents, {
  eventType: () => z.enum(TRACKING_EVENT_TYPES),
  coordinates: () => trackingCoordinatesSchema.nullable().optional(),
  severity: () => z.enum(TRACKING_ALERT_SEVERITIES),
});
export const updateTripTrackingEventsSchema = createUpdateSchema(schema.tripTrackingEvents, {
  eventType: () => z.enum(TRACKING_EVENT_TYPES),
  coordinates: () => trackingCoordinatesSchema.nullable().optional(),
  severity: () => z.enum(TRACKING_ALERT_SEVERITIES),
});
export const selectTripTrackingEventSchema = selectTripTrackingEventsSchema;
export const insertTripTrackingEventSchema = insertTripTrackingEventsSchema;
export const updateTripTrackingEventSchema = updateTripTrackingEventsSchema;

// parentChildLinks
export const selectParentChildLinksSchema = createSelectSchema(schema.parentChildLinks);
export const insertParentChildLinksSchema = createInsertSchema(schema.parentChildLinks, {
  status: () => z.enum(PARENT_CHILD_LINK_STATUSES),
});
export const updateParentChildLinksSchema = createUpdateSchema(schema.parentChildLinks, {
  status: () => z.enum(PARENT_CHILD_LINK_STATUSES),
});
export const selectParentChildLinkSchema = selectParentChildLinksSchema;
export const insertParentChildLinkSchema = insertParentChildLinksSchema;
export const updateParentChildLinkSchema = updateParentChildLinksSchema;

// tripPhotoAlbums
export const selectTripPhotoAlbumsSchema = createSelectSchema(schema.tripPhotoAlbums);
export const insertTripPhotoAlbumsSchema = createInsertSchema(schema.tripPhotoAlbums, {
  photoUrls: () => z.array(z.string().trim().min(1)),
  audience: () => z.enum(TRIP_PHOTO_ALBUM_AUDIENCES),
  status: () => z.enum(TRIP_PHOTO_ALBUM_STATUSES),
});
export const updateTripPhotoAlbumsSchema = createUpdateSchema(schema.tripPhotoAlbums, {
  photoUrls: () => z.array(z.string().trim().min(1)),
  audience: () => z.enum(TRIP_PHOTO_ALBUM_AUDIENCES),
  status: () => z.enum(TRIP_PHOTO_ALBUM_STATUSES),
});
export const selectTripPhotoAlbumSchema = selectTripPhotoAlbumsSchema;
export const insertTripPhotoAlbumSchema = insertTripPhotoAlbumsSchema;
export const updateTripPhotoAlbumSchema = updateTripPhotoAlbumsSchema;

// albumSharedLinks
export const selectAlbumSharedLinksSchema = createSelectSchema(schema.albumSharedLinks);
export const insertAlbumSharedLinksSchema = createInsertSchema(schema.albumSharedLinks, {
  status: () => z.enum(ALBUM_SHARED_LINK_STATUSES),
});
export const updateAlbumSharedLinksSchema = createUpdateSchema(schema.albumSharedLinks, {
  status: () => z.enum(ALBUM_SHARED_LINK_STATUSES),
});
export const selectAlbumSharedLinkSchema = selectAlbumSharedLinksSchema;
export const insertAlbumSharedLinkSchema = insertAlbumSharedLinksSchema;
export const updateAlbumSharedLinkSchema = updateAlbumSharedLinksSchema;

// driverLabTests
export const selectDriverLabTestsSchema = createSelectSchema(schema.driverLabTests);
export const insertDriverLabTestsSchema = createInsertSchema(schema.driverLabTests, {
  status: () => z.enum(DRIVER_LAB_TEST_STATUSES),
  testType: () => z.enum(DRIVER_LAB_TEST_KINDS),
});
export const updateDriverLabTestsSchema = createUpdateSchema(schema.driverLabTests, {
  status: () => z.enum(DRIVER_LAB_TEST_STATUSES),
  testType: () => z.enum(DRIVER_LAB_TEST_KINDS),
});
export const selectDriverLabTestSchema = selectDriverLabTestsSchema;
export const insertDriverLabTestSchema = insertDriverLabTestsSchema;
export const updateDriverLabTestSchema = updateDriverLabTestsSchema;

// notificationMessages
export const selectNotificationMessagesSchema = createSelectSchema(schema.notificationMessages);
export const insertNotificationMessagesSchema = createInsertSchema(schema.notificationMessages, {
  category: () => z.enum(NOTIFICATION_CATEGORIES),
  channel: () => z.enum(NOTIFICATION_DELIVERY_CHANNELS),
});
export const updateNotificationMessagesSchema = createUpdateSchema(schema.notificationMessages, {
  category: () => z.enum(NOTIFICATION_CATEGORIES),
  channel: () => z.enum(NOTIFICATION_DELIVERY_CHANNELS),
});
export const selectNotificationMessageSchema = selectNotificationMessagesSchema;
export const insertNotificationMessageSchema = insertNotificationMessagesSchema;
export const updateNotificationMessageSchema = updateNotificationMessagesSchema;

// ============================================================================
// 4. Fleet Schemas (2 tables)
// ============================================================================

// vehicleTypes
export const selectVehicleTypesSchema = createSelectSchema(schema.vehicleTypes);
export const insertVehicleTypesSchema = createInsertSchema(schema.vehicleTypes, {
  scope: () => z.enum(VEHICLE_TYPE_SCOPES),
  status: () => z.enum(VEHICLE_TYPE_STATUSES),
  seatLayout: () => seatLayoutConfigSchema,
});
export const updateVehicleTypesSchema = createUpdateSchema(schema.vehicleTypes, {
  scope: () => z.enum(VEHICLE_TYPE_SCOPES),
  status: () => z.enum(VEHICLE_TYPE_STATUSES),
  seatLayout: () => seatLayoutConfigSchema,
});
export const selectVehicleTypeSchema = selectVehicleTypesSchema;
export const insertVehicleTypeSchema = insertVehicleTypesSchema;
export const updateVehicleTypeSchema = updateVehicleTypesSchema;

// vehicles
export const selectVehiclesSchema = createSelectSchema(schema.vehicles);
export const insertVehiclesSchema = createInsertSchema(schema.vehicles, {
  registrationStatus: () => z.enum(VEHICLE_REGISTRATION_STATUSES),
  status: () => z.enum(VEHICLE_STATUSES),
  photoUrls: () => z.array(z.string().trim().min(1)),
  amenityCodes: () => z.array(z.string().trim().min(1)),
});
export const updateVehiclesSchema = createUpdateSchema(schema.vehicles, {
  registrationStatus: () => z.enum(VEHICLE_REGISTRATION_STATUSES),
  status: () => z.enum(VEHICLE_STATUSES),
  photoUrls: () => z.array(z.string().trim().min(1)),
  amenityCodes: () => z.array(z.string().trim().min(1)),
});
export const selectVehicleSchema = selectVehiclesSchema;
export const insertVehicleSchema = insertVehiclesSchema;
export const updateVehicleSchema = updateVehiclesSchema;

// ============================================================================
// 5. Lookups Schemas (2 tables)
// ============================================================================

// lookupTypes
export const selectLookupTypesSchema = createSelectSchema(schema.lookupTypes);
export const insertLookupTypesSchema = createInsertSchema(schema.lookupTypes, {
  name: () => lookupLocalizedTextSchema,
  description: () => lookupLocalizedTextSchema.nullable().optional(),
});
export const updateLookupTypesSchema = createUpdateSchema(schema.lookupTypes, {
  name: () => lookupLocalizedTextSchema,
  description: () => lookupLocalizedTextSchema.nullable().optional(),
});
export const selectLookupTypeSchema = selectLookupTypesSchema;
export const insertLookupTypeSchema = insertLookupTypesSchema;
export const updateLookupTypeSchema = updateLookupTypesSchema;

// lookups
export const selectLookupsSchema = createSelectSchema(schema.lookups);
export const insertLookupsSchema = createInsertSchema(schema.lookups, {
  name: () => lookupLocalizedTextSchema,
  description: () => lookupLocalizedTextSchema.nullable().optional(),
});
export const updateLookupsSchema = createUpdateSchema(schema.lookups, {
  name: () => lookupLocalizedTextSchema,
  description: () => lookupLocalizedTextSchema.nullable().optional(),
});
export const selectLookupSchema = selectLookupsSchema;
export const insertLookupSchema = insertLookupsSchema;
export const updateLookupSchema = updateLookupsSchema;

// ============================================================================
// 6. Media Schemas (1 table)
// ============================================================================

// uploadedFiles
export const selectUploadedFilesSchema = createSelectSchema(schema.uploadedFiles);
export const insertUploadedFilesSchema = createInsertSchema(schema.uploadedFiles, {
  disk: () => z.enum(MEDIA_STORAGE_DISKS),
  status: () => z.enum(UPLOADED_FILE_STATUSES),
  metadata: () => z.record(z.string(), z.unknown()).nullable().optional(),
});
export const updateUploadedFilesSchema = createUpdateSchema(schema.uploadedFiles, {
  disk: () => z.enum(MEDIA_STORAGE_DISKS),
  status: () => z.enum(UPLOADED_FILE_STATUSES),
  metadata: () => z.record(z.string(), z.unknown()).nullable().optional(),
});
export const selectUploadedFileSchema = selectUploadedFilesSchema;
export const insertUploadedFileSchema = insertUploadedFilesSchema;
export const updateUploadedFileSchema = updateUploadedFilesSchema;

// ============================================================================
// 7. Onboarding Schemas (5 tables)
// ============================================================================

// applications
export const selectApplicationsSchema = createSelectSchema(schema.applications);
export const insertApplicationsSchema = createInsertSchema(schema.applications, {
  applicationType: () => z.enum(SUPPLIER_APPLICATION_TYPES),
  state: () => z.enum(APPLICATION_STATES),
  payload: () => z.record(z.string(), z.unknown()),
  changesRequestedChecklist: () =>
    z
      .array(
        z.object({
          field: z.string(),
          instruction: z.string(),
          resolved: z.boolean().optional(),
        }),
      )
      .nullable()
      .optional(),
});
export const updateApplicationsSchema = createUpdateSchema(schema.applications, {
  applicationType: () => z.enum(SUPPLIER_APPLICATION_TYPES),
  state: () => z.enum(APPLICATION_STATES),
  payload: () => z.record(z.string(), z.unknown()),
  changesRequestedChecklist: () =>
    z
      .array(
        z.object({
          field: z.string(),
          instruction: z.string(),
          resolved: z.boolean().optional(),
        }),
      )
      .nullable()
      .optional(),
});
export const selectApplicationSchema = selectApplicationsSchema;
export const insertApplicationSchema = insertApplicationsSchema;
export const updateApplicationSchema = updateApplicationsSchema;

// applicationDocuments
export const selectApplicationDocumentsSchema = createSelectSchema(schema.applicationDocuments);
export const insertApplicationDocumentsSchema = createInsertSchema(schema.applicationDocuments, {
  verifiedStatus: () => z.enum(APPLICATION_DOCUMENT_VERIFIED_STATUSES),
});
export const updateApplicationDocumentsSchema = createUpdateSchema(schema.applicationDocuments, {
  verifiedStatus: () => z.enum(APPLICATION_DOCUMENT_VERIFIED_STATUSES),
});
export const selectApplicationDocumentSchema = selectApplicationDocumentsSchema;
export const insertApplicationDocumentSchema = insertApplicationDocumentsSchema;
export const updateApplicationDocumentSchema = updateApplicationDocumentsSchema;

// consentRecords
export const selectConsentRecordsSchema = createSelectSchema(schema.consentRecords);
export const insertConsentRecordsSchema = createInsertSchema(schema.consentRecords, {
  consentType: () => z.enum(CONSENT_TYPES),
});
export const updateConsentRecordsSchema = createUpdateSchema(schema.consentRecords, {
  consentType: () => z.enum(CONSENT_TYPES),
});
export const selectConsentRecordSchema = selectConsentRecordsSchema;
export const insertConsentRecordSchema = insertConsentRecordsSchema;
export const updateConsentRecordSchema = updateConsentRecordsSchema;

// driverProfiles
export const selectDriverProfilesSchema = createSelectSchema(schema.driverProfiles);
export const insertDriverProfilesSchema = createInsertSchema(schema.driverProfiles, {
  scope: () => z.enum(DRIVER_PROFILE_SCOPES),
  serviceAreas: () => z.array(z.string().trim().min(1)),
  planTier: () => z.enum(DRIVER_PLAN_TIERS).nullable().optional(),
  status: () => z.enum(DRIVER_PROFILE_STATUSES),
});
export const updateDriverProfilesSchema = createUpdateSchema(schema.driverProfiles, {
  scope: () => z.enum(DRIVER_PROFILE_SCOPES),
  serviceAreas: () => z.array(z.string().trim().min(1)),
  planTier: () => z.enum(DRIVER_PLAN_TIERS).nullable().optional(),
  status: () => z.enum(DRIVER_PROFILE_STATUSES),
});
export const selectDriverProfileSchema = selectDriverProfilesSchema;
export const insertDriverProfileSchema = insertDriverProfilesSchema;
export const updateDriverProfileSchema = updateDriverProfilesSchema;

// photographerProfiles
export const selectPhotographerProfilesSchema = createSelectSchema(schema.photographerProfiles);
export const insertPhotographerProfilesSchema = createInsertSchema(schema.photographerProfiles, {
  scope: () => z.enum(DRIVER_PROFILE_SCOPES),
  cameraBodies: () => z.array(z.string().trim().min(1)),
  lenses: () => z.array(z.string().trim().min(1)),
  serviceRegions: () => z.array(z.string().trim().min(1)),
  specialties: () => z.array(z.string().trim().min(1)),
  sampleAlbums: () => z.array(z.object({ title: z.string(), photoCount: z.number() })),
  planTier: () => z.enum(PHOTOGRAPHER_PLAN_TIERS).nullable().optional(),
  status: () => z.enum(PHOTOGRAPHER_PROFILE_STATUSES),
});
export const updatePhotographerProfilesSchema = createUpdateSchema(schema.photographerProfiles, {
  scope: () => z.enum(DRIVER_PROFILE_SCOPES),
  cameraBodies: () => z.array(z.string().trim().min(1)),
  lenses: () => z.array(z.string().trim().min(1)),
  serviceRegions: () => z.array(z.string().trim().min(1)),
  specialties: () => z.array(z.string().trim().min(1)),
  sampleAlbums: () => z.array(z.object({ title: z.string(), photoCount: z.number() })),
  planTier: () => z.enum(PHOTOGRAPHER_PLAN_TIERS).nullable().optional(),
  status: () => z.enum(PHOTOGRAPHER_PROFILE_STATUSES),
});
export const selectPhotographerProfileSchema = selectPhotographerProfilesSchema;
export const insertPhotographerProfileSchema = insertPhotographerProfilesSchema;
export const updatePhotographerProfileSchema = updatePhotographerProfilesSchema;

// ============================================================================
// 8. Operations Schemas (5 tables)
// ============================================================================

// tripPrograms
export const selectTripProgramsSchema = createSelectSchema(schema.tripPrograms);
export const insertTripProgramsSchema = createInsertSchema(schema.tripPrograms, {
  currencyCode: () => z.enum(CURRENCY_CODES),
  status: () => z.enum(TRIP_PROGRAM_STATUSES),
  attachmentUrls: () => z.array(z.string().trim().min(1)),
});
export const updateTripProgramsSchema = createUpdateSchema(schema.tripPrograms, {
  currencyCode: () => z.enum(CURRENCY_CODES),
  status: () => z.enum(TRIP_PROGRAM_STATUSES),
  attachmentUrls: () => z.array(z.string().trim().min(1)),
});
export const selectTripProgramSchema = selectTripProgramsSchema;
export const insertTripProgramSchema = insertTripProgramsSchema;
export const updateTripProgramSchema = updateTripProgramsSchema;

// supplierAvailabilityBlocks
export const selectSupplierAvailabilityBlocksSchema = createSelectSchema(
  schema.supplierAvailabilityBlocks,
);
export const insertSupplierAvailabilityBlocksSchema = createInsertSchema(
  schema.supplierAvailabilityBlocks,
  {
    supplierRole: () => z.enum(SUPPLIER_ROLES),
    blockType: () => z.enum(AVAILABILITY_BLOCK_TYPES),
  },
);
export const updateSupplierAvailabilityBlocksSchema = createUpdateSchema(
  schema.supplierAvailabilityBlocks,
  {
    supplierRole: () => z.enum(SUPPLIER_ROLES),
    blockType: () => z.enum(AVAILABILITY_BLOCK_TYPES),
  },
);
export const selectSupplierAvailabilityBlockSchema = selectSupplierAvailabilityBlocksSchema;
export const insertSupplierAvailabilityBlockSchema = insertSupplierAvailabilityBlocksSchema;
export const updateSupplierAvailabilityBlockSchema = updateSupplierAvailabilityBlocksSchema;

// supplierNegotiations
export const selectSupplierNegotiationsSchema = createSelectSchema(schema.supplierNegotiations);
export const insertSupplierNegotiationsSchema = createInsertSchema(schema.supplierNegotiations, {
  supplierRole: () => z.enum(PLATFORM_SUPPLIER_ROLES),
  status: () => z.enum(NEGOTIATION_STATUSES),
  currencyCode: () => z.enum(CURRENCY_CODES),
  lastOfferedBy: () => z.enum(NEGOTIATION_OFFER_PARTIES),
});
export const updateSupplierNegotiationsSchema = createUpdateSchema(schema.supplierNegotiations, {
  supplierRole: () => z.enum(PLATFORM_SUPPLIER_ROLES),
  status: () => z.enum(NEGOTIATION_STATUSES),
  currencyCode: () => z.enum(CURRENCY_CODES),
  lastOfferedBy: () => z.enum(NEGOTIATION_OFFER_PARTIES),
});
export const selectSupplierNegotiationSchema = selectSupplierNegotiationsSchema;
export const insertSupplierNegotiationSchema = insertSupplierNegotiationsSchema;
export const updateSupplierNegotiationSchema = updateSupplierNegotiationsSchema;

// tripSeatInventory
export const selectTripSeatInventorySchema = createSelectSchema(schema.tripSeatInventory);
export const insertTripSeatInventorySchema = createInsertSchema(schema.tripSeatInventory, {
  status: () => z.enum(SEAT_INVENTORY_STATUSES),
});
export const updateTripSeatInventorySchema = createUpdateSchema(schema.tripSeatInventory, {
  status: () => z.enum(SEAT_INVENTORY_STATUSES),
});
export const selectTripSeatInventoryRecordSchema = selectTripSeatInventorySchema;
export const insertTripSeatInventoryRecordSchema = insertTripSeatInventorySchema;
export const updateTripSeatInventoryRecordSchema = updateTripSeatInventorySchema;

// coupons
export const selectCouponsSchema = createSelectSchema(schema.coupons);
export const insertCouponsSchema = createInsertSchema(schema.coupons, {
  scope: () => z.enum(COUPON_SCOPES),
  discountType: () => z.enum(COUPON_DISCOUNT_TYPES),
  currencyCode: () => z.enum(CURRENCY_CODES),
  status: () => z.enum(COUPON_STATUSES),
});
export const updateCouponsSchema = createUpdateSchema(schema.coupons, {
  scope: () => z.enum(COUPON_SCOPES),
  discountType: () => z.enum(COUPON_DISCOUNT_TYPES),
  currencyCode: () => z.enum(CURRENCY_CODES),
  status: () => z.enum(COUPON_STATUSES),
});
export const selectCouponSchema = selectCouponsSchema;
export const insertCouponSchema = insertCouponsSchema;
export const updateCouponSchema = updateCouponsSchema;

// ============================================================================
// 9. Settings and Roles Schemas (6 tables)
// ============================================================================

// systemSettings
export const selectSystemSettingsSchema = createSelectSchema(schema.systemSettings);
export const insertSystemSettingsSchema = createInsertSchema(schema.systemSettings, {
  markets: () => z.record(z.string(), z.unknown()),
  operational: () => z.record(z.string(), z.unknown()),
  refundPolicyTiers: () =>
    z.array(
      z.object({
        minHoursBeforeDeparture: z.number(),
        refundPercent: z.number(),
      }),
    ),
  notifications: () => z.record(z.string(), z.unknown()),
  maintenanceAndSupport: () => z.record(z.string(), z.unknown()),
  featureFlags: () => z.record(z.string(), z.unknown()),
});
export const updateSystemSettingsSchema = createUpdateSchema(schema.systemSettings, {
  markets: () => z.record(z.string(), z.unknown()),
  operational: () => z.record(z.string(), z.unknown()),
  refundPolicyTiers: () =>
    z.array(
      z.object({
        minHoursBeforeDeparture: z.number(),
        refundPercent: z.number(),
      }),
    ),
  notifications: () => z.record(z.string(), z.unknown()),
  maintenanceAndSupport: () => z.record(z.string(), z.unknown()),
  featureFlags: () => z.record(z.string(), z.unknown()),
});
export const selectSystemSettingSchema = selectSystemSettingsSchema;
export const insertSystemSettingSchema = insertSystemSettingsSchema;
export const updateSystemSettingSchema = updateSystemSettingsSchema;

// authSettings
export const selectAuthSettingsSchema = createSelectSchema(schema.authSettings);
export const insertAuthSettingsSchema = createInsertSchema(schema.authSettings, {
  newDeviceAlertRoles: () => z.array(z.enum(USER_ROLES)),
  roleAuthPolicies: () => z.record(z.string(), z.unknown()),
});
export const updateAuthSettingsSchema = createUpdateSchema(schema.authSettings, {
  newDeviceAlertRoles: () => z.array(z.enum(USER_ROLES)),
  roleAuthPolicies: () => z.record(z.string(), z.unknown()),
});
export const selectAuthSettingSchema = selectAuthSettingsSchema;
export const insertAuthSettingSchema = insertAuthSettingsSchema;
export const updateAuthSettingSchema = updateAuthSettingsSchema;

// roleDefinitions
export const selectRoleDefinitionsSchema = createSelectSchema(schema.roleDefinitions);
export const insertRoleDefinitionsSchema = createInsertSchema(schema.roleDefinitions, {
  role: () => z.enum(USER_ROLES),
  allowedSurfaces: () => z.array(z.enum(CLIENT_SURFACES)),
  requiredVerificationChannels: () => z.enum(VERIFICATION_CHANNEL_RULES),
  allowedPrimaryMethods: () => z.array(z.enum(PRIMARY_SIGN_IN_METHODS)),
  requiredSecondFactor: () => z.enum(SECOND_FACTOR_RULES),
  planScope: () => z.enum(PLAN_SCOPES),
  subRoles: () => z.array(z.record(z.string(), z.unknown())),
});
export const updateRoleDefinitionsSchema = createUpdateSchema(schema.roleDefinitions, {
  role: () => z.enum(USER_ROLES),
  allowedSurfaces: () => z.array(z.enum(CLIENT_SURFACES)),
  requiredVerificationChannels: () => z.enum(VERIFICATION_CHANNEL_RULES),
  allowedPrimaryMethods: () => z.array(z.enum(PRIMARY_SIGN_IN_METHODS)),
  requiredSecondFactor: () => z.enum(SECOND_FACTOR_RULES),
  planScope: () => z.enum(PLAN_SCOPES),
  subRoles: () => z.array(z.record(z.string(), z.unknown())),
});
export const selectRoleDefinitionSchema = selectRoleDefinitionsSchema;
export const insertRoleDefinitionSchema = insertRoleDefinitionsSchema;
export const updateRoleDefinitionSchema = updateRoleDefinitionsSchema;

// permissionCatalog
export const selectPermissionCatalogSchema = createSelectSchema(schema.permissionCatalog);
export const insertPermissionCatalogSchema = createInsertSchema(schema.permissionCatalog, {
  area: () => z.enum(ORG_PERMISSION_AREAS),
  allowedLevels: () => z.array(z.enum(ORG_PERMISSION_LEVELS)),
  mappedScreens: () => z.array(z.string()),
});
export const updatePermissionCatalogSchema = createUpdateSchema(schema.permissionCatalog, {
  area: () => z.enum(ORG_PERMISSION_AREAS),
  allowedLevels: () => z.array(z.enum(ORG_PERMISSION_LEVELS)),
  mappedScreens: () => z.array(z.string()),
});
export const selectPermissionCatalogItemSchema = selectPermissionCatalogSchema;
export const insertPermissionCatalogItemSchema = insertPermissionCatalogSchema;
export const updatePermissionCatalogItemSchema = updatePermissionCatalogSchema;

// planCatalog
export const selectPlanCatalogSchema = createSelectSchema(schema.planCatalog);
export const insertPlanCatalogSchema = createInsertSchema(schema.planCatalog, {
  role: () => z.enum(SUBSCRIPTION_ROLES),
  currencyCode: () => z.enum(CURRENCY_CODES),
  limits: () => z.record(z.string(), z.unknown()),
  features: () => z.record(z.string(), z.unknown()),
  status: () => z.enum(PLAN_CATALOG_STATUSES),
});
export const updatePlanCatalogSchema = createUpdateSchema(schema.planCatalog, {
  role: () => z.enum(SUBSCRIPTION_ROLES),
  currencyCode: () => z.enum(CURRENCY_CODES),
  limits: () => z.record(z.string(), z.unknown()),
  features: () => z.record(z.string(), z.unknown()),
  status: () => z.enum(PLAN_CATALOG_STATUSES),
});
export const selectPlanCatalogEntrySchema = selectPlanCatalogSchema;
export const insertPlanCatalogEntrySchema = insertPlanCatalogSchema;
export const updatePlanCatalogEntrySchema = updatePlanCatalogSchema;

// organizationSettings
export const selectOrganizationSettingsSchema = createSelectSchema(schema.organizationSettings);
export const insertOrganizationSettingsSchema = createInsertSchema(schema.organizationSettings, {
  defaultLanguage: () => z.enum(SUPPORTED_LOCALES),
  defaultCurrency: () => z.enum(CURRENCY_CODES),
  invoiceLanguage: () => z.enum(SUPPORTED_LOCALES),
  webhookEndpoints: () => z.array(z.record(z.string(), z.unknown())),
});
export const updateOrganizationSettingsSchema = createUpdateSchema(schema.organizationSettings, {
  defaultLanguage: () => z.enum(SUPPORTED_LOCALES),
  defaultCurrency: () => z.enum(CURRENCY_CODES),
  invoiceLanguage: () => z.enum(SUPPORTED_LOCALES),
  webhookEndpoints: () => z.array(z.record(z.string(), z.unknown())),
});
export const selectOrganizationSettingSchema = selectOrganizationSettingsSchema;
export const insertOrganizationSettingSchema = insertOrganizationSettingsSchema;
export const updateOrganizationSettingSchema = updateOrganizationSettingsSchema;

// ============================================================================
// 10. Trips Schemas (2 tables)
// ============================================================================

// trips
export const selectTripsSchema = createSelectSchema(schema.trips);
export const insertTripsSchema = createInsertSchema(schema.trips, {
  language: () => z.enum(SUPPORTED_LOCALES),
  currencyCode: () => z.enum(CURRENCY_CODES),
  seatAssignmentMode: () => z.enum(TRIP_SEAT_ASSIGNMENT_MODES),
  state: () => z.enum(TRIP_STATES),
  publishMode: () => z.enum(TRIP_PUBLISH_MODES),
  galleryImageUrls: () => z.array(z.string().trim().min(1)),
  origin: () => tripRoutePointSchema,
  destinations: () => z.array(tripRoutePointSchema),
  targetedAudienceIds: () => z.array(z.string().trim().min(1)),
  wizardSteps: () => tripWizardStepsSchema,
});
export const updateTripsSchema = createUpdateSchema(schema.trips, {
  language: () => z.enum(SUPPORTED_LOCALES),
  currencyCode: () => z.enum(CURRENCY_CODES),
  seatAssignmentMode: () => z.enum(TRIP_SEAT_ASSIGNMENT_MODES),
  state: () => z.enum(TRIP_STATES),
  publishMode: () => z.enum(TRIP_PUBLISH_MODES),
  galleryImageUrls: () => z.array(z.string().trim().min(1)),
  origin: () => tripRoutePointSchema,
  destinations: () => z.array(tripRoutePointSchema),
  targetedAudienceIds: () => z.array(z.string().trim().min(1)),
  wizardSteps: () => tripWizardStepsSchema,
});
export const selectTripSchema = selectTripsSchema;
export const insertTripSchema = insertTripsSchema;
export const updateTripSchema = updateTripsSchema;

// tripVehicles
export const selectTripVehiclesSchema = createSelectSchema(schema.tripVehicles);
export const insertTripVehiclesSchema = createInsertSchema(schema.tripVehicles, {
  seatLayoutSnapshot: () => seatLayoutConfigSchema,
  driverSource: () => z.enum(TRIP_STAFF_SOURCES),
  moderatorSource: () => z.enum(TRIP_STAFF_SOURCES),
  photographerSource: () => z.enum(TRIP_STAFF_SOURCES),
});
export const updateTripVehiclesSchema = createUpdateSchema(schema.tripVehicles, {
  seatLayoutSnapshot: () => seatLayoutConfigSchema,
  driverSource: () => z.enum(TRIP_STAFF_SOURCES),
  moderatorSource: () => z.enum(TRIP_STAFF_SOURCES),
  photographerSource: () => z.enum(TRIP_STAFF_SOURCES),
});
export const selectTripVehicleSchema = selectTripVehiclesSchema;
export const insertTripVehicleSchema = insertTripVehiclesSchema;
export const updateTripVehicleSchema = updateTripVehiclesSchema;
