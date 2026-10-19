import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
  requireTenantScope,
} from "@trips-app/rpc";

import { mapCheckInError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapCheckInError, "check-in");

export const procedure = publicProcedure.use(mapErrors);
export const checkInAuthenticatedProcedure = authenticatedProcedure.use(mapErrors);
export const checkInOrgViewProcedure = requireTenantScope("bookings", "view").use(mapErrors);
export const checkInOrgManageProcedure = requireTenantScope("bookings", "manage").use(mapErrors);
