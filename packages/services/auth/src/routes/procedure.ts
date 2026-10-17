// Procedure for Auth. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
  requireAdminSubRoles,
  requireRoles,
  requireTenantScope,
} from "@trips-app/rpc";

import { mapAuthError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapAuthError, "auth");

export const procedure = publicProcedure.use(mapErrors);
export const authedProcedure = authenticatedProcedure.use(mapErrors);
export const superAdminProcedure = requireAdminSubRoles("super_admin").use(mapErrors);
export const opsOrSuperAdminProcedure = requireAdminSubRoles("super_admin", "operations").use(
  mapErrors,
);
export const orgEmployeeManageProcedure = requireTenantScope("employees", "manage").use(mapErrors);
export { requireRoles };
