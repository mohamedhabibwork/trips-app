// oRPC procedures for Fleet. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  createPlatformVehicleTypeInputSchema,
  createVehicleInputSchema,
  createVehicleTypeInputSchema,
  getVehicleInputSchema,
  listVehiclesInputSchema,
  listVehicleTypesInputSchema,
  removeVehicleInputSchema,
  updateVehicleInputSchema,
  updateVehicleTypeInputSchema,
} from "../schemas/validation";
import { createFleetService } from "../services";
import type { FleetAdminActorContext, FleetTenantActorContext } from "../types";
import {
  fleetManageProcedure,
  fleetPlatformAdminProcedure,
  fleetViewProcedure,
  procedure,
} from "./procedure";

function extractTenantActor(context: {
  auth: {
    accountId: string;
    activeRole: FleetTenantActorContext["role"];
    activeTenantId: string;
  };
  ipAddress?: string | null;
  requestId?: string | null;
}): FleetTenantActorContext {
  return {
    accountId: context.auth.accountId,
    role: context.auth.activeRole,
    activeTenantId: context.auth.activeTenantId,
    ipAddress: context.ipAddress ?? null,
    requestId: context.requestId ?? null,
  };
}

function extractAdminActor(context: {
  auth: {
    accountId: string;
    activeRole: FleetAdminActorContext["role"];
    adminSubRole?: FleetAdminActorContext["adminSubRole"] | null;
  };
  ipAddress?: string | null;
  requestId?: string | null;
}): FleetAdminActorContext {
  return {
    accountId: context.auth.accountId,
    role: context.auth.activeRole,
    adminSubRole: context.auth.adminSubRole ?? "super_admin",
    ipAddress: context.ipAddress ?? null,
    requestId: context.requestId ?? null,
  };
}

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/fleet/status",
      operationId: "fleetStatus",
      summary: "Fleet service health status",
      tags: ["fleet"],
    })
    .handler(() => ({ service: "fleet", status: "ok" as const })),

  listVehicleTypes: fleetViewProcedure
    .route({
      method: "GET",
      path: "/fleet/vehicle-types",
      operationId: "fleetListVehicleTypes",
      summary: "List platform-wide and organization-owned vehicle types (T-FLT-05)",
      tags: ["fleet"],
    })
    .input(listVehicleTypesInputSchema)
    .handler(async ({ input, context }) => {
      const service = createFleetService(context.db);
      return service.listVehicleTypes(extractTenantActor(context), input);
    }),

  createVehicleType: fleetManageProcedure
    .route({
      method: "POST",
      path: "/fleet/vehicle-types",
      operationId: "fleetCreateVehicleType",
      summary: "Create an organization vehicle type with 2D seat layout (SCR-ORG-09)",
      tags: ["fleet"],
    })
    .input(createVehicleTypeInputSchema)
    .handler(async ({ input, context }) => {
      const service = createFleetService(context.db);
      return service.createVehicleType(extractTenantActor(context), input);
    }),

  createPlatformVehicleType: fleetPlatformAdminProcedure
    .route({
      method: "POST",
      path: "/fleet/platform-vehicle-types",
      operationId: "fleetCreatePlatformVehicleType",
      summary: "Create a platform-wide vehicle type template (T-FLT-05)",
      tags: ["fleet"],
    })
    .input(createPlatformVehicleTypeInputSchema)
    .handler(async ({ input, context }) => {
      const service = createFleetService(context.db);
      return service.createPlatformVehicleType(extractAdminActor(context), input);
    }),

  updateVehicleType: fleetManageProcedure
    .route({
      method: "PATCH",
      path: "/fleet/vehicle-types/{vehicleTypeId}",
      operationId: "fleetUpdateVehicleType",
      summary: "Update or archive an organization-owned vehicle type (SCR-ORG-09)",
      tags: ["fleet"],
    })
    .input(updateVehicleTypeInputSchema)
    .handler(async ({ input, context }) => {
      const service = createFleetService(context.db);
      return service.updateVehicleType(extractTenantActor(context), input);
    }),

  listVehicles: fleetViewProcedure
    .route({
      method: "GET",
      path: "/fleet/vehicles",
      operationId: "fleetListVehicles",
      summary: "List organization vehicles with joined vehicleType and booking counts (SCR-ORG-07)",
      tags: ["fleet"],
    })
    .input(listVehiclesInputSchema)
    .handler(async ({ input, context }) => {
      const service = createFleetService(context.db);
      return service.listVehicles(extractTenantActor(context), input);
    }),

  getVehicle: fleetViewProcedure
    .route({
      method: "GET",
      path: "/fleet/vehicles/{vehicleId}",
      operationId: "fleetGetVehicle",
      summary: "Get organization vehicle detail with vehicleType and booking counts (SCR-ORG-08)",
      tags: ["fleet"],
    })
    .input(getVehicleInputSchema)
    .handler(async ({ input, context }) => {
      const service = createFleetService(context.db);
      return service.getVehicle(extractTenantActor(context), input);
    }),

  createVehicle: fleetManageProcedure
    .route({
      method: "POST",
      path: "/fleet/vehicles",
      operationId: "fleetCreateVehicle",
      summary: "Register a vehicle in the organization fleet (SCR-ORG-08, T-FLT-04)",
      tags: ["fleet"],
    })
    .input(createVehicleInputSchema)
    .handler(async ({ input, context }) => {
      const service = createFleetService(context.db);
      return service.createVehicle(extractTenantActor(context), input);
    }),

  updateVehicle: fleetManageProcedure
    .route({
      method: "PATCH",
      path: "/fleet/vehicles/{vehicleId}",
      operationId: "fleetUpdateVehicle",
      summary: "Update an organization vehicle and link uploaded media (SCR-ORG-08, T-FLT-04)",
      tags: ["fleet"],
    })
    .input(updateVehicleInputSchema)
    .handler(async ({ input, context }) => {
      const service = createFleetService(context.db);
      return service.updateVehicle(extractTenantActor(context), input);
    }),

  removeVehicle: fleetManageProcedure
    .route({
      method: "DELETE",
      path: "/fleet/vehicles/{vehicleId}",
      operationId: "fleetRemoveVehicle",
      summary: "Retire a vehicle if not assigned to active or booked trips (SCR-ORG-07)",
      tags: ["fleet"],
    })
    .input(removeVehicleInputSchema)
    .handler(async ({ input, context }) => {
      const service = createFleetService(context.db);
      return service.removeVehicle(extractTenantActor(context), input);
    }),
};
