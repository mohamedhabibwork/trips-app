import type {
  AdminSubRoleMetadata,
  ClientSurface,
  CurrencyCode,
  MarketSetting,
  OrganizationWebhookEndpoint,
  OrgPermissionArea,
  OrgPermissionLevel,
  PlanFeatures,
  PlanLimits,
  PlanScope,
  PrimarySignInMethod,
  RefundPolicyTier,
  RoleAuthPolicy,
  SecondFactorRule,
  SupportedCountryCode,
  SupportedLocale,
  SystemFeatureFlags,
  SystemMaintenanceSettings,
  SystemNotificationSettings,
  SystemOperationalSettings,
  UserRole,
  VerificationChannelRule,
} from "@trips-app/domain";
import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { accounts, organizations } from "./auth";

export const systemSettings = pgTable("system_settings", {
  id: text("id").default("default").primaryKey(),
  markets: jsonb("markets").$type<Record<SupportedCountryCode, MarketSetting>>().notNull(),
  operational: jsonb("operational").$type<SystemOperationalSettings>().notNull(),
  refundPolicyTiers: jsonb("refund_policy_tiers").$type<readonly RefundPolicyTier[]>().notNull(),
  notifications: jsonb("notifications").$type<SystemNotificationSettings>().notNull(),
  maintenanceAndSupport: jsonb("maintenance_and_support")
    .$type<SystemMaintenanceSettings>()
    .notNull(),
  featureFlags: jsonb("feature_flags").$type<SystemFeatureFlags>().notNull(),
  updatedByAccountId: uuid("updated_by_account_id").references(() => accounts.id, {
    onDelete: "set null",
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const authSettings = pgTable("auth_settings", {
  id: text("id").default("default").primaryKey(),
  otpExpirySeconds: integer("otp_expiry_seconds").default(300).notNull(),
  otpResendCooldownSeconds: integer("otp_resend_cooldown_seconds").default(45).notNull(),
  otpMaxWrongAttempts: integer("otp_max_wrong_attempts").default(5).notNull(),
  otpPauseDurationSeconds: integer("otp_pause_duration_seconds").default(900).notNull(),
  otpDeliveryMaxRetries: integer("otp_delivery_max_retries").default(3).notNull(),
  otpFallbackChannelEnabled: boolean("otp_fallback_channel_enabled").default(true).notNull(),
  maxFailedSignInAttempts: integer("max_failed_sign_in_attempts").default(5).notNull(),
  lockoutDurationSeconds: integer("lockout_duration_seconds").default(900).notNull(),
  passwordMinLength: integer("password_min_length").default(12).notNull(),
  breachedPasswordCheckEnabled: boolean("breached_password_check_enabled").default(true).notNull(),
  passwordHashAlgorithm: text("password_hash_algorithm")
    .$type<"argon2id">()
    .default("argon2id")
    .notNull(),
  accessTokenTtlSeconds: integer("access_token_ttl_seconds").default(900).notNull(),
  webSessionMaxSeconds: integer("web_session_max_seconds").default(43200).notNull(),
  rotateRefreshTokens: boolean("rotate_refresh_tokens").default(true).notNull(),
  retainDraftsOnSessionExpiry: boolean("retain_drafts_on_session_expiry").default(true).notNull(),
  deletionGraceDays: integer("deletion_grace_days").default(30).notNull(),
  adminInviteTtlHours: integer("admin_invite_ttl_hours").default(72).notNull(),
  employeeInviteTtlDays: integer("employee_invite_ttl_days").default(7).notNull(),
  orgSupplierInviteTtlDays: integer("org_supplier_invite_ttl_days").default(7).notNull(),
  moderatorCodePostTripHours: integer("moderator_code_post_trip_hours").default(24).notNull(),
  newDeviceAlertRoles: jsonb("new_device_alert_roles").$type<readonly UserRole[]>().notNull(),
  roleAuthPolicies: jsonb("role_auth_policies").$type<Record<UserRole, RoleAuthPolicy>>().notNull(),
  updatedByAccountId: uuid("updated_by_account_id").references(() => accounts.id, {
    onDelete: "set null",
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const roleDefinitions = pgTable("role_definitions", {
  role: text("role").$type<UserRole>().primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionAr: text("description_ar").notNull(),
  selfRegistrationAllowed: boolean("self_registration_allowed").default(false).notNull(),
  allowedSurfaces: jsonb("allowed_surfaces").$type<readonly ClientSurface[]>().notNull(),
  requiredVerificationChannels: text("required_verification_channels")
    .$type<VerificationChannelRule>()
    .notNull(),
  allowedPrimaryMethods: jsonb("allowed_primary_methods")
    .$type<readonly PrimarySignInMethod[]>()
    .notNull(),
  requiredSecondFactor: text("required_second_factor").$type<SecondFactorRule>().notNull(),
  requiresApproval: boolean("requires_approval").default(false).notNull(),
  planScope: text("plan_scope").$type<PlanScope>().notNull(),
  defaultPlanTier: text("default_plan_tier"),
  rateLimitPerMinute: integer("rate_limit_per_minute").default(60).notNull(),
  subRoles: jsonb("sub_roles").$type<readonly AdminSubRoleMetadata[]>().default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const permissionCatalog = pgTable("permission_catalog", {
  area: text("area").$type<OrgPermissionArea>().primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionAr: text("description_ar").notNull(),
  allowedLevels: jsonb("allowed_levels").$type<readonly OrgPermissionLevel[]>().notNull(),
  mappedScreens: jsonb("mapped_screens").$type<readonly string[]>().notNull(),
  ownerOnlyByDefault: boolean("owner_only_by_default").default(false).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const planCatalog = pgTable("plan_catalog", {
  id: text("id").primaryKey(),
  role: text("role")
    .$type<"traveler" | "organization" | "platform_driver" | "platform_photographer">()
    .notNull(),
  tier: text("tier").notNull(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  monthlyPriceMinor: integer("monthly_price_minor").default(0).notNull(),
  annualPriceMinor: integer("annual_price_minor").default(0).notNull(),
  currencyCode: text("currency_code").$type<CurrencyCode>().default("EGP").notNull(),
  annualDiscountBps: integer("annual_discount_bps").default(1500).notNull(),
  trialDays: integer("trial_days").default(0).notNull(),
  gracePeriodDays: integer("grace_period_days").default(7).notNull(),
  limits: jsonb("limits").$type<PlanLimits>().notNull(),
  features: jsonb("features").$type<PlanFeatures>().notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  status: text("status").$type<"active" | "retired">().default("active").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const organizationSettings = pgTable("organization_settings", {
  tenantId: uuid("tenant_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .primaryKey(),
  timeZone: text("time_zone").default("Africa/Cairo").notNull(),
  defaultLanguage: text("default_language").$type<SupportedLocale>().default("ar").notNull(),
  defaultCurrency: text("default_currency").$type<CurrencyCode>().default("EGP").notNull(),
  seatSelfSelectionEnabled: boolean("seat_self_selection_enabled").default(false).notNull(),
  seatPriorityWindowMinutes: integer("seat_priority_window_minutes").default(60).notNull(),
  childTrackingEnabledByDefault: boolean("child_tracking_enabled_by_default")
    .default(false)
    .notNull(),
  operationsContactPhone: text("operations_contact_phone"),
  operationsContactEmail: text("operations_contact_email"),
  safetyLeadName: text("safety_lead_name"),
  safetyHotlinePhone: text("safety_hotline_phone"),
  billingContactName: text("billing_contact_name"),
  billingContactEmail: text("billing_contact_email"),
  billingContactPhone: text("billing_contact_phone"),
  billingAddress: text("billing_address"),
  invoiceLanguage: text("invoice_language").$type<SupportedLocale>().default("ar").notNull(),
  taxNumber: text("tax_number"),
  b2bInvoicingEnabled: boolean("b2b_invoicing_enabled").default(true).notNull(),
  customBrandingEnabled: boolean("custom_branding_enabled").default(false).notNull(),
  logoUrl: text("logo_url"),
  primaryColorHex: text("primary_color_hex"),
  secondaryColorHex: text("secondary_color_hex"),
  crmProvider: text("crm_provider"),
  webhookEndpoints: jsonb("webhook_endpoints")
    .$type<readonly OrganizationWebhookEndpoint[]>()
    .default([])
    .notNull(),
  updatedByAccountId: uuid("updated_by_account_id").references(() => accounts.id, {
    onDelete: "set null",
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
