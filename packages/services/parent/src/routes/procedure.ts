// Procedure for Parent. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapParentError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapParentError, "parent");

export const procedure = publicProcedure.use(mapErrors);
