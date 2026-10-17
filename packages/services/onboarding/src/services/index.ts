// Business logic for Onboarding. Routes call this factory with context.db; repositories are created here.
import { randomUUID } from "node:crypto";

import { OnboardingServiceError } from "../errors";
import {
  addWorkingDays,
  type AdminSubRole,
  type ApplicationState,
  canTransitionApplicationState,
  computeBlindIndex,
  countWorkingDaysBetween,
  createDefaultOrganizationSettings,
  encryptField,
  hashPassword,
  isRejectedApplicantBlocked,
  normalizeEmail,
  normalizePhoneE164,
  type SupplierApplicationType,
  type SupportedCountryCode,
  type SupportedLocale,
  type UserRole,
  validateDriverApplication,
  validateOrganizationApplication,
  validatePhotographerApplication,
} from "../model";
import { createOnboardingRepository, type ServiceDatabase } from "../repository";
import type {
  ApproveApplicationInput,
  DecideAppealInput,
  GetApplicationDetailInput,
  GetApplicationStatusInput,
  ListOrganizationSuppliersInput,
  ListReviewQueueInput,
  OnboardOrganizationSupplierInput,
  OpenApplicationDocumentInput,
  RejectApplicationInput,
  RemoveOrganizationSupplierInput,
  RequestApplicationChangesInput,
  RequestChangesExtensionInput,
  ResubmitApplicationInput,
  SubmitAppealInput,
  SubmitDriverApplicationInput,
  SubmitOrganizationApplicationInput,
  SubmitPhotographerApplicationInput,
  VerifyApplicationDocumentInput,
} from "../schemas/dtos";
import type { OnboardingRequestMeta } from "../types";

