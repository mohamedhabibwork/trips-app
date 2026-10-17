import type { ApplicationState, SupplierApplicationType } from "@trips-app/domain";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { accounts, organizations } from "./auth";

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicantAccountId: uuid("applicant_account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    applicationType: text("application_type").$type<SupplierApplicationType>().notNull(),
    state: text("state").$type<ApplicationState>().default("Pending Review").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    slaDueAt: timestamp("sla_due_at", { withTimezone: true }).notNull(),
    assignedAdminAccountId: uuid("assigned_admin_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    reviewedByAdminAccountId: uuid("reviewed_by_admin_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    decisionReasonCode: text("decision_reason_code"),
    decisionNotes: text("decision_notes"),
    changesRequestedChecklist: jsonb("changes_requested_checklist").$type<
      { field: string; instruction: string; resolved?: boolean }[]
    >(),
    changesDueAt: timestamp("changes_due_at", { withTimezone: true }),
    changesExtensionUsed: boolean("changes_extension_used").default(false).notNull(),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    reapplyBlockedUntil: timestamp("reapply_blocked_until", { withTimezone: true }),
    appealStatement: text("appeal_statement"),
    appealedAt: timestamp("appealed_at", { withTimezone: true }),
    appealDecidedByAdminAccountId: uuid("appeal_decided_by_admin_account_id").references(
      () => accounts.id,
      { onDelete: "set null" },
    ),
    appealDecidedAt: timestamp("appeal_decided_at", { withTimezone: true }),
    provisionedOrganizationId: uuid("provisioned_organization_id").references(
      () => organizations.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("applications_applicant_idx").on(table.applicantAccountId),
    index("applications_state_idx").on(table.state),
    index("applications_sla_due_idx").on(table.slaDueAt),
  ],
);

export const applicationDocuments = pgTable(
  "application_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .references(() => applications.id, { onDelete: "cascade" })
      .notNull(),
    documentType: text("document_type").notNull(),
    storageKey: text("storage_key").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    verifiedStatus: text("verified_status")
      .$type<"pending" | "verified" | "rejected">()
      .default("pending")
      .notNull(),
    rejectionNote: text("rejection_note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("application_documents_app_idx").on(table.applicationId)],
);

export const consentRecords = pgTable(
  "consent_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    consentType: text("consent_type")
      .$type<
        | "driver_lab_test"
        | "driver_background_check"
        | "child_tracking_guardian"
        | "terms_of_service"
        | "privacy_policy"
      >()
      .notNull(),
    documentVersion: text("document_version").default("1.0").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    signedAt: timestamp("signed_at", { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [index("consent_records_account_idx").on(table.accountId)],
);

export const driverProfiles = pgTable(
  "driver_profiles",
  {
    accountId: uuid("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .primaryKey(),
    scope: text("scope").$type<"platform" | "organization">().default("platform").notNull(),
    owningTenantId: uuid("owning_tenant_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    nationalIdEncrypted: text("national_id_encrypted").notNull(),
    licenseNumberEncrypted: text("license_number_encrypted").notNull(),
    licenseCategory: text("license_category").notNull(),
    licenseExpiry: timestamp("license_expiry", { withTimezone: true }).notNull(),
    yearsOfExperience: integer("years_of_experience").default(1).notNull(),
    serviceAreas: jsonb("service_areas").$type<string[]>().default([]).notNull(),
    hasOwnVehicle: boolean("has_own_vehicle").default(false).notNull(),
    vehicleMakeModel: text("vehicle_make_model"),
    vehicleYear: integer("vehicle_year"),
    vehiclePlateNumber: text("vehicle_plate_number"),
    vehicleSeatCapacity: integer("vehicle_seat_capacity"),
    insurancePolicyNumber: text("insurance_policy_number"),
    insuranceExpiry: timestamp("insurance_expiry", { withTimezone: true }),
    labTestConsentId: uuid("lab_test_consent_id").references(() => consentRecords.id, {
      onDelete: "set null",
    }),
    lastLabResultValidUntil: timestamp("last_lab_result_valid_until", { withTimezone: true }),
    activeLabPauseReason: text("active_lab_pause_reason"),
    planTier: text("plan_tier")
      .$type<"basic" | "professional" | "premium" | null>()
      .default("basic"),
    status: text("status")
      .$type<"pending_approval" | "active" | "paused_lab_test" | "suspended">()
      .default("active")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("driver_profiles_tenant_idx").on(table.owningTenantId)],
);

export const photographerProfiles = pgTable(
  "photographer_profiles",
  {
    accountId: uuid("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .primaryKey(),
    scope: text("scope").$type<"platform" | "organization">().default("platform").notNull(),
    owningTenantId: uuid("owning_tenant_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    nationalIdEncrypted: text("national_id_encrypted").notNull(),
    yearsOfExperience: integer("years_of_experience").default(1).notNull(),
    cameraBodies: jsonb("camera_bodies").$type<string[]>().default([]).notNull(),
    lenses: jsonb("lenses").$type<string[]>().default([]).notNull(),
    hasDroneLicense: boolean("has_drone_license").default(false).notNull(),
    serviceRegions: jsonb("service_regions").$type<string[]>().default([]).notNull(),
    specialties: jsonb("specialties").$type<string[]>().default([]).notNull(),
    portfolioPhotoCount: integer("portfolio_photo_count").default(8).notNull(),
    sampleAlbums: jsonb("sample_albums")
      .$type<{ title: string; photoCount: number }[]>()
      .default([])
      .notNull(),
    planTier: text("plan_tier").$type<"basic" | "studio" | "pro" | null>().default("basic"),
    status: text("status")
      .$type<"pending_approval" | "active" | "suspended">()
      .default("active")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("photographer_profiles_tenant_idx").on(table.owningTenantId)],
);
