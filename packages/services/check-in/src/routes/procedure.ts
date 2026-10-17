// Procedure for Check In. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapCheckInError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapCheckInError, "check-in");

export const procedure = publicProcedure.use(mapErrors);
