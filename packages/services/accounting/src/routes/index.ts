// oRPC procedures for Accounting. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/accounting/status",
      operationId: "accountingStatus",
      summary: "Accounting service health status",
      tags: ["accounting"],
    })
    .handler(() => ({ service: "accounting", status: "ok" as const })),
};
