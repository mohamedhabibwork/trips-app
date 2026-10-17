// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { and, type Database, desc, eq, lte, schema } from "@trips-app/db";

import type {
  ApplicationState,
  OrganizationSettingsData,
  SupplierApplicationType,
  SupportedCountryCode,
  UserRole,
} from "../model";

export type { Database as ServiceDatabase } from "@trips-app/db";

const {
  accountRoles,
  accounts,
  applicationDocuments,
  applications,
  auditLogs,
  consentRecords,
  driverProfiles,
  organizationSettings,
  organizations,
  photographerProfiles,
} = schema;

export function createOnboardingRepository(db: Database) {
  return {
    async findAccountById(id: string) {
      const [row] = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
      return row ?? null;
    },

    async findAccountByPhoneBlindIndex(phoneBlindIndex: string) {
      const [row] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.phoneBlindIndex, phoneBlindIndex))
        .limit(1);
      return row ?? null;
    },

    async createSupplierAccount(values: {
      emailNormalized?: string | null;
      emailBlindIndex?: string | null;
      emailEncrypted?: string | null;
      phoneE164: string;
      phoneBlindIndex: string;
      phoneEncrypted: string;
      passwordHash?: string | null;
      fullName: string;
    }) {
      const now = new Date();
      const [created] = await db
        .insert(accounts)
        .values({
          emailNormalized: values.emailNormalized ?? null,
          emailBlindIndex: values.emailBlindIndex ?? null,
          emailEncrypted: values.emailEncrypted ?? null,
          phoneE164: values.phoneE164,
          phoneBlindIndex: values.phoneBlindIndex,
          phoneEncrypted: values.phoneEncrypted,
          phoneVerifiedAt: now,
          passwordHash: values.passwordHash ?? null,
          passwordChangedAt: values.passwordHash ? now : null,
          preferredSignInMethod: values.passwordHash ? "password" : "otp",
          fullName: values.fullName,
          preferredLanguage: "ar",
          status: "active",
        })
        .returning();
      return created!;
    },

    async findLatestApplicationForApplicant(
      applicantAccountId: string,
      applicationType?: SupplierApplicationType,
    ) {
      const rows = await db
        .select()
        .from(applications)
        .where(eq(applications.applicantAccountId, applicantAccountId))
        .orderBy(desc(applications.createdAt));

      if (applicationType) {
        return rows.find((r) => r.applicationType === applicationType) ?? null;
      }
      return rows[0] ?? null;
    },

    async findApplicationById(id: string) {
      const [row] = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
      return row ?? null;
    },

    async listApplications(filter?: {
      state?: ApplicationState;
      applicationType?: SupplierApplicationType;
      overdueOnly?: boolean;
      now?: Date;
    }) {
      const rows = await db.select().from(applications).orderBy(desc(applications.createdAt));

      return rows.filter((row) => {
        if (filter?.state && row.state !== filter.state) return false;
        if (filter?.applicationType && row.applicationType !== filter.applicationType) return false;
        if (filter?.overdueOnly) {
          const refNow = filter.now ?? new Date();
          return row.state === "Pending Review" && row.slaDueAt.getTime() < refNow.getTime();
        }
        return true;
      });
    },

    async createApplication(values: {
      applicantAccountId: string;
      applicationType: SupplierApplicationType;
      state: ApplicationState;
      payload: Record<string, unknown>;
      slaDueAt: Date;
    }) {
      const [created] = await db.insert(applications).values(values).returning();
      return created!;
    },

    async updateApplication(
      id: string,
      patch: Partial<{
        state: ApplicationState;
        payload: Record<string, unknown>;
        slaDueAt: Date;
        reviewedByAdminAccountId: string | null;
        reviewedAt: Date | null;
        decisionReasonCode: string | null;
        decisionNotes: string | null;
        changesRequestedChecklist:
          | { field: string; instruction: string; resolved?: boolean }[]
          | null;
        changesDueAt: Date | null;
        changesExtensionUsed: boolean;
        rejectedAt: Date | null;
        reapplyBlockedUntil: Date | null;
        appealStatement: string | null;
        appealedAt: Date | null;
        appealDecidedByAdminAccountId: string | null;
        appealDecidedAt: Date | null;
        provisionedOrganizationId: string | null;
      }>,
    ) {
      const [updated] = await db
        .update(applications)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(applications.id, id))
        .returning();
      return updated ?? null;
    },

    async insertApplicationDocuments(
      applicationId: string,
      docs: {
        documentType: string;
        storageKey: string;
        mimeType: string;
        fileSizeBytes: number;
        expiresAt?: string;
      }[],
    ) {
      if (docs.length === 0) return [];
      return db
        .insert(applicationDocuments)
        .values(
          docs.map((d) => ({
            applicationId,
            documentType: d.documentType,
            storageKey: d.storageKey,
            mimeType: d.mimeType,
            fileSizeBytes: d.fileSizeBytes,
            expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
          })),
        )
        .returning();
    },

    async listDocumentsForApplication(applicationId: string) {
      return db
        .select()
        .from(applicationDocuments)
        .where(eq(applicationDocuments.applicationId, applicationId));
    },

    async createConsentRecord(values: {
      accountId: string;
      consentType:
        | "driver_lab_test"
        | "child_tracking_guardian"
        | "terms_of_service"
        | "privacy_policy";
      ipAddress?: string | null;
      userAgent?: string | null;
    }) {
      const [created] = await db
        .insert(consentRecords)
        .values({
          accountId: values.accountId,
          consentType: values.consentType,
          ipAddress: values.ipAddress ?? null,
          userAgent: values.userAgent ?? null,
        })
        .returning();
      return created!;
    },

    async createOrganizationAndSettings(params: {
      id: string;
      ownerAccountId: string;
      legalEntityName: string;
      displayNameEn: string;
      displayNameAr: string;
      commercialRegNumberEncrypted: string;
      taxNumberEncrypted: string;
      tourismLicenseNumberEncrypted: string;
      tourismLicenseExpiry: Date;
      countryCode: SupportedCountryCode;
      headquartersAddress: string;
      signatoryFullName: string;
      signatoryNationalIdEncrypted: string;
      signatoryRoleTitle: string;
      payoutMethod: "bank_transfer" | "mobile_wallet";
      payoutIbanEncrypted: string;
      childSafetyOptIn: boolean;
      defaultSettings: Omit<OrganizationSettingsData, "tenantId">;
    }) {
      const [org] = await db
        .insert(organizations)
        .values({
          id: params.id,
          ownerAccountId: params.ownerAccountId,
          legalEntityName: params.legalEntityName,
          displayNameEn: params.displayNameEn,
          displayNameAr: params.displayNameAr,
          commercialRegNumberEncrypted: params.commercialRegNumberEncrypted,
          taxNumberEncrypted: params.taxNumberEncrypted,
          tourismLicenseNumberEncrypted: params.tourismLicenseNumberEncrypted,
          tourismLicenseExpiry: params.tourismLicenseExpiry,
          countryCode: params.countryCode,
          headquartersAddress: params.headquartersAddress,
          signatoryFullName: params.signatoryFullName,
          signatoryNationalIdEncrypted: params.signatoryNationalIdEncrypted,
          signatoryRoleTitle: params.signatoryRoleTitle,
          payoutMethod: params.payoutMethod,
          payoutIbanEncrypted: params.payoutIbanEncrypted,
          planTier: "starter",
          status: "active",
          childSafetyOptIn: params.childSafetyOptIn,
        })
        .returning();

      const [settings] = await db
        .insert(organizationSettings)
        .values({
          ...params.defaultSettings,
          tenantId: org!.id,
          updatedByAccountId: params.ownerAccountId,
        })
        .returning();

      return { organization: org!, settings: settings! };
    },

    async upsertDriverProfile(values: {
      accountId: string;
      scope: "platform" | "organization";
      owningTenantId?: string | null;
      nationalIdEncrypted: string;
      licenseNumberEncrypted: string;
      licenseCategory: string;
      licenseExpiry: Date;
      yearsOfExperience: number;
      serviceAreas: string[];
      hasOwnVehicle: boolean;
      vehicleMakeModel?: string | null;
      vehicleYear?: number | null;
      vehiclePlateNumber?: string | null;
      vehicleSeatCapacity?: number | null;
      insurancePolicyNumber?: string | null;
      insuranceExpiry?: Date | null;
      labTestConsentId?: string | null;
      planTier: "basic" | "professional" | "premium" | null;
      status: "pending_approval" | "active" | "paused_lab_test" | "suspended";
    }) {
      const now = new Date();
      const [row] = await db
        .insert(driverProfiles)
        .values({
          ...values,
          owningTenantId: values.owningTenantId ?? null,
          vehicleMakeModel: values.vehicleMakeModel ?? null,
          vehicleYear: values.vehicleYear ?? null,
          vehiclePlateNumber: values.vehiclePlateNumber ?? null,
          vehicleSeatCapacity: values.vehicleSeatCapacity ?? null,
          insurancePolicyNumber: values.insurancePolicyNumber ?? null,
          insuranceExpiry: values.insuranceExpiry ?? null,
          labTestConsentId: values.labTestConsentId ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: driverProfiles.accountId,
          set: {
            ...values,
            updatedAt: now,
          },
        })
        .returning();
      return row!;
    },

    async upsertPhotographerProfile(values: {
      accountId: string;
      scope: "platform" | "organization";
      owningTenantId?: string | null;
      nationalIdEncrypted: string;
      yearsOfExperience: number;
      cameraBodies: string[];
      lenses: string[];
      hasDroneLicense: boolean;
      serviceRegions: string[];
      specialties: string[];
      portfolioPhotoCount: number;
      sampleAlbums: { title: string; photoCount: number }[];
      planTier: "basic" | "studio" | "pro" | null;
      status: "pending_approval" | "active" | "suspended";
    }) {
      const now = new Date();
      const [row] = await db
        .insert(photographerProfiles)
        .values({
          ...values,
          owningTenantId: values.owningTenantId ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: photographerProfiles.accountId,
          set: {
            ...values,
            updatedAt: now,
          },
        })
        .returning();
      return row!;
    },

    async upsertAccountRole(values: {
      accountId: string;
      role: UserRole;
      tenantId?: string | null;
      planTier?: string | null;
      status: "pending_approval" | "active" | "paused" | "suspended" | "revoked";
      approvedAt?: Date | null;
    }) {
      const existing = await db
        .select()
        .from(accountRoles)
        .where(
          and(eq(accountRoles.accountId, values.accountId), eq(accountRoles.role, values.role)),
        );

      if (existing[0]) {
        const [updated] = await db
          .update(accountRoles)
          .set({
            tenantId: values.tenantId ?? existing[0].tenantId,
            planTier: values.planTier ?? existing[0].planTier,
            status: values.status,
            approvedAt: values.approvedAt ?? existing[0].approvedAt,
            updatedAt: new Date(),
          })
          .where(eq(accountRoles.id, existing[0].id))
          .returning();
        return updated!;
      }

      const [created] = await db
        .insert(accountRoles)
        .values({
          accountId: values.accountId,
          role: values.role,
          tenantId: values.tenantId ?? null,
          planTier: values.planTier ?? null,
          status: values.status,
          approvedAt: values.approvedAt ?? null,
        })
        .returning();
      return created!;
    },

    async findExpiredChangesApplications(now: Date) {
      return db
        .select()
        .from(applications)
        .where(
          and(eq(applications.state, "Changes Requested"), lte(applications.changesDueAt, now)),
        );
    },

    async writeAuditLog(entry: {
      actorAccountId: string;
      actorRole: UserRole | "system";
      tenantId?: string | null;
      action: string;
      targetEntityType: string;
      targetEntityId: string;
      reason?: string | null;
      beforeState?: Record<string, unknown> | null;
      afterState?: Record<string, unknown> | null;
      ipAddress?: string | null;
      requestId?: string | null;
    }) {
      const [created] = await db
        .insert(auditLogs)
        .values({
          actorAccountId: entry.actorAccountId,
          actorRole: entry.actorRole,
          tenantId: entry.tenantId ?? null,
          action: entry.action,
          targetEntityType: entry.targetEntityType,
          targetEntityId: entry.targetEntityId,
          reason: entry.reason ?? null,
          beforeState: entry.beforeState ?? null,
          afterState: entry.afterState ?? null,
          ipAddress: entry.ipAddress ?? null,
          requestId: entry.requestId ?? null,
        })
        .returning();
      return created!;
    },
  };
}
