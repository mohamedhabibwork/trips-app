import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
  requireAdminSubRoles,
  requireTenantScope,
} from "@trips-app/rpc";

import { mapPlansError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapPlansError, "plans");

export const procedure = publicProcedure.use(mapErrors);
export const plansAuthenticatedProcedure = authenticatedProcedure.use(mapErrors);
export const plansOrgViewProcedure = requireTenantScope("subscription", "view").use(mapErrors);
export const plansOrgManageProcedure = requireTenantScope("subscription", "manage").use(mapErrors);
export const plansAdminProcedure = requireAdminSubRoles("finance", "operations", "super_admin").use(
  mapErrors,
);
