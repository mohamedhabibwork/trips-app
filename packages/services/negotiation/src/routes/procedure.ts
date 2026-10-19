// Procedure for Negotiation. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
  requireRoles,
  requireTenantScope,
} from "@trips-app/rpc";

import { mapNegotiationError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapNegotiationError, "negotiation");

export const procedure = publicProcedure.use(mapErrors);
export const negotiationOrgViewProcedure = requireTenantScope("fleet", "view").use(mapErrors);
export const negotiationOrgManageProcedure = requireTenantScope("fleet", "manage").use(mapErrors);
export const negotiationSupplierProcedure = requireRoles(
  "platform_driver",
  "platform_photographer",
).use(mapErrors);
export const negotiationRespondProcedure = authenticatedProcedure.use(mapErrors);
