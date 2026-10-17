// Procedure for Payments. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapPaymentsError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapPaymentsError, "payments");

export const procedure = publicProcedure.use(mapErrors);
