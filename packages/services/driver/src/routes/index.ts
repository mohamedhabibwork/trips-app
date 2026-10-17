// oRPC procedures for Driver. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/driver/status",
      operationId: "driverStatus",
      summary: "Driver service health status",
      tags: ["driver"],
    })
    .handler(() => ({ service: "driver", status: "ok" as const })),
};
