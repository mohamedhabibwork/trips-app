// Procedure for Negotiation. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapNegotiationError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapNegotiationError, "negotiation");

export const procedure = publicProcedure.use(mapErrors);
