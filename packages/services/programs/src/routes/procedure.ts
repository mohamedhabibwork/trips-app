// Procedure for Programs. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure, requireTenantScope } from "@trips-app/rpc";

import { mapProgramsError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapProgramsError, "programs");

export const procedure = publicProcedure.use(mapErrors);
export const programsViewProcedure = requireTenantScope("trips", "view").use(mapErrors);
export const programsManageProcedure = requireTenantScope("trips", "manage").use(mapErrors);
