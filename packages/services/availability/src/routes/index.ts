// oRPC procedures for Availability. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  checkSupplierAvailabilityInputSchema,
  deleteAvailabilityBlockInputSchema,
  listMyBlocksInputSchema,
  upsertAvailabilityBlockInputSchema,
} from "../schemas/validation";
import { createAvailabilityService } from "../services";
import {
  authenticatedAvailabilityProcedure,
  procedure,
  supplierAvailabilityProcedure,
} from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/availability/status",
      operationId: "availabilityStatus",
      summary: "Availability service health status",
      tags: ["availability"],
    })
    .handler(() => ({ service: "availability", status: "ok" as const })),

  listMyBlocks: supplierAvailabilityProcedure
    .route({
      method: "GET",
      path: "/availability/blocks",
      operationId: "availabilityListMyBlocks",
      summary: "List availability and blackout blocks for the authenticated supplier",
      tags: ["availability"],
    })
    .input(listMyBlocksInputSchema)
    .handler(async ({ input, context }) => {
      const service = createAvailabilityService(context.db);
      return service.listMyBlocks(
        {
          accountId: context.auth.accountId,
          role: context.auth.activeRole,
          activeTenantId: context.auth.activeTenantId,
        },
        input,
      );
    }),

  upsertBlock: supplierAvailabilityProcedure
    .route({
      method: "POST",
      path: "/availability/blocks",
      operationId: "availabilityUpsertBlock",
      summary: "Create an availability or blackout block for the authenticated supplier",
      tags: ["availability"],
    })
    .input(upsertAvailabilityBlockInputSchema)
    .handler(async ({ input, context }) => {
      const service = createAvailabilityService(context.db);
      return service.upsertBlock(
        {
          accountId: context.auth.accountId,
          role: context.auth.activeRole,
          activeTenantId: context.auth.activeTenantId,
        },
        input,
      );
    }),

  deleteBlock: supplierAvailabilityProcedure
    .route({
      method: "DELETE",
      path: "/availability/blocks/{blockId}",
      operationId: "availabilityDeleteBlock",
      summary: "Delete a supplier availability block",
      tags: ["availability"],
    })
    .input(deleteAvailabilityBlockInputSchema)
    .handler(async ({ input, context }) => {
      const service = createAvailabilityService(context.db);
      return service.deleteBlock(
        {
          accountId: context.auth.accountId,
          role: context.auth.activeRole,
          activeTenantId: context.auth.activeTenantId,
        },
        input,
      );
    }),

  checkSupplierAvailability: authenticatedAvailabilityProcedure
    .route({
      method: "POST",
      path: "/availability/check",
      operationId: "availabilityCheckSupplier",
      summary: "Check whether a driver or photographer is available during a trip window",
      tags: ["availability"],
    })
    .input(checkSupplierAvailabilityInputSchema)
    .handler(async ({ input, context }) => {
      const service = createAvailabilityService(context.db);
      return service.checkSupplierAvailability(input);
    }),
};
