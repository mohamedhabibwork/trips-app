// Procedure for Onboarding. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
  requireAdminSubRoles,
  requireTenantScope,
} from "@trips-app/rpc";

import { mapOnboardingError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapOnboardingError, "onboarding");

export const procedure = publicProcedure.use(mapErrors);
export const authedProcedure = authenticatedProcedure.use(mapErrors);
export const opsOrSuperAdminProcedure = requireAdminSubRoles("super_admin", "operations").use(
  mapErrors,
);
export const orgFleetManageProcedure = requireTenantScope("fleet", "manage").use(mapErrors);
