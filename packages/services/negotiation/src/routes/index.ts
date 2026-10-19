// oRPC procedures for Negotiation. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  createNegotiationOfferInputSchema,
  listNegotiationsInputSchema,
  respondNegotiationOfferInputSchema,
} from "../schemas/validation";
import { createNegotiationService } from "../services";
import {
  negotiationOrgManageProcedure,
  negotiationOrgViewProcedure,
  negotiationRespondProcedure,
  negotiationSupplierProcedure,
  procedure,
} from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/negotiation/status",
      operationId: "negotiationStatus",
      summary: "Negotiation service health status",
      tags: ["negotiation"],
    })
    .handler(() => ({ service: "negotiation", status: "ok" as const })),

  createOffer: negotiationOrgManageProcedure
    .route({
      method: "POST",
      path: "/negotiation/offers",
      operationId: "negotiationCreateOffer",
      summary: "Initiate a marketplace negotiation offer with a platform supplier (SCR-ORG-16)",
      tags: ["negotiation"],
    })
    .input(createNegotiationOfferInputSchema)
    .handler(async ({ input, context }) => {
      const service = createNegotiationService(context.db);
      return service.createOffer(
        {
          accountId: context.auth.accountId,
          role: context.auth.activeRole,
          activeTenantId: context.auth.activeTenantId,
        },
        input,
      );
    }),

  respondToOffer: negotiationRespondProcedure
    .route({
      method: "POST",
      path: "/negotiation/offers/{negotiationId}/respond",
      operationId: "negotiationRespondToOffer",
      summary:
        "Accept, counter, decline, or cancel a marketplace negotiation offer (SCR-ORG-17, SCR-DRV-04)",
      tags: ["negotiation"],
    })
    .input(respondNegotiationOfferInputSchema)
    .handler(async ({ input, context }) => {
      const service = createNegotiationService(context.db);
      return service.respondToOffer(
        {
          accountId: context.auth.accountId,
          role: context.auth.activeRole,
          activeTenantId: context.auth.activeTenantId,
        },
        input,
      );
    }),

  listOrganizationNegotiations: negotiationOrgViewProcedure
    .route({
      method: "GET",
      path: "/negotiation/organization",
      operationId: "negotiationListOrganization",
      summary: "List marketplace negotiations for the active organization (SCR-ORG-16)",
      tags: ["negotiation"],
    })
    .input(listNegotiationsInputSchema)
    .handler(async ({ input, context }) => {
      const service = createNegotiationService(context.db);
      return service.listOrganizationNegotiations(
        {
          accountId: context.auth.accountId,
          role: context.auth.activeRole,
          activeTenantId: context.auth.activeTenantId,
        },
        input,
      );
    }),

  listSupplierOffers: negotiationSupplierProcedure
    .route({
      method: "GET",
      path: "/negotiation/supplier",
      operationId: "negotiationListSupplierOffers",
      summary: "List incoming trip negotiation offers for the authenticated supplier (SCR-DRV-03)",
      tags: ["negotiation"],
    })
    .input(listNegotiationsInputSchema)
    .handler(async ({ input, context }) => {
      const service = createNegotiationService(context.db);
      return service.listSupplierOffers(
        {
          accountId: context.auth.accountId,
          role: context.auth.activeRole,
          activeTenantId: context.auth.activeTenantId,
        },
        input,
      );
    }),
};
