// oRPC procedures for Programs. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  createProgramInputSchema,
  deleteProgramInputSchema,
  listPublicTripProgramsInputSchema,
  listTripProgramsInputSchema,
  updateProgramInputSchema,
} from "../schemas/validation";
import { createProgramsService } from "../services";
import type { ProgramsTenantActorContext } from "../types";
import { procedure, programsManageProcedure, programsViewProcedure } from "./procedure";

function extractTenantActor(context: {
  auth: {
    accountId: string;
    activeRole: ProgramsTenantActorContext["role"];
    activeTenantId: string;
  };
  ipAddress?: string | null;
  requestId?: string | null;
}): ProgramsTenantActorContext {
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
      path: "/programs/status",
      operationId: "programsStatus",
      summary: "Programs service health status",
      tags: ["programs"],
    })
    .handler(() => ({ service: "programs", status: "ok" as const })),

  createProgram: programsManageProcedure
    .route({
      method: "POST",
      path: "/programs",
      operationId: "programsCreate",
      summary: "Create a trip program activity item with plan limit checks (SCR-ORG-11 Step 5)",
      tags: ["programs"],
    })
    .input(createProgramInputSchema)
    .handler(async ({ input, context }) => {
      const service = createProgramsService(context.db);
      return service.createProgram(extractTenantActor(context), input);
    }),

  updateProgram: programsManageProcedure
    .route({
      method: "PATCH",
      path: "/programs/{programId}",
      operationId: "programsUpdate",
      summary: "Update a trip program activity item (SCR-ORG-11 Step 5)",
      tags: ["programs"],
    })
    .input(updateProgramInputSchema)
    .handler(async ({ input, context }) => {
      const service = createProgramsService(context.db);
      return service.updateProgram(extractTenantActor(context), input);
    }),

  deleteProgram: programsManageProcedure
    .route({
      method: "DELETE",
      path: "/programs/{programId}",
      operationId: "programsDelete",
      summary: "Delete a trip program activity item (SCR-ORG-11 Step 5)",
      tags: ["programs"],
    })
    .input(deleteProgramInputSchema)
    .handler(async ({ input, context }) => {
      const service = createProgramsService(context.db);
      return service.deleteProgram(extractTenantActor(context), input);
    }),

  listTripPrograms: programsViewProcedure
    .route({
      method: "GET",
      path: "/programs/trip/{tripId}",
      operationId: "programsListForTrip",
      summary: "List trip programs for an organization trip (SCR-ORG-11, SCR-ORG-13)",
      tags: ["programs"],
    })
    .input(listTripProgramsInputSchema)
    .handler(async ({ input, context }) => {
      const service = createProgramsService(context.db);
      return service.listTripPrograms(extractTenantActor(context), input);
    }),

  listPublicTripPrograms: procedure
    .route({
      method: "POST",
      path: "/programs/listPublicTripPrograms",
      operationId: "programsListPublicForTrip",
      summary: "List active trip programs for traveler trip detail (SCR-TRV-02)",
      tags: ["programs"],
    })
    .input(listPublicTripProgramsInputSchema)
    .handler(async ({ input, context }) => {
      const service = createProgramsService(context.db);
      return service.listPublicTripPrograms(input);
    }),
};
