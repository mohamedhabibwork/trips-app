// Procedure for Photographer. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapPhotographerError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapPhotographerError, "photographer");

export const procedure = publicProcedure.use(mapErrors);
