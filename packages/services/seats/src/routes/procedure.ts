// Procedure for Seats. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
  requireTenantScope,
} from "@trips-app/rpc";

import { mapSeatsError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapSeatsError, "seats");

export const procedure = publicProcedure.use(mapErrors);
export const seatsAuthenticatedProcedure = authenticatedProcedure.use(mapErrors);
export const seatsOrgManageProcedure = requireTenantScope("trips", "manage").use(mapErrors);
