// oRPC procedures for Availability. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/availability/status",
      operationId: "availabilityStatus",
      summary: "Availability service health status",
      tags: ["availability"],
    })
    .handler(() => ({ service: "availability", status: "ok" as const })),
};
