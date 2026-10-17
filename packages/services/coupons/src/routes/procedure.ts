// Procedure for Coupons. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapCouponsError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapCouponsError, "coupons");

export const procedure = publicProcedure.use(mapErrors);