export function createOnboardingService(db: ServiceDatabase) {
  const repo = createOnboardingRepository(db);

  async function assertNotBlockedByRecentRejection(
    accountId: string,
    applicationType: SupplierApplicationType,
    now: Date,
  ) {
    const prior = await repo.findLatestApplicationForApplicant(accountId, applicationType);
    if (
      prior &&
      isRejectedApplicantBlocked({
        state: prior.state,
        rejectedAt: prior.rejectedAt,
        reapplyBlockedUntil: prior.reapplyBlockedUntil,
        now,
      })
    ) {
      throw new OnboardingServiceError(
        "FORBIDDEN",
        "Applicant is blocked from re-applying for 30 days after rejection unless appealed (FR-ONB-05).",
        {
          applicationId: prior.id,
          reapplyBlockedUntil: prior.reapplyBlockedUntil?.toISOString() ?? null,
        },
      );
    }
  }

  async function dispatchApplicantStatusNotification(params: {
    actorAccountId: string;
    actorRole: UserRole | "system";
    applicantAccountId: string;
    applicationId: string;
    applicationType: SupplierApplicationType;
    nextState: ApplicationState;
    template:
      | "application_submitted"
      | "application_approved"
      | "application_changes_requested"
      | "application_rejected"
      | "application_appealed"
      | "application_closed";
    reasonCode?: string | null;
    notes?: string | null;
    meta?: OnboardingRequestMeta;
  }) {
    await repo.writeAuditLog({
      actorAccountId: params.actorAccountId,
      actorRole: params.actorRole,
      action: "onboarding.notification.dispatched",
      targetEntityType: "account",
      targetEntityId: params.applicantAccountId,
      reason: params.notes ?? params.reasonCode ?? null,
      afterState: {
        applicationId: params.applicationId,
        applicationType: params.applicationType,
        state: params.nextState,
        template: params.template,
        channels: ["email", "sms", "in_app"],
      },
      ipAddress: params.meta?.ipAddress,
      requestId: params.meta?.requestId,
    });
  }

  return {
    // 1. Supplier Submissions (WF-APP-01..03)
    async submitOrganizationApplication(
      actor: { accountId: string },
      input: SubmitOrganizationApplicationInput,
      meta?: OnboardingRequestMeta,
    ) {
      const now = new Date();
      await assertNotBlockedByRecentRejection(actor.accountId, "organization", now);

      const validation = validateOrganizationApplication(
        {
          ...input,
          tourismLicenseExpiry: new Date(input.tourismLicenseExpiry),
          documentTypes: input.documents.map((d) => d.documentType),
        },
        now,
      );

      if (!validation.valid) {
        throw new OnboardingServiceError(
          "VALIDATION_ERROR",
          validation.errors[0]?.message ?? "Invalid organization application.",
          { errors: validation.errors },
        );
      }

      // T-ONB-14: Detect duplicate commercial registration or tax number and flag for admin hold (never auto-reject).
      const duplicateMatches = await repo.findDuplicateOrganizations({
        commercialRegNumber: input.commercialRegNumber,
        taxNumber: input.taxNumber,
        excludeApplicantAccountId: actor.accountId,
      });
      const duplicateHold = duplicateMatches.length > 0;

      const slaDueAt = addWorkingDays(now, 2); // FR-ONB-03: 2 working days SLA
      const appPayload: Record<string, unknown> = {
        ...(input as unknown as Record<string, unknown>),
        duplicateHold,
        duplicateMatches,
      };

      const app = await repo.createApplication({
        applicantAccountId: actor.accountId,
        applicationType: "organization",
        state: "Pending Review",
        payload: appPayload,
        slaDueAt,
      });

      await repo.insertApplicationDocuments(app.id, input.documents);
      await repo.upsertAccountRole({
        accountId: actor.accountId,
        role: "organization_owner",
        planTier: "starter",
        status: "pending_approval",
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: "organization_owner",
        action: "onboarding.application.submitted",
        targetEntityType: "application",
        targetEntityId: app.id,
        afterState: {
          applicationType: "organization",
          state: app.state,
          slaDueAt: slaDueAt.toISOString(),
          duplicateHold,
        },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      if (duplicateHold) {
        await repo.writeAuditLog({
          actorAccountId: actor.accountId,
          actorRole: "system",
          action: "onboarding.application.duplicate_hold_flagged",
          targetEntityType: "application",
          targetEntityId: app.id,
          reason:
            "Commercial registration or tax number matches an existing organization or active application (T-ONB-14).",
          afterState: {
            duplicateHold: true,
            duplicateMatches,
          },
          ipAddress: meta?.ipAddress,
          requestId: meta?.requestId,
        });
      }

      await dispatchApplicantStatusNotification({
        actorAccountId: actor.accountId,
        actorRole: "system",
        applicantAccountId: actor.accountId,
        applicationId: app.id,
        applicationType: "organization",
        nextState: app.state,
        template: "application_submitted",
        meta,
      });

      return app;
    },

    async submitDriverApplication(
      actor: { accountId: string },
      input: SubmitDriverApplicationInput,
      meta?: OnboardingRequestMeta,
    ) {
      const now = new Date();
      await assertNotBlockedByRecentRejection(actor.accountId, "platform_driver", now);

      const validation = validateDriverApplication(
        {
          ...input,
          licenseExpiry: new Date(input.licenseExpiry),
          insuranceExpiry: input.insuranceExpiry ? new Date(input.insuranceExpiry) : null,
          labResultSubmittedAt: new Date(input.labResultSubmittedAt),
          documentTypes: input.documents.map((d) => d.documentType),
        },
        now,
      );

      if (!validation.valid) {
        throw new OnboardingServiceError(
          "VALIDATION_ERROR",
          validation.errors[0]?.message ?? "Invalid platform driver application.",
          { errors: validation.errors },
        );
      }

      await repo.createConsentRecord({
        accountId: actor.accountId,
        consentType: "driver_lab_test",
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });

      // T-ONB-11: Record signed background check consent alongside lab test consent
      if (input.backgroundCheckConsentSigned !== false) {
        await repo.createConsentRecord({
          accountId: actor.accountId,
          consentType: "driver_background_check",
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        });
      }

      const slaDueAt = addWorkingDays(now, 2);
      const app = await repo.createApplication({
        applicantAccountId: actor.accountId,
        applicationType: "platform_driver",
        state: "Pending Review",
        payload: input as unknown as Record<string, unknown>,
        slaDueAt,
      });

      await repo.insertApplicationDocuments(app.id, input.documents);
      await repo.upsertAccountRole({
        accountId: actor.accountId,
        role: "platform_driver",
        planTier: "basic",
        status: "pending_approval",
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: "platform_driver",
        action: "onboarding.application.submitted",
        targetEntityType: "application",
        targetEntityId: app.id,
        afterState: {
          applicationType: "platform_driver",
          state: app.state,
          slaDueAt: slaDueAt.toISOString(),
        },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      await dispatchApplicantStatusNotification({
        actorAccountId: actor.accountId,
        actorRole: "system",
        applicantAccountId: actor.accountId,
        applicationId: app.id,
        applicationType: "platform_driver",
        nextState: app.state,
        template: "application_submitted",
        meta,
      });

      return app;
    },

    async submitPhotographerApplication(
      actor: { accountId: string },
      input: SubmitPhotographerApplicationInput,
      meta?: OnboardingRequestMeta,
    ) {
      const now = new Date();
      await assertNotBlockedByRecentRejection(actor.accountId, "platform_photographer", now);

      const validation = validatePhotographerApplication({
        ...input,
        documentTypes: input.documents.map((d) => d.documentType),
      });

      if (!validation.valid) {
        throw new OnboardingServiceError(
          "VALIDATION_ERROR",
          validation.errors[0]?.message ?? "Invalid platform photographer application.",
          { errors: validation.errors },
        );
      }

      const slaDueAt = addWorkingDays(now, 2);
      const app = await repo.createApplication({
        applicantAccountId: actor.accountId,
        applicationType: "platform_photographer",
        state: "Pending Review",
        payload: input as unknown as Record<string, unknown>,
        slaDueAt,
      });

      await repo.insertApplicationDocuments(app.id, input.documents);
      await repo.upsertAccountRole({
        accountId: actor.accountId,
        role: "platform_photographer",
        planTier: "basic",
        status: "pending_approval",
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: "platform_photographer",
        action: "onboarding.application.submitted",
        targetEntityType: "application",
        targetEntityId: app.id,
        afterState: {
          applicationType: "platform_photographer",
          state: app.state,
          slaDueAt: slaDueAt.toISOString(),
        },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      await dispatchApplicantStatusNotification({
        actorAccountId: actor.accountId,
        actorRole: "system",
        applicantAccountId: actor.accountId,
        applicationId: app.id,
        applicationType: "platform_photographer",
        nextState: app.state,
        template: "application_submitted",
        meta,
      });

      return app;
    },

    // 2. Applicant Status, Extension, Resubmit & Appeal (SCR-PUB-17..18, FR-ONB-04..05)
    async getApplicationStatus(actor: { accountId: string }, input?: GetApplicationStatusInput) {
      const app = input?.applicationId
        ? await repo.findApplicationById(input.applicationId)
        : await repo.findLatestApplicationForApplicant(actor.accountId);

      if (!app || app.applicantAccountId !== actor.accountId) {
        throw new OnboardingServiceError("NOT_FOUND", "Application not found.");
      }

      const now = new Date();
      const documents = await repo.listDocumentsForApplication(app.id);
      return {
        application: app,
        documents,
        workingDaysWaiting: countWorkingDaysBetween(app.createdAt, now),
        isSlaOverdue: app.state === "Pending Review" && app.slaDueAt.getTime() < now.getTime(),
        reapplyBlocked: isRejectedApplicantBlocked({
          state: app.state,
          rejectedAt: app.rejectedAt,
          reapplyBlockedUntil: app.reapplyBlockedUntil,
          now,
        }),
      };
    },

    async requestChangesExtension(
      actor: { accountId: string },
      input: RequestChangesExtensionInput,
      meta?: OnboardingRequestMeta,
    ) {
      const app = await repo.findApplicationById(input.applicationId);
      if (!app || app.applicantAccountId !== actor.accountId) {
        throw new OnboardingServiceError("NOT_FOUND", "Application not found.");
      }
      if (app.state !== "Changes Requested") {
        throw new OnboardingServiceError(
          "PRECONDITION_FAILED",
          "Extension can only be requested when application is in Changes Requested state.",
        );
      }
      if (app.changesExtensionUsed) {
        throw new OnboardingServiceError(
          "CONFLICT",
          "A one-time 7-day extension has already been used for this application (FR-ONB-04).",
        );
      }

      const baseDue = app.changesDueAt ?? new Date();
      const extendedDue = new Date(baseDue.getTime() + 7 * 24 * 60 * 60 * 1000);
      const updated = await repo.updateApplication(app.id, {
        changesDueAt: extendedDue,
        changesExtensionUsed: true,
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: "traveler",
        action: "onboarding.application.extension_requested",
        targetEntityType: "application",
        targetEntityId: app.id,
        reason: input.reason ?? "One-time +7 day extension requested",
        beforeState: { changesDueAt: app.changesDueAt?.toISOString() ?? null },
        afterState: { changesDueAt: extendedDue.toISOString(), changesExtensionUsed: true },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return updated!;
    },

    async resubmitApplication(
      actor: { accountId: string },
      input: ResubmitApplicationInput,
      meta?: OnboardingRequestMeta,
    ) {
      const app = await repo.findApplicationById(input.applicationId);
      if (!app || app.applicantAccountId !== actor.accountId) {
        throw new OnboardingServiceError("NOT_FOUND", "Application not found.");
      }
      if (!canTransitionApplicationState(app.state, "Pending Review")) {
        throw new OnboardingServiceError(
          "PRECONDITION_FAILED",
          `Cannot resubmit application from state "${app.state}".`,
        );
      }

      const now = new Date();
      if (app.changesDueAt && app.changesDueAt.getTime() < now.getTime()) {
        await repo.updateApplication(app.id, { state: "Closed" });
        throw new OnboardingServiceError(
          "FORBIDDEN",
          "The 14-day changes requested window has expired and the application was closed (FR-ONB-04).",
        );
      }

      if (input.documents && input.documents.length > 0) {
        await repo.insertApplicationDocuments(app.id, input.documents);
      }

      const updated = await repo.updateApplication(app.id, {
        state: "Pending Review",
        payload: { ...app.payload, ...input.updatedPayload },
        slaDueAt: addWorkingDays(now, 2),
        changesRequestedChecklist: (app.changesRequestedChecklist ?? []).map((item) => ({
          ...item,
          resolved: true,
        })),
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: "traveler",
        action: "onboarding.application.resubmitted",
        targetEntityType: "application",
        targetEntityId: app.id,
        beforeState: { state: app.state },
        afterState: { state: "Pending Review" },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return updated!;
    },

    async submitAppeal(
      actor: { accountId: string },
      input: SubmitAppealInput,
      meta?: OnboardingRequestMeta,
    ) {
      const app = await repo.findApplicationById(input.applicationId);
      if (!app || app.applicantAccountId !== actor.accountId) {
        throw new OnboardingServiceError("NOT_FOUND", "Application not found.");
      }
      if (!canTransitionApplicationState(app.state, "Appealed")) {
        throw new OnboardingServiceError(
          "PRECONDITION_FAILED",
          `Only a Rejected application can be appealed (current state: "${app.state}").`,
        );
      }

      if (input.documents && input.documents.length > 0) {
        await repo.insertApplicationDocuments(app.id, input.documents);
      }

      const now = new Date();
      const updated = await repo.updateApplication(app.id, {
        state: "Appealed",
        appealStatement: input.appealStatement,
        appealedAt: now,
        slaDueAt: addWorkingDays(now, 2),
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: "traveler",
        action: "onboarding.application.appealed",
        targetEntityType: "application",
        targetEntityId: app.id,
        reason: input.appealStatement,
        beforeState: { state: app.state },
        afterState: { state: "Appealed", appealedAt: now.toISOString() },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      await dispatchApplicantStatusNotification({
        actorAccountId: actor.accountId,
        actorRole: "system",
        applicantAccountId: actor.accountId,
        applicationId: app.id,
        applicationType: app.applicationType,
        nextState: "Appealed",
        template: "application_appealed",
        notes: input.appealStatement,
        meta,
      });

      return updated!;
    },

    // 3. Organization-Owned Supplier Onboarding (FR-ONB-09..10, D-82, D-94, SCR-ORG-20 — No Admin Queue)
    async onboardOrganizationSupplier(
      actor: {
        accountId: string;
        activeRole: UserRole;
        activeTenantId?: string | null;
      },
      input: OnboardOrganizationSupplierInput,
      meta?: OnboardingRequestMeta,
    ) {
      if (!actor.activeTenantId) {
        throw new OnboardingServiceError("NOT_FOUND", "Organization context not found.");
      }

      if (input.supplierRole === "org_driver" && !input.labTestConsentSigned) {
        throw new OnboardingServiceError(
          "VALIDATION_ERROR",
          "Organization driver must have a signed drug/safety lab test consent (FR-ONB-10).",
          { field: "labTestConsentSigned" },
        );
      }

      if (input.supplierRole === "org_photographer" && (input.portfolioPhotoCount ?? 0) < 8) {
        throw new OnboardingServiceError(
          "VALIDATION_ERROR",
          "Organization photographer requires at least 8 portfolio photos before first album assignment (D-82).",
          { field: "portfolioPhotoCount" },
        );
      }

      const phoneNorm = normalizePhoneE164(input.phone);
      const emailNorm = input.email ? normalizeEmail(input.email) : null;
      let supplierAccount = await repo.findAccountByPhoneBlindIndex(computeBlindIndex(phoneNorm));

      if (!supplierAccount) {
        const passwordHash = input.password ? await hashPassword(input.password) : null;
        supplierAccount = await repo.createSupplierAccount({
          emailNormalized: emailNorm,
          emailBlindIndex: emailNorm ? computeBlindIndex(emailNorm) : null,
          emailEncrypted: emailNorm ? encryptField(emailNorm) : null,
          phoneE164: phoneNorm,
          phoneBlindIndex: computeBlindIndex(phoneNorm),
          phoneEncrypted: encryptField(phoneNorm),
          passwordHash,
          fullName: input.fullName,
        });
      }

      await repo.upsertAccountRole({
        accountId: supplierAccount.id,
        role: input.supplierRole,
        tenantId: actor.activeTenantId,
        planTier: null,
        status: "active",
        approvedAt: new Date(),
      });

      if (input.supplierRole === "org_driver") {
        const consent = await repo.createConsentRecord({
          accountId: supplierAccount.id,
          consentType: "driver_lab_test",
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        });
        await repo.upsertDriverProfile({
          accountId: supplierAccount.id,
          scope: "organization",
          owningTenantId: actor.activeTenantId,
          nationalIdEncrypted: encryptField(input.nationalId),
          licenseNumberEncrypted: encryptField(input.licenseNumber ?? "ORG-DRV-LIC"),
          licenseCategory: input.licenseCategory ?? "First Degree Bus",
          licenseExpiry: input.licenseExpiry
            ? new Date(input.licenseExpiry)
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          yearsOfExperience: 3,
          serviceAreas: ["Organization Assigned"],
          hasOwnVehicle: false,
          labTestConsentId: consent.id,
          planTier: null,
          status: "active",
        });
      } else {
        await repo.upsertPhotographerProfile({
          accountId: supplierAccount.id,
          scope: "organization",
          owningTenantId: actor.activeTenantId,
          nationalIdEncrypted: encryptField(input.nationalId),
          yearsOfExperience: 2,
          cameraBodies: input.cameraBodies ?? ["Organization Camera"],
          lenses: [],
          hasDroneLicense: false,
          serviceRegions: ["Organization Assigned"],
          specialties: ["Organization Trips"],
          portfolioPhotoCount: input.portfolioPhotoCount ?? 8,
          sampleAlbums: [],
          planTier: null,
          status: "active",
        });
      }

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.activeRole,
        tenantId: actor.activeTenantId,
        action: "organization.supplier.onboarded",
        targetEntityType: "account",
        targetEntityId: supplierAccount.id,
        afterState: {
          supplierRole: input.supplierRole,
          owningTenantId: actor.activeTenantId,
        },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return {
        supplierAccountId: supplierAccount.id,
        supplierRole: input.supplierRole,
        owningTenantId: actor.activeTenantId,
        status: "active" as const,
      };
    },

    async listOrganizationSuppliers(
      actor: {
        accountId: string;
        activeRole: UserRole;
        activeTenantId?: string | null;
      },
      input?: ListOrganizationSuppliersInput,
    ) {
      if (!actor.activeTenantId) {
        throw new OnboardingServiceError("NOT_FOUND", "Organization context not found.");
      }

      const suppliers = await repo.listOrganizationSuppliers(
        actor.activeTenantId,
        input?.supplierRole,
      );

      return {
        tenantId: actor.activeTenantId,
        suppliers,
      };
    },

    async removeOrganizationSupplier(
      actor: {
        accountId: string;
        activeRole: UserRole;
        activeTenantId?: string | null;
      },
      input: RemoveOrganizationSupplierInput,
      meta?: OnboardingRequestMeta,
    ) {
      if (!actor.activeTenantId) {
        throw new OnboardingServiceError("NOT_FOUND", "Organization context not found.");
      }

      const removed = await repo.removeOrganizationSupplier({
        tenantId: actor.activeTenantId,
        supplierAccountId: input.supplierAccountId,
        supplierRole: input.supplierRole,
      });

      if (!removed) {
        throw new OnboardingServiceError(
          "NOT_FOUND",
          "Organization supplier not found in this organization.",
        );
      }

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.activeRole,
        tenantId: actor.activeTenantId,
        action: "organization.supplier.removed",
        targetEntityType: "account",
        targetEntityId: input.supplierAccountId,
        reason: input.reason ?? "Removed from organization supplier roster",
        afterState: {
          removedRoles: removed.removedRoles,
          owningTenantId: actor.activeTenantId,
        },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return {
        removed: true,
        supplierAccountId: input.supplierAccountId,
        removedRoles: removed.removedRoles,
      };
    },

    // 4. Admin Review Queue, Document Verification/Access & Decisions (WF-APP-04..06, SCR-ADM-02..03)
    async listReviewQueue(input?: ListReviewQueueInput) {
      const now = new Date();
      const items = await repo.listApplications({
        state: input?.state,
        applicationType: input?.applicationType,
        overdueOnly: input?.overdueOnly,
        duplicateHoldOnly: input?.duplicateHoldOnly,
        now,
      });

      const accountIds = [...new Set(items.map((a) => a.applicantAccountId))];
      const accounts = await repo.listAccountsByIds(accountIds);
      const accountMap = new Map(accounts.map((a) => [a.id, a]));

      return items.map((app) => {
        const applicant = accountMap.get(app.applicantAccountId);
        const payloadObj = (app.payload ?? {}) as Record<string, unknown>;
        return {
          ...app,
          isSlaOverdue: app.state === "Pending Review" && app.slaDueAt.getTime() < now.getTime(),
          workingDaysWaiting: countWorkingDaysBetween(app.createdAt, now),
          duplicateHold: Boolean(payloadObj.duplicateHold),
          applicant: applicant
            ? {
                id: applicant.id,
                fullName: applicant.fullName,
                email: applicant.emailNormalized,
                phone: applicant.phoneE164,
              }
            : null,
        };
      });
    },

    async getApplicationDetail(input: GetApplicationDetailInput) {
      const app = await repo.findApplicationById(input.applicationId);
      if (!app) {
        throw new OnboardingServiceError("NOT_FOUND", "Application not found.");
      }
      const now = new Date();
      const applicant = await repo.findAccountById(app.applicantAccountId);
      const documents = await repo.listDocumentsForApplication(app.id);
      const consents = await repo.listConsentsForAccount(app.applicantAccountId);
      const payloadObj = (app.payload ?? {}) as Record<string, unknown>;

      return {
        application: app,
        applicant: applicant
          ? {
              id: applicant.id,
              fullName: applicant.fullName,
              email: applicant.emailNormalized,
              phone: applicant.phoneE164,
              status: applicant.status,
            }
          : null,
        documents,
        consents,
        workingDaysWaiting: countWorkingDaysBetween(app.createdAt, now),
        isSlaOverdue: app.state === "Pending Review" && app.slaDueAt.getTime() < now.getTime(),
        duplicateHold: Boolean(payloadObj.duplicateHold),
      };
    },

    async verifyApplicationDocument(
      actor: { accountId: string; activeRole: UserRole; adminSubRole?: AdminSubRole | null },
      input: VerifyApplicationDocumentInput,
      meta?: OnboardingRequestMeta,
    ) {
      const app = await repo.findApplicationById(input.applicationId);
      if (!app) {
        throw new OnboardingServiceError("NOT_FOUND", "Application not found.");
      }

      const doc = await repo.findDocumentById(input.documentId);
      if (!doc || doc.applicationId !== app.id) {
        throw new OnboardingServiceError("NOT_FOUND", "Application document not found.");
      }

      const updated = await repo.updateApplicationDocument(doc.id, {
        verifiedStatus: input.verifiedStatus,
        rejectionNote: input.verifiedStatus === "rejected" ? (input.rejectionNote ?? null) : null,
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.activeRole,
        action: "onboarding.document.verified",
        targetEntityType: "application_document",
        targetEntityId: doc.id,
        reason: input.rejectionNote ?? null,
        beforeState: { verifiedStatus: doc.verifiedStatus },
        afterState: {
          applicationId: app.id,
          verifiedStatus: input.verifiedStatus,
          rejectionNote: input.rejectionNote ?? null,
        },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return updated!;
    },

    async openApplicationDocument(
      actor: { accountId: string; activeRole: UserRole; adminSubRole?: AdminSubRole | null },
      input: OpenApplicationDocumentInput,
      meta?: OnboardingRequestMeta,
    ) {
      const app = await repo.findApplicationById(input.applicationId);
      if (!app) {
        throw new OnboardingServiceError("NOT_FOUND", "Application not found.");
      }

      const isOwner = app.applicantAccountId === actor.accountId;
      const isAuthorizedAdmin =
        actor.activeRole === "admin" &&
        (actor.adminSubRole === "super_admin" || actor.adminSubRole === "operations");

      if (!isOwner && !isAuthorizedAdmin) {
        throw new OnboardingServiceError(
          "FORBIDDEN",
          "Only the applicant or an authorized operations/super admin may access application identity documents (T-ONB-10).",
        );
      }

      const doc = await repo.findDocumentById(input.documentId);
      if (!doc || doc.applicationId !== app.id) {
        throw new OnboardingServiceError("NOT_FOUND", "Application document not found.");
      }

      // T-ONB-10: Every identity document view is logged to audit_logs
      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.activeRole,
        action: "onboarding.document.accessed",
        targetEntityType: "application_document",
        targetEntityId: doc.id,
        reason: input.reason ?? "Application document inspection",
        afterState: {
          applicationId: app.id,
          documentType: doc.documentType,
          storageKey: doc.storageKey,
        },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return {
        document: doc,
        signedAccessUrl: `/storage/documents/${encodeURIComponent(doc.storageKey)}?applicationId=${app.id}&documentId=${doc.id}`,
        expiresInSeconds: 300,
      };
    },

    async approveApplication(
      actor: { accountId: string; activeRole: UserRole; adminSubRole?: AdminSubRole | null },
      input: ApproveApplicationInput,
      meta?: OnboardingRequestMeta,
    ) {
      const app = await repo.findApplicationById(input.applicationId);
      if (!app) {
        throw new OnboardingServiceError("NOT_FOUND", "Application not found.");
      }

      if (!canTransitionApplicationState(app.state, "Approved")) {
        throw new OnboardingServiceError(
          "PRECONDITION_FAILED",
          `Cannot transition application from "${app.state}" to "Approved".`,
        );
      }

      const now = new Date();
      let provisionedOrganizationId: string | null = null;

      if (app.applicationType === "organization") {
        const p = app.payload as Record<string, unknown>;
        const countryCode = ((p.countryCode as string) ?? "EG") as SupportedCountryCode;
        // The organization id is generated up front so its default settings are built against the
        // real tenant id instead of a placeholder.
        const organizationId = randomUUID();
        const defaultSettings = createDefaultOrganizationSettings({
          tenantId: organizationId,
          countryCode,
          planTier: "starter",
          billingContactName: (p.billingContactName as string) ?? null,
          billingContactEmail: (p.billingContactEmail as string) ?? null,
          billingContactPhone: (p.billingContactPhone as string) ?? null,
          billingAddress: (p.billingAddress as string) ?? null,
          invoiceLanguage: ((p.invoiceLanguage as string) ?? "ar") as SupportedLocale,
          taxNumber: (p.taxNumber as string) ?? null,
          safetyLeadName: (p.safetyLeadName as string) ?? null,
          safetyHotlinePhone: (p.safetyHotlinePhone as string) ?? null,
        });

        const { organization } = await repo.createOrganizationAndSettings({
          id: organizationId,
          ownerAccountId: app.applicantAccountId,
          legalEntityName: (p.legalEntityName as string) ?? "Approved Organization",
          displayNameEn:
            (p.displayNameEn as string) ?? (p.legalEntityName as string) ?? "Approved Organization",
          displayNameAr:
            (p.displayNameAr as string) ?? (p.legalEntityName as string) ?? "منظمة معتمدة",
          commercialRegNumberEncrypted: encryptField(
            (p.commercialRegNumber as string) ?? "CR-DEFAULT",
          ),
          taxNumberEncrypted: encryptField((p.taxNumber as string) ?? "TX-DEFAULT"),
          tourismLicenseNumberEncrypted: encryptField(
            (p.tourismLicenseNumber as string) ?? "TL-DEFAULT",
          ),
          tourismLicenseExpiry: p.tourismLicenseExpiry
            ? new Date(p.tourismLicenseExpiry as string)
            : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
          countryCode,
          headquartersAddress: (p.headquartersAddress as string) ?? "Cairo, Egypt",
          signatoryFullName: (p.signatoryFullName as string) ?? "Authorized Signatory",
          signatoryNationalIdEncrypted: encryptField(
            (p.signatoryNationalId as string) ?? "00000000000000",
          ),
          signatoryRoleTitle: (p.signatoryRoleTitle as string) ?? "Managing Director",
          payoutMethod: ((p.payoutMethod as string) ?? "bank_transfer") as
            | "bank_transfer"
            | "mobile_wallet",
          payoutIbanEncrypted: encryptField((p.payoutIbanOrWallet as string) ?? "EG000000"),
          childSafetyOptIn: Boolean(p.childSafetyProgramOptIn),
          defaultSettings,
        });

        provisionedOrganizationId = organization.id;

        await repo.upsertAccountRole({
          accountId: app.applicantAccountId,
          role: "organization_owner",
          tenantId: organization.id,
          planTier: "starter",
          status: "active",
          approvedAt: now,
        });
      } else if (app.applicationType === "platform_driver") {
        const p = app.payload as Record<string, unknown>;
        await repo.upsertDriverProfile({
          accountId: app.applicantAccountId,
          scope: "platform",
          nationalIdEncrypted: encryptField((p.nationalId as string) ?? "00000000000000"),
          licenseNumberEncrypted: encryptField((p.licenseNumber as string) ?? "DRV-LIC"),
          licenseCategory: (p.licenseCategory as string) ?? "First Degree Bus",
          licenseExpiry: p.licenseExpiry
            ? new Date(p.licenseExpiry as string)
            : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
          yearsOfExperience: Number(p.yearsOfExperience ?? 3),
          serviceAreas: Array.isArray(p.serviceAreas) ? (p.serviceAreas as string[]) : ["Cairo"],
          hasOwnVehicle: Boolean(p.hasOwnVehicle),
          vehicleMakeModel: (p.vehicleMakeModel as string) ?? null,
          vehicleYear: p.vehicleYear ? Number(p.vehicleYear) : null,
          vehiclePlateNumber: (p.vehiclePlateNumber as string) ?? null,
          vehicleSeatCapacity: p.vehicleSeatCapacity ? Number(p.vehicleSeatCapacity) : null,
          insurancePolicyNumber: (p.insurancePolicyNumber as string) ?? null,
          insuranceExpiry: p.insuranceExpiry ? new Date(p.insuranceExpiry as string) : null,
          planTier: "basic",
          status: "active",
        });

        await repo.upsertAccountRole({
          accountId: app.applicantAccountId,
          role: "platform_driver",
          planTier: "basic",
          status: "active",
          approvedAt: now,
        });
      } else if (app.applicationType === "platform_photographer") {
        const p = app.payload as Record<string, unknown>;
        await repo.upsertPhotographerProfile({
          accountId: app.applicantAccountId,
          scope: "platform",
          nationalIdEncrypted: encryptField((p.nationalId as string) ?? "00000000000000"),
          yearsOfExperience: Number(p.yearsOfExperience ?? 2),
          cameraBodies: Array.isArray(p.cameraBodies)
            ? (p.cameraBodies as string[])
            : ["Professional Camera"],
          lenses: Array.isArray(p.lenses) ? (p.lenses as string[]) : [],
          hasDroneLicense: Boolean(p.hasDroneLicense),
          serviceRegions: Array.isArray(p.serviceRegions)
            ? (p.serviceRegions as string[])
            : ["Cairo"],
          specialties: Array.isArray(p.specialties) ? (p.specialties as string[]) : ["Trips"],
          portfolioPhotoCount: Number(p.portfolioPhotoCount ?? 8),
          sampleAlbums: [],
          planTier: "basic",
          status: "active",
        });

        await repo.upsertAccountRole({
          accountId: app.applicantAccountId,
          role: "platform_photographer",
          planTier: "basic",
          status: "active",
          approvedAt: now,
        });
      }

      const reviewer = await repo.findAccountById(actor.accountId);
      const reviewerAccountId = reviewer ? actor.accountId : null;

      const updated = await repo.updateApplication(app.id, {
        state: "Approved",
        reviewedByAdminAccountId: reviewerAccountId,
        reviewedAt: now,
        decisionReasonCode: input.decisionReasonCode,
        decisionNotes: input.decisionNotes ?? null,
        provisionedOrganizationId,
      });

      await repo.writeAuditLog({
        actorAccountId: reviewerAccountId,
        actorRole: "admin",
        tenantId: provisionedOrganizationId,
        action: "onboarding.application.approved",
        targetEntityType: "application",
        targetEntityId: app.id,
        reason: input.decisionNotes ?? input.decisionReasonCode,
        beforeState: { state: app.state },
        afterState: { state: "Approved", provisionedOrganizationId },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      await dispatchApplicantStatusNotification({
        actorAccountId: actor.accountId,
        actorRole: "admin",
        applicantAccountId: app.applicantAccountId,
        applicationId: app.id,
        applicationType: app.applicationType,
        nextState: "Approved",
        template: "application_approved",
        reasonCode: input.decisionReasonCode,
        notes: input.decisionNotes ?? null,
        meta,
      });

      return updated!;
    },

    async requestApplicationChanges(
      actor: { accountId: string; activeRole: UserRole },
      input: RequestApplicationChangesInput,
      meta?: OnboardingRequestMeta,
    ) {
      const app = await repo.findApplicationById(input.applicationId);
      if (!app) {
        throw new OnboardingServiceError("NOT_FOUND", "Application not found.");
      }

      if (!canTransitionApplicationState(app.state, "Changes Requested")) {
        throw new OnboardingServiceError(
          "PRECONDITION_FAILED",
          `Cannot transition application from "${app.state}" to "Changes Requested".`,
        );
      }

      const reviewer = await repo.findAccountById(actor.accountId);
      const reviewerAccountId = reviewer ? actor.accountId : null;

      const now = new Date();
      const changesDueAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // FR-ONB-04: 14 days
      const updated = await repo.updateApplication(app.id, {
        state: "Changes Requested",
        reviewedByAdminAccountId: reviewerAccountId,
        reviewedAt: now,
        decisionReasonCode: input.decisionReasonCode,
        decisionNotes: input.decisionNotes,
        changesRequestedChecklist: input.checklist.map((c) => ({
          field: c.field,
          instruction: c.instruction,
          resolved: false,
        })),
        changesDueAt,
      });

      await repo.writeAuditLog({
        actorAccountId: reviewerAccountId,
        actorRole: "admin",
        action: "onboarding.application.changes_requested",
        targetEntityType: "application",
        targetEntityId: app.id,
        reason: input.decisionNotes,
        beforeState: { state: app.state },
        afterState: { state: "Changes Requested", changesDueAt: changesDueAt.toISOString() },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      await dispatchApplicantStatusNotification({
        actorAccountId: actor.accountId,
        actorRole: "admin",
        applicantAccountId: app.applicantAccountId,
        applicationId: app.id,
        applicationType: app.applicationType,
        nextState: "Changes Requested",
        template: "application_changes_requested",
        reasonCode: input.decisionReasonCode,
        notes: input.decisionNotes,
        meta,
      });

      return updated!;
    },

    async rejectApplication(
      actor: { accountId: string; activeRole: UserRole },
      input: RejectApplicationInput,
      meta?: OnboardingRequestMeta,
    ) {
      const app = await repo.findApplicationById(input.applicationId);
      if (!app) {
        throw new OnboardingServiceError("NOT_FOUND", "Application not found.");
      }

      if (!canTransitionApplicationState(app.state, "Rejected")) {
        throw new OnboardingServiceError(
          "PRECONDITION_FAILED",
          `Cannot transition application from "${app.state}" to "Rejected".`,
        );
      }

      const reviewer = await repo.findAccountById(actor.accountId);
      const reviewerAccountId = reviewer ? actor.accountId : null;

      const now = new Date();
      const reapplyBlockedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // FR-ONB-05: 30-day block

      const updated = await repo.updateApplication(app.id, {
        state: "Rejected",
        reviewedByAdminAccountId: reviewerAccountId,
        reviewedAt: now,
        decisionReasonCode: input.decisionReasonCode,
        decisionNotes: input.decisionNotes,
        rejectedAt: now,
        reapplyBlockedUntil,
      });

      await repo.writeAuditLog({
        actorAccountId: reviewerAccountId,
        actorRole: "admin",
        action: "onboarding.application.rejected",
        targetEntityType: "application",
        targetEntityId: app.id,
        reason: input.decisionNotes,
        beforeState: { state: app.state },
        afterState: {
          state: "Rejected",
          reapplyBlockedUntil: reapplyBlockedUntil.toISOString(),
        },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      await dispatchApplicantStatusNotification({
        actorAccountId: actor.accountId,
        actorRole: "admin",
        applicantAccountId: app.applicantAccountId,
        applicationId: app.id,
        applicationType: app.applicationType,
        nextState: "Rejected",
        template: "application_rejected",
        reasonCode: input.decisionReasonCode,
        notes: input.decisionNotes,
        meta,
      });

      return updated!;
    },

    async decideAppeal(
      actor: { accountId: string; activeRole: UserRole; adminSubRole?: AdminSubRole | null },
      input: DecideAppealInput,
      meta?: OnboardingRequestMeta,
    ) {
      const app = await repo.findApplicationById(input.applicationId);
      if (!app) {
        throw new OnboardingServiceError("NOT_FOUND", "Application not found.");
      }

      if (app.state !== "Appealed") {
        throw new OnboardingServiceError(
          "PRECONDITION_FAILED",
          `Appeal decision requires application in "Appealed" state (current: "${app.state}").`,
        );
      }

      if (input.decision === "approve") {
        return this.approveApplication(
          actor,
          {
            applicationId: app.id,
            decisionReasonCode: input.decisionReasonCode,
            decisionNotes: input.decisionNotes,
          },
          meta,
        );
      }

      const reviewer = await repo.findAccountById(actor.accountId);
      const reviewerAccountId = reviewer ? actor.accountId : null;

      const now = new Date();
      const updated = await repo.updateApplication(app.id, {
        state: "Closed",
        appealDecidedByAdminAccountId: reviewerAccountId,
        appealDecidedAt: now,
        decisionReasonCode: input.decisionReasonCode,
        decisionNotes: input.decisionNotes,
      });

      await repo.writeAuditLog({
        actorAccountId: reviewerAccountId,
        actorRole: "admin",
        action: "onboarding.appeal.rejected_closed",
        targetEntityType: "application",
        targetEntityId: app.id,
        reason: input.decisionNotes,
        beforeState: { state: "Appealed" },
        afterState: { state: "Closed" },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      await dispatchApplicantStatusNotification({
        actorAccountId: actor.accountId,
        actorRole: "admin",
        applicantAccountId: app.applicantAccountId,
        applicationId: app.id,
        applicationType: app.applicationType,
        nextState: "Closed",
        template: "application_closed",
        reasonCode: input.decisionReasonCode,
        notes: input.decisionNotes,
        meta,
      });

      return updated!;
    },

    async closeExpiredChangesApplications(now: Date = new Date()) {
      const expired = await repo.findExpiredChangesApplications(now);
      for (const app of expired) {
        await repo.updateApplication(app.id, {
          state: "Closed",
          decisionReasonCode: "changes_window_expired",
          decisionNotes: "Application closed automatically after 14-day changes window expired.",
        });
        await dispatchApplicantStatusNotification({
          actorAccountId: app.applicantAccountId,
          actorRole: "system",
          applicantAccountId: app.applicantAccountId,
          applicationId: app.id,
          applicationType: app.applicationType,
          nextState: "Closed",
          template: "application_closed",
          reasonCode: "changes_window_expired",
          notes: "Application closed automatically after 14-day changes window expired.",
        });
      }
      return {
        closedCount: expired.length,
        closedApplicationIds: expired.map((a) => a.id),
      };
    },
  };
}
