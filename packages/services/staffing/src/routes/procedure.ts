// Procedure for Staffing. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapStaffingError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapStaffingError, "staffing");

export const procedure = publicProcedure.use(mapErrors);
