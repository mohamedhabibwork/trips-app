// Procedure for Moderator. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapModeratorError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapModeratorError, "moderator");

export const procedure = publicProcedure.use(mapErrors);
