import type {
  AccountRoleStatus,
  AccountStatus,
  AdminSubRole,
  ClientSurface,
  OrgPermissionMatrix,
  OtpChannel,
  OtpPurpose,
  PrimarySignInMethod,
  PrivacyRequestStatus,
  PrivacyRequestType,
  SupportedCountryCode,
  SupportedLocale,
  TravelerPlanCode,
  UserRole,
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
  varchar,
} from "drizzle-orm/pg-core";

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    emailNormalized: text("email_normalized"),
    emailBlindIndex: text("email_blind_index"),
    emailEncrypted: text("email_encrypted"),
    phoneE164: text("phone_e164"),
    phoneBlindIndex: text("phone_blind_index"),
    phoneEncrypted: text("phone_encrypted"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
    passwordHash: text("password_hash"),
    passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }),
    preferredSignInMethod: text("preferred_sign_in_method")
      .$type<PrimarySignInMethod>()
      .default("otp")
      .notNull(),
    totpSecretEncrypted: text("totp_secret_encrypted"),
    totpEnabledAt: timestamp("totp_enabled_at", { withTimezone: true }),
    staffSecondFactorMethod: text("staff_second_factor_method").$type<"sms" | "totp" | null>(),
    fullName: text("full_name").notNull(),
    avatarUrl: text("avatar_url"),
    countryCode: text("country_code").$type<SupportedCountryCode>().default("EG").notNull(),
    preferredLanguage: text("preferred_language").$type<SupportedLocale>().default("ar").notNull(),
    travelerPlanTier: text("traveler_plan_tier")
      .$type<TravelerPlanCode>()
      .default("free")
      .notNull(),
    status: text("status").$type<AccountStatus>().default("pending_verification").notNull(),
    failedSignInAttempts: integer("failed_sign_in_attempts").default(0).notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
    suspendedReason: text("suspended_reason"),
    deletionRequestedAt: timestamp("deletion_requested_at", { withTimezone: true }),
    deletionPurgedAt: timestamp("deletion_purged_at", { withTimezone: true }),
    knownDeviceFingerprints: jsonb("known_device_fingerprints")
      .$type<string[]>()
      .default([])
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("accounts_email_blind_idx").on(table.emailBlindIndex),
    uniqueIndex("accounts_phone_blind_idx").on(table.phoneBlindIndex),
    index("accounts_status_idx").on(table.status),
  ],
);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerAccountId: uuid("owner_account_id")
      .references(() => accounts.id, { onDelete: "restrict" })
      .notNull(),
    legalEntityName: text("legal_entity_name").notNull(),
    displayNameEn: text("display_name_en").notNull(),
    displayNameAr: text("display_name_ar").notNull(),
    commercialRegNumberEncrypted: text("commercial_reg_number_encrypted").notNull(),
    taxNumberEncrypted: text("tax_number_encrypted").notNull(),
    tourismLicenseNumberEncrypted: text("tourism_license_number_encrypted").notNull(),
    tourismLicenseExpiry: timestamp("tourism_license_expiry", { withTimezone: true }).notNull(),
    countryCode: text("country_code").$type<SupportedCountryCode>().default("EG").notNull(),
    headquartersAddress: text("headquarters_address").notNull(),
    signatoryFullName: text("signatory_full_name").notNull(),
    signatoryNationalIdEncrypted: text("signatory_national_id_encrypted").notNull(),
    signatoryRoleTitle: text("signatory_role_title").notNull(),
    payoutMethod: text("payout_method")
      .$type<"bank_transfer" | "mobile_wallet">()
      .default("bank_transfer")
      .notNull(),
    payoutIbanEncrypted: text("payout_iban_encrypted").notNull(),
    planTier: text("plan_tier")
      .$type<"starter" | "growth" | "enterprise">()
      .default("starter")
      .notNull(),
    status: text("status")
      .$type<"pending_approval" | "active" | "suspended" | "deleted">()
      .default("active")
      .notNull(),
    childSafetyOptIn: boolean("child_safety_opt_in").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("organizations_owner_idx").on(table.ownerAccountId),
    index("organizations_status_idx").on(table.status),
  ],
);

export const accountRoles = pgTable(
  "account_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role").$type<UserRole>().notNull(),
    adminSubRole: text("admin_sub_role").$type<AdminSubRole | null>(),
    tenantId: uuid("tenant_id").references(() => organizations.id, { onDelete: "cascade" }),
    planTier: text("plan_tier"),
    status: text("status").$type<AccountRoleStatus>().default("active").notNull(),
    pauseReason: text("pause_reason"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("account_roles_account_idx").on(table.accountId),
    index("account_roles_tenant_idx").on(table.tenantId),
  ],
);

export const employeeMemberships = pgTable(
  "employee_memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    accountId: uuid("account_id").references(() => accounts.id, { onDelete: "set null" }),
    invitedEmail: varchar("invited_email", { length: 255 }).notNull(),
    invitedPhone: varchar("invited_phone", { length: 20 }),
    roleTitle: text("role_title").default("Employee").notNull(),
    permissions: jsonb("permissions").$type<OrgPermissionMatrix>().notNull(),
    inviteTokenHash: varchar("invite_token_hash", { length: 255 }).notNull(),
    inviteExpiresAt: timestamp("invite_expires_at", { withTimezone: true }).notNull(),
    status: text("status")
      .$type<"invited" | "active" | "suspended" | "revoked">()
      .default("invited")
      .notNull(),
    firstSignInCompletedAt: timestamp("first_sign_in_completed_at", { withTimezone: true }),
    invitedByAccountId: uuid("invited_by_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("employee_memberships_tenant_idx").on(table.tenantId),
    index("employee_memberships_account_idx").on(table.accountId),
    uniqueIndex("employee_memberships_invite_token_idx").on(table.inviteTokenHash),
  ],
);

