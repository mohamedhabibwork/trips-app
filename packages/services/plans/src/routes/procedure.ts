// Procedure for Plans. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapPlansError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapPlansError, "plans");

export const procedure = publicProcedure.use(mapErrors);
