// oRPC procedures for Onboarding. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  approveApplicationSchema,
  decideAppealSchema,
  getApplicationDetailSchema,
  getApplicationStatusSchema,
  listOrganizationSuppliersSchema,
  listReviewQueueSchema,
  onboardOrganizationSupplierSchema,
  openApplicationDocumentSchema,
  rejectApplicationSchema,
  removeOrganizationSupplierSchema,
  requestApplicationChangesSchema,
  requestChangesExtensionSchema,
  resubmitApplicationSchema,
  submitAppealSchema,
  submitDriverApplicationSchema,
  submitOrganizationApplicationSchema,
  submitPhotographerApplicationSchema,
  verifyApplicationDocumentSchema,
} from "../schemas/validation";
import { createOnboardingService } from "../services";
import {
  authedProcedure,
  opsOrSuperAdminProcedure,
  orgFleetManageProcedure,
  procedure,
} from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/onboarding/status",
      operationId: "onboardingStatus",
      summary: "Onboarding service health status",
      tags: ["onboarding"],
    })
    .handler(() => ({ service: "onboarding", status: "ok" as const })),

  // Supplier Application Submissions (WF-APP-01..03)
  submitOrganizationApplication: authedProcedure
    .route({
      method: "POST",
      path: "/onboarding/submitOrganizationApplication",
      operationId: "onboardingSubmitOrganizationApplication",
      summary: "Submit an organization onboarding application (WF-APP-01)",
      tags: ["onboarding"],
    })
    .input(submitOrganizationApplicationSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).submitOrganizationApplication(
        context.auth,
        input,
        context,
      ),
    ),

  submitDriverApplication: authedProcedure
    .route({
      method: "POST",
      path: "/onboarding/submitDriverApplication",
      operationId: "onboardingSubmitDriverApplication",
      summary: "Submit a platform driver application with vehicle & lab consent (WF-APP-02)",
      tags: ["onboarding"],
    })
    .input(submitDriverApplicationSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).submitDriverApplication(context.auth, input, context),
    ),

  submitPhotographerApplication: authedProcedure
    .route({
      method: "POST",
      path: "/onboarding/submitPhotographerApplication",
      operationId: "onboardingSubmitPhotographerApplication",
      summary: "Submit a platform photographer application with >= 8 portfolio photos (WF-APP-03)",
      tags: ["onboarding"],
    })
    .input(submitPhotographerApplicationSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).submitPhotographerApplication(
        context.auth,
        input,
        context,
      ),
    ),

  // Applicant Status, Changes Extension, Resubmission & Appeal (SCR-PUB-17..18)
  getApplicationStatus: authedProcedure
    .route({
      method: "POST",
      path: "/onboarding/getApplicationStatus",
      operationId: "onboardingGetApplicationStatus",
      summary: "Get applicant's onboarding application status",
      tags: ["onboarding"],
    })
    .input(getApplicationStatusSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).getApplicationStatus(context.auth, input),
    ),

  requestChangesExtension: authedProcedure
    .route({
      method: "POST",
      path: "/onboarding/requestChangesExtension",
      operationId: "onboardingRequestChangesExtension",
      summary: "Request a one-time +7-day extension on Changes Requested window (FR-ONB-04)",
      tags: ["onboarding"],
    })
    .input(requestChangesExtensionSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).requestChangesExtension(context.auth, input, context),
    ),

  resubmitApplication: authedProcedure
    .route({
      method: "POST",
      path: "/onboarding/resubmitApplication",
      operationId: "onboardingResubmitApplication",
      summary: "Resubmit application after requested changes (FR-ONB-04)",
      tags: ["onboarding"],
    })
    .input(resubmitApplicationSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).resubmitApplication(context.auth, input, context),
    ),

  submitAppeal: authedProcedure
    .route({
      method: "POST",
      path: "/onboarding/submitAppeal",
      operationId: "onboardingSubmitAppeal",
      summary: "Submit a one-time appeal against a rejected application (WF-APP-06)",
      tags: ["onboarding"],
    })
    .input(submitAppealSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).submitAppeal(context.auth, input, context),
    ),

  // Organization-Owned Supplier Onboarding & Roster (FR-ONB-09..10, SCR-ORG-20)
  onboardOrganizationSupplier: orgFleetManageProcedure
    .route({
      method: "POST",
      path: "/onboarding/onboardOrganizationSupplier",
      operationId: "onboardingOnboardOrganizationSupplier",
      summary: "Onboard an organization-owned driver or photographer directly (FR-ONB-09..10)",
      tags: ["onboarding"],
    })
    .input(onboardOrganizationSupplierSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).onboardOrganizationSupplier(context.auth, input, context),
    ),

  listOrganizationSuppliers: orgFleetManageProcedure
    .route({
      method: "POST",
      path: "/onboarding/listOrganizationSuppliers",
      operationId: "onboardingListOrganizationSuppliers",
      summary:
        "List organization-owned drivers and photographers for the active tenant (SCR-ORG-20)",
      tags: ["onboarding"],
    })
    .input(listOrganizationSuppliersSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).listOrganizationSuppliers(context.auth, input),
    ),

  removeOrganizationSupplier: orgFleetManageProcedure
    .route({
      method: "POST",
      path: "/onboarding/removeOrganizationSupplier",
      operationId: "onboardingRemoveOrganizationSupplier",
      summary:
        "Remove an organization-owned driver or photographer from the active tenant (SCR-ORG-20)",
      tags: ["onboarding"],
    })
    .input(removeOrganizationSupplierSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).removeOrganizationSupplier(context.auth, input, context),
    ),

  // Admin Review Queue, Document Verification/Access & Decisions (WF-APP-04..06, SCR-ADM-02..03)
  listReviewQueue: opsOrSuperAdminProcedure
    .route({
      method: "POST",
      path: "/onboarding/listReviewQueue",
      operationId: "onboardingListReviewQueue",
      summary: "List unified admin onboarding queue with SLA overdue indicator (FR-ONB-02..03)",
      tags: ["onboarding"],
    })
    .input(listReviewQueueSchema)
    .handler(({ context, input }) => createOnboardingService(context.db).listReviewQueue(input)),

  getApplicationDetail: opsOrSuperAdminProcedure
    .route({
      method: "POST",
      path: "/onboarding/getApplicationDetail",
      operationId: "onboardingGetApplicationDetail",
      summary: "Get full onboarding application details and documents",
      tags: ["onboarding"],
    })
    .input(getApplicationDetailSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).getApplicationDetail(input),
    ),

  verifyApplicationDocument: opsOrSuperAdminProcedure
    .route({
      method: "POST",
      path: "/onboarding/verifyApplicationDocument",
      operationId: "onboardingVerifyApplicationDocument",
      summary: "Verify or reject an uploaded application document (SCR-ADM-03, T-ONB-12)",
      tags: ["onboarding"],
    })
    .input(verifyApplicationDocumentSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).verifyApplicationDocument(context.auth, input, context),
    ),

  openApplicationDocument: authedProcedure
    .route({
      method: "POST",
      path: "/onboarding/openApplicationDocument",
      operationId: "onboardingOpenApplicationDocument",
      summary: "Open an application identity document with audit logging (T-ONB-10)",
      tags: ["onboarding"],
    })
    .input(openApplicationDocumentSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).openApplicationDocument(context.auth, input, context),
    ),

  approveApplication: opsOrSuperAdminProcedure
    .route({
      method: "POST",
      path: "/onboarding/approveApplication",
      operationId: "onboardingApproveApplication",
      summary: "Approve a supplier onboarding application (WF-APP-04)",
      tags: ["onboarding"],
    })
    .input(approveApplicationSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).approveApplication(context.auth, input, context),
    ),

  requestApplicationChanges: opsOrSuperAdminProcedure
    .route({
      method: "POST",
      path: "/onboarding/requestApplicationChanges",
      operationId: "onboardingRequestApplicationChanges",
      summary: "Request changes on a supplier application with 14-day window (FR-ONB-04)",
      tags: ["onboarding"],
    })
    .input(requestApplicationChangesSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).requestApplicationChanges(context.auth, input, context),
    ),

  rejectApplication: opsOrSuperAdminProcedure
    .route({
      method: "POST",
      path: "/onboarding/rejectApplication",
      operationId: "onboardingRejectApplication",
      summary:
        "Reject a supplier application with mandatory reason and 30-day cooldown (FR-ONB-05)",
      tags: ["onboarding"],
    })
    .input(rejectApplicationSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).rejectApplication(context.auth, input, context),
    ),

  decideAppeal: opsOrSuperAdminProcedure
    .route({
      method: "POST",
      path: "/onboarding/decideAppeal",
      operationId: "onboardingDecideAppeal",
      summary: "Approve or reject an appealed supplier application (WF-APP-06)",
      tags: ["onboarding"],
    })
    .input(decideAppealSchema)
    .handler(({ context, input }) =>
      createOnboardingService(context.db).decideAppeal(context.auth, input, context),
    ),

  closeExpiredChangesApplications: opsOrSuperAdminProcedure
    .route({
      method: "POST",
      path: "/onboarding/closeExpiredChangesApplications",
      operationId: "onboardingCloseExpiredChangesApplications",
      summary: "Close applications whose 14-day changes-requested window has expired",
      tags: ["onboarding"],
    })
    .handler(({ context }) =>
      createOnboardingService(context.db).closeExpiredChangesApplications(),
    ),
};
