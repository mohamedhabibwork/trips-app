// oRPC procedures for Traveler. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/traveler/status",
      operationId: "travelerStatus",
      summary: "Traveler service health status",
      tags: ["traveler"],
    })
    .handler(() => ({ service: "traveler", status: "ok" as const })),
};
