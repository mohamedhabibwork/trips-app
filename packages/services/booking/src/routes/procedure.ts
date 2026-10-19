import {
  authenticatedProcedure,
  createServiceErrorMiddleware,
  publicProcedure,
  requireTenantScope,
} from "@trips-app/rpc";

import { mapBookingError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapBookingError, "booking");

export const procedure = publicProcedure.use(mapErrors);
export const bookingAuthenticatedProcedure = authenticatedProcedure.use(mapErrors);
export const bookingOrgViewProcedure = requireTenantScope("bookings", "view").use(mapErrors);
