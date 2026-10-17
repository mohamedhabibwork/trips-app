// Procedure for Availability. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapAvailabilityError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapAvailabilityError, "availability");

export const procedure = publicProcedure.use(mapErrors);
