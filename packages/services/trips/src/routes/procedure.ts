// Procedure for Trips. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure, requireTenantScope } from "@trips-app/rpc";

import { mapTripsError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapTripsError, "trips");

export const procedure = publicProcedure.use(mapErrors);
export const tripsViewProcedure = requireTenantScope("trips", "view").use(mapErrors);
export const tripsManageProcedure = requireTenantScope("trips", "manage").use(mapErrors);