export const moderatorAssignments = pgTable(
  "moderator_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    accountId: uuid("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    tripId: uuid("trip_id").notNull(),
    vehicleId: uuid("vehicle_id").notNull(),
    staffCodeHash: text("staff_code_hash").notNull(),
    validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
    validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
    activeDeviceFingerprint: text("active_device_fingerprint"),
    activeSessionId: uuid("active_session_id"),
    status: text("status")
      .$type<"assigned" | "active" | "expired" | "revoked">()
      .default("assigned")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("moderator_assignments_tenant_idx").on(table.tenantId),
    index("moderator_assignments_account_idx").on(table.accountId),
  ],
);

export const adminInvites = pgTable(
  "admin_invites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    emailNormalized: text("email_normalized").notNull(),
    fullName: text("full_name").notNull(),
    subRole: text("sub_role").$type<AdminSubRole>().notNull(),
    inviteTokenHash: text("invite_token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    invitedByAccountId: uuid("invited_by_account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    acceptedByAccountId: uuid("accepted_by_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("admin_invites_token_idx").on(table.inviteTokenHash)],
);

export const otpVerifications = pgTable(
  "otp_verifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id").references(() => accounts.id, { onDelete: "cascade" }),
    targetIdentifier: text("target_identifier").notNull(),
    channel: text("channel").$type<OtpChannel>().notNull(),
    purpose: text("purpose").$type<OtpPurpose>().notNull(),
    codeHash: text("code_hash").notNull(),
    wrongAttempts: integer("wrong_attempts").default(0).notNull(),
    pausedUntil: timestamp("paused_until", { withTimezone: true }),
    resendCount: integer("resend_count").default(0).notNull(),
    lastSentAt: timestamp("last_sent_at", { withTimezone: true }).defaultNow().notNull(),
    deliveryStatus: text("delivery_status")
      .$type<"sent" | "retrying" | "failed_fallback_available">()
      .default("sent")
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("otp_verifications_target_idx").on(table.targetIdentifier, table.purpose),
    index("otp_verifications_account_idx").on(table.accountId),
  ],
);

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    activeRole: text("active_role").$type<UserRole>().notNull(),
    adminSubRole: text("admin_sub_role").$type<AdminSubRole | null>(),
    activeTenantId: uuid("active_tenant_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    moderatorVehicleId: uuid("moderator_vehicle_id"),
    moderatorTripId: uuid("moderator_trip_id"),
    refreshTokenHash: text("refresh_token_hash").notNull(),
    surface: text("surface").$type<ClientSurface>().default("web").notNull(),
    deviceFingerprint: text("device_fingerprint"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    secondFactorVerifiedAt: timestamp("second_factor_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    lastRotatedAt: timestamp("last_rotated_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    maxSessionExpiresAt: timestamp("max_session_expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokedReason: text("revoked_reason"),
  },
  (table) => [
    index("auth_sessions_account_idx").on(table.accountId),
    uniqueIndex("auth_sessions_refresh_token_idx").on(table.refreshTokenHash),
  ],
);

export const notificationPreferences = pgTable("notification_preferences", {
  accountId: uuid("account_id")
    .references(() => accounts.id, { onDelete: "cascade" })
    .primaryKey(),
  bookingsPush: boolean("bookings_push").default(true).notNull(),
  bookingsSms: boolean("bookings_sms").default(true).notNull(),
  bookingsEmail: boolean("bookings_email").default(true).notNull(),
  tripUpdatesPush: boolean("trip_updates_push").default(true).notNull(),
  tripUpdatesSms: boolean("trip_updates_sms").default(true).notNull(),
  tripUpdatesEmail: boolean("trip_updates_email").default(true).notNull(),
  promotionsPush: boolean("promotions_push").default(false).notNull(),
  promotionsSms: boolean("promotions_sms").default(false).notNull(),
  promotionsEmail: boolean("promotions_email").default(false).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorAccountId: uuid("actor_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    actorRole: text("actor_role").$type<UserRole | "system">().notNull(),
    tenantId: uuid("tenant_id").references(() => organizations.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    targetEntityType: text("target_entity_type").notNull(),
    targetEntityId: text("target_entity_id").notNull(),
    reason: text("reason"),
    beforeState: jsonb("before_state").$type<Record<string, unknown> | null>(),
    afterState: jsonb("after_state").$type<Record<string, unknown> | null>(),
    ipAddress: text("ip_address"),
    requestId: text("request_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_actor_idx").on(table.actorAccountId),
    index("audit_logs_tenant_idx").on(table.tenantId),
    index("audit_logs_target_idx").on(table.targetEntityType, table.targetEntityId),
  ],
);

export const idempotencyKeys = pgTable(
  "idempotency_keys",
  {
    key: text("key").primaryKey(),
    actorAccountId: uuid("actor_account_id"),
    procedureName: text("procedure_name").notNull(),
    requestHash: text("request_hash").notNull(),
    responsePayload: jsonb("response_payload").$type<unknown>().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idempotency_keys_expires_idx").on(table.expiresAt)],
);

export const privacyRequests = pgTable(
  "privacy_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    requestType: text("request_type").$type<PrivacyRequestType>().notNull(),
    status: text("status").$type<PrivacyRequestStatus>().default("pending").notNull(),
    reason: text("reason"),
    downloadUrl: text("download_url"),
    scheduledPurgeAt: timestamp("scheduled_purge_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("privacy_requests_account_idx").on(table.accountId),
    index("privacy_requests_status_idx").on(table.status),
  ],
);
