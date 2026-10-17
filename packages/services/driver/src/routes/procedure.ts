// Procedure for Driver. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapDriverError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapDriverError, "driver");

export const procedure = publicProcedure.use(mapErrors);
