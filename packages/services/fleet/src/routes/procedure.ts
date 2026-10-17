// Procedure for Fleet. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapFleetError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapFleetError, "fleet");

export const procedure = publicProcedure.use(mapErrors);
