// oRPC procedures for Onboarding. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  approveApplicationSchema,
  decideAppealSchema,
  getApplicationDetailSchema,
  getApplicationStatusSchema,
  listReviewQueueSchema,
  onboardOrganizationSupplierSchema,
  rejectApplicationSchema,
  requestApplicationChangesSchema,
  requestChangesExtensionSchema,
  resubmitApplicationSchema,
  submitAppealSchema,
  submitDriverApplicationSchema,
  submitOrganizationApplicationSchema,
  submitPhotographerApplicationSchema,
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
      createOnboardingService(context.db).requestChangesExtension(context.auth, input),
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
      createOnboardingService(context.db).resubmitApplication(context.auth, input),
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
      createOnboardingService(context.db).submitAppeal(context.auth, input),
    ),

  // Organization-Owned Supplier Onboarding (FR-ONB-09..10)
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

  // Admin Review Queue & Decisions (WF-APP-04..06, SCR-ADM-02..03)
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
