// Procedure for Tracking. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapTrackingError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapTrackingError, "tracking");

export const procedure = publicProcedure.use(mapErrors);
