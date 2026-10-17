// Procedure for Booking. Extends the shared publicProcedure from @trips-app/rpc; add this service's middleware and error definitions here.
import { createServiceErrorMiddleware, publicProcedure } from "@trips-app/rpc";

import { mapBookingError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapBookingError, "booking");

export const procedure = publicProcedure.use(mapErrors);
