// oRPC procedures for Staffing. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  assignVehicleStaffInputSchema,
  issueModeratorStaffCodeInputSchema,
  listTripStaffingInputSchema,
  revokeModeratorAssignmentInputSchema,
} from "../schemas/validation";
import { createStaffingService } from "../services";
import type { StaffingTenantActorContext } from "../types";
import { procedure, staffingManageProcedure, staffingViewProcedure } from "./procedure";

function extractTenantActor(context: {
  auth: {
    accountId: string;
    activeRole: StaffingTenantActorContext["role"];
    activeTenantId: string;
  };
  ipAddress?: string | null;
  requestId?: string | null;
}): StaffingTenantActorContext {
  return {
    accountId: context.auth.accountId,
    role: context.auth.activeRole,
    activeTenantId: context.auth.activeTenantId,
    ipAddress: context.ipAddress ?? null,
    requestId: context.requestId ?? null,
  };
}

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/staffing/status",
      operationId: "staffingStatus",
      summary: "Staffing service health status",
      tags: ["staffing"],
    })
    .handler(() => ({ service: "staffing", status: "ok" as const })),

  listTripStaffing: staffingViewProcedure
    .route({
      method: "GET",
      path: "/staffing/trip/{tripId}",
      operationId: "staffingListForTrip",
      summary:
        "List vehicle staff assignments and moderator codes for a trip (SCR-ORG-12, SCR-ORG-15)",
      tags: ["staffing"],
    })
    .input(listTripStaffingInputSchema)
    .handler(async ({ input, context }) => {
      const service = createStaffingService(context.db);
      return service.listTripStaffing(extractTenantActor(context), input);
    }),

  assignVehicleStaff: staffingManageProcedure
    .route({
      method: "POST",
      path: "/staffing/assign",
      operationId: "staffingAssignVehicleStaff",
      summary:
        "Assign driver, moderator, and photographer to a trip vehicle (SCR-ORG-11 Step 4, SCR-ORG-15)",
      tags: ["staffing"],
    })
    .input(assignVehicleStaffInputSchema)
    .handler(async ({ input, context }) => {
      const service = createStaffingService(context.db);
      return service.assignVehicleStaff(extractTenantActor(context), input);
    }),

  issueModeratorStaffCode: staffingManageProcedure
    .route({
      method: "POST",
      path: "/staffing/moderator-codes",
      operationId: "staffingIssueModeratorCode",
      summary: "Issue a 6-digit vehicle moderator staff code for a trip vehicle (SCR-ORG-15)",
      tags: ["staffing"],
    })
    .input(issueModeratorStaffCodeInputSchema)
    .handler(async ({ input, context }) => {
      const service = createStaffingService(context.db);
      return service.issueModeratorStaffCode(extractTenantActor(context), input);
    }),

  revokeModeratorAssignment: staffingManageProcedure
    .route({
      method: "POST",
      path: "/staffing/moderator-codes/{assignmentId}/revoke",
      operationId: "staffingRevokeModeratorAssignment",
      summary: "Revoke a vehicle moderator assignment and staff code (SCR-ORG-15)",
      tags: ["staffing"],
    })
    .input(revokeModeratorAssignmentInputSchema)
    .handler(async ({ input, context }) => {
      const service = createStaffingService(context.db);
      return service.revokeModeratorAssignment(extractTenantActor(context), input);
    }),
};
