// oRPC procedures for Parent. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/parent/status",
      operationId: "parentStatus",
      summary: "Parent service health status",
      tags: ["parent"],
    })
    .handler(() => ({ service: "parent", status: "ok" as const })),
};
