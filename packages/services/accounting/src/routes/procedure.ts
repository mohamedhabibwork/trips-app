// Procedure for Accounting. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapAccountingError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapAccountingError, "accounting");

export const procedure = publicProcedure.use(mapErrors);
