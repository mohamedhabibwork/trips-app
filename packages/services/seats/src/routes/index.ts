// oRPC procedures for Seats. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  assignSeatByOrgInputSchema,
  getSeatMapInputSchema,
  holdSeatsInputSchema,
  releaseSeatHoldInputSchema,
} from "../schemas/validation";
import { createSeatsService } from "../services";
import { procedure, seatsAuthenticatedProcedure, seatsOrgManageProcedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/seats/status",
      operationId: "seatsStatus",
      summary: "Seats service health status",
      tags: ["seats"],
    })
    .handler(() => ({ service: "seats", status: "ok" as const })),

  getSeatMap: seatsAuthenticatedProcedure
    .route({
      method: "GET",
      path: "/seats/map",
      operationId: "seatsGetMap",
      summary: "Get live seat map and availability for a trip vehicle (SCR-TRV-04, SCR-ORG-19)",
      tags: ["seats"],
    })
    .input(getSeatMapInputSchema)
    .handler(async ({ input, context }) => {
      const service = createSeatsService(context.db);
      return service.getSeatMap(
        {
          accountId: context.auth.accountId,
          role: context.auth.activeRole,
          activeTenantId: context.auth.activeTenantId,
          planTier: context.auth.planTier,
        },
        input,
      );
    }),

  holdSeats: seatsAuthenticatedProcedure
    .route({
      method: "POST",
      path: "/seats/hold",
      operationId: "seatsHold",
      summary: "Place a 15-minute hold on selected seats for booking checkout (SCR-TRV-04)",
      tags: ["seats"],
    })
    .input(holdSeatsInputSchema)
    .handler(async ({ input, context }) => {
      const service = createSeatsService(context.db);
      return service.holdSeats(
        {
          accountId: context.auth.accountId,
          role: context.auth.activeRole,
          activeTenantId: context.auth.activeTenantId,
          planTier: context.auth.planTier,
        },
        input,
      );
    }),

  releaseHold: seatsAuthenticatedProcedure
    .route({
      method: "POST",
      path: "/seats/release",
      operationId: "seatsReleaseHold",
      summary: "Release held seats on a trip vehicle (SCR-TRV-04)",
      tags: ["seats"],
    })
    .input(releaseSeatHoldInputSchema)
    .handler(async ({ input, context }) => {
      const service = createSeatsService(context.db);
      return service.releaseHold(
        {
          accountId: context.auth.accountId,
          role: context.auth.activeRole,
          activeTenantId: context.auth.activeTenantId,
          planTier: context.auth.planTier,
        },
        input,
      );
    }),

  assignSeatByOrganization: seatsOrgManageProcedure
    .route({
      method: "POST",
      path: "/seats/assign",
      operationId: "seatsAssignByOrganization",
      summary:
        "Manually assign, reserve, or block a seat on a trip vehicle (SCR-ORG-19, SCR-ORG-20)",
      tags: ["seats"],
    })
    .input(assignSeatByOrgInputSchema)
    .handler(async ({ input, context }) => {
      const service = createSeatsService(context.db);
      return service.assignSeatByOrganization(
        {
          accountId: context.auth.accountId,
          role: context.auth.activeRole,
          activeTenantId: context.auth.activeTenantId,
          planTier: context.auth.planTier,
        },
        input,
      );
    }),
};
