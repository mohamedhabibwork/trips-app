// oRPC procedures for Trips. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/trips/status",
      operationId: "tripsStatus",
      summary: "Trips service health status",
      tags: ["trips"],
    })
    .handler(() => ({ service: "trips", status: "ok" as const })),
};
