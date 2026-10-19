// oRPC procedures for Trips. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  browsePublicTripsInputSchema,
  cancelTripInputSchema,
  createDraftTripInputSchema,
  getOrganizationTripInputSchema,
  getPublicTripDetailInputSchema,
  listOrganizationTripsInputSchema,
  publishTripInputSchema,
  saveWizardStepInputSchema,
  transitionTripStateInputSchema,
} from "../schemas/validation";
import { createTripsService } from "../services";
import type { TripsTenantActorContext, TripsViewerContext } from "../types";
import { procedure, tripsManageProcedure, tripsViewProcedure } from "./procedure";

function extractTenantActor(context: {
  auth: {
    accountId: string;
    activeRole: TripsTenantActorContext["role"];
    activeTenantId: string;
  };
  ipAddress?: string | null;
  requestId?: string | null;
}): TripsTenantActorContext {
  return {
    accountId: context.auth.accountId,
    role: context.auth.activeRole,
    activeTenantId: context.auth.activeTenantId,
    ipAddress: context.ipAddress ?? null,
    requestId: context.requestId ?? null,
  };
}

function extractViewerContext(context: {
  auth?: {
    accountId: string;
    activeRole: TripsViewerContext["role"];
    planTier?: string | null;
  } | null;
}): TripsViewerContext {
  const rawTier = context.auth?.planTier;
  const travelerPlanTier =
    rawTier === "free" || rawTier === "explorer" || rawTier === "vip" ? rawTier : null;
  return {
    accountId: context.auth?.accountId ?? null,
    role: context.auth?.activeRole ?? null,
    travelerPlanTier,
  };
}

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/trips/status",
      operationId: "tripsStatus",
      summary: "Trips service health status",
      tags: ["trips"],
    })
    .handler(() => ({ service: "trips", status: "ok" as const })),

  createDraft: tripsManageProcedure
    .route({
      method: "POST",
      path: "/trips",
      operationId: "tripsCreateDraft",
      summary: "Create a draft trip from Wizard Step 1 (SCR-ORG-11)",
      tags: ["trips"],
    })
    .input(createDraftTripInputSchema)
    .handler(async ({ input, context }) => {
      const service = createTripsService(context.db);
      return service.createDraft(extractTenantActor(context), input);
    }),

  saveWizardStep: tripsManageProcedure
    .route({
      method: "PATCH",
      path: "/trips/{tripId}/wizard",
      operationId: "tripsSaveWizardStep",
      summary: "Save one of the 8 trip wizard steps with plan feature/limit checks (SCR-ORG-11)",
      tags: ["trips"],
    })
    .input(saveWizardStepInputSchema)
    .handler(async ({ input, context }) => {
      const service = createTripsService(context.db);
      return service.saveWizardStep(extractTenantActor(context), input);
    }),

  publish: tripsManageProcedure
    .route({
      method: "POST",
      path: "/trips/{tripId}/publish",
      operationId: "tripsPublish",
      summary:
        "Publish a draft trip after verifying wizard completion and plan limits (SCR-ORG-11)",
      tags: ["trips"],
    })
    .input(publishTripInputSchema)
    .handler(async ({ input, context }) => {
      const service = createTripsService(context.db);
      return service.publish(extractTenantActor(context), input);
    }),

  transitionState: tripsManageProcedure
    .route({
      method: "POST",
      path: "/trips/{tripId}/transition",
      operationId: "tripsTransitionState",
      summary: "Transition a trip across its operational lifecycle states (SCR-ORG-13)",
      tags: ["trips"],
    })
    .input(transitionTripStateInputSchema)
    .handler(async ({ input, context }) => {
      const service = createTripsService(context.db);
      return service.transitionState(extractTenantActor(context), input);
    }),

  cancel: tripsManageProcedure
    .route({
      method: "POST",
      path: "/trips/{tripId}/cancel",
      operationId: "tripsCancel",
      summary: "Cancel a trip with mandatory audit reason (SCR-ORG-14)",
      tags: ["trips"],
    })
    .input(cancelTripInputSchema)
    .handler(async ({ input, context }) => {
      const service = createTripsService(context.db);
      return service.cancel(extractTenantActor(context), input);
    }),

  listOrganizationTrips: tripsViewProcedure
    .route({
      method: "GET",
      path: "/trips",
      operationId: "tripsListOrganizationTrips",
      summary: "List organization trips with state, search, and staffing gap filters (SCR-ORG-10)",
      tags: ["trips"],
    })
    .input(listOrganizationTripsInputSchema)
    .handler(async ({ input, context }) => {
      const service = createTripsService(context.db);
      return service.listOrganizationTrips(extractTenantActor(context), input);
    }),

  getOrganizationTrip: tripsViewProcedure
    .route({
      method: "GET",
      path: "/trips/{tripId}",
      operationId: "tripsGetOrganizationTrip",
      summary: "Get organization trip command view detail with vehicle snapshots (SCR-ORG-13)",
      tags: ["trips"],
    })
    .input(getOrganizationTripInputSchema)
    .handler(async ({ input, context }) => {
      const service = createTripsService(context.db);
      return service.getOrganizationTrip(extractTenantActor(context), input);
    }),

  browsePublicTrips: procedure
    .route({
      method: "GET",
      path: "/trips/public/browse",
      operationId: "tripsBrowsePublicTrips",
      summary:
        "Browse published and eligible trips for traveler discovery (SCR-TRV-01, FR-TRIP-02)",
      tags: ["trips"],
    })
    .input(browsePublicTripsInputSchema)
    .handler(async ({ input, context }) => {
      const service = createTripsService(context.db);
      return service.browsePublicTrips(extractViewerContext(context), input);
    }),

  getPublicTripDetail: procedure
    .route({
      method: "POST",
      path: "/trips/getPublicTripDetail",
      operationId: "tripsGetPublicTripDetail",
      summary: "Get published trip detail for traveler discovery (SCR-TRV-02, FR-TRIP-02)",
      tags: ["trips"],
    })
    .input(getPublicTripDetailInputSchema)
    .handler(async ({ input, context }) => {
      const service = createTripsService(context.db);
      return service.getPublicTripDetail(extractViewerContext(context), input);
    }),
};
