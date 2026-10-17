// Procedure for Traveler. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapTravelerError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapTravelerError, "traveler");

export const procedure = publicProcedure.use(mapErrors);
