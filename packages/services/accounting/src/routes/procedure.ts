import {
  createServiceErrorMiddleware,
  publicProcedure,
  requireAdminSubRoles,
  requireTenantScope,
} from "@trips-app/rpc";

import { mapAccountingError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapAccountingError, "accounting");

export const procedure = publicProcedure.use(mapErrors);
export const accountingOrgViewProcedure = requireTenantScope("accounting", "view").use(mapErrors);
export const accountingOrgManageProcedure = requireTenantScope("accounting", "manage").use(
  mapErrors,
);
export const accountingAdminProcedure = requireAdminSubRoles(
  "finance",
  "operations",
  "super_admin",
).use(mapErrors);
