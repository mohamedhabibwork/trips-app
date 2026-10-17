// oRPC procedures for Fleet. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/fleet/status",
      operationId: "fleetStatus",
      summary: "Fleet service health status",
      tags: ["fleet"],
    })
    .handler(() => ({ service: "fleet", status: "ok" as const })),
};
