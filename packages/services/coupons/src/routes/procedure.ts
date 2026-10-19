// Procedure for Coupons. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
  requireAdminSubRoles,
  requireTenantScope,
} from "@trips-app/rpc";

import { mapCouponsError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapCouponsError, "coupons");

export const procedure = publicProcedure.use(mapErrors);
export const couponsOrgViewProcedure = requireTenantScope("coupons", "view").use(mapErrors);
export const couponsOrgManageProcedure = requireTenantScope("coupons", "manage").use(mapErrors);
export const couponsAdminProcedure = requireAdminSubRoles(
  "super_admin",
  "operations",
  "finance",
).use(mapErrors);
export const couponsAuthenticatedProcedure = authenticatedProcedure.use(mapErrors);
