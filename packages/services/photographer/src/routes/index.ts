// oRPC procedures for Photographer. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/photographer/status",
      operationId: "photographerStatus",
      summary: "Photographer service health status",
      tags: ["photographer"],
    })
    .handler(() => ({ service: "photographer", status: "ok" as const })),
};
