// oRPC procedures for Plans. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/plans/status",
      operationId: "plansStatus",
      summary: "Plans service health status",
      tags: ["plans"],
    })
    .handler(() => ({ service: "plans", status: "ok" as const })),
};
