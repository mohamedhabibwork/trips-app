import {
  createServiceErrorMiddleware,
  publicProcedure,
  requireModeratorVehicleScope,
} from "@trips-app/rpc";

import { mapModeratorError } from "../errors";

const mapErrors = createServiceErrorMiddleware(mapModeratorError, "moderator");

export const procedure = publicProcedure.use(mapErrors);
export const moderatorVehicleProcedure = requireModeratorVehicleScope().use(mapErrors);
