// Procedure for Fleet. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import {
  createServiceErrorMiddleware,
  publicProcedure,
  requireAdminSubRoles,
  requireTenantScope,
} from "@trips-app/rpc";

import { mapFleetError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapFleetError, "fleet");

export const procedure = publicProcedure.use(mapErrors);
export const fleetViewProcedure = requireTenantScope("fleet", "view").use(mapErrors);
export const fleetManageProcedure = requireTenantScope("fleet", "manage").use(mapErrors);
export const fleetPlatformAdminProcedure = requireAdminSubRoles("super_admin", "operations").use(
  mapErrors,
);
