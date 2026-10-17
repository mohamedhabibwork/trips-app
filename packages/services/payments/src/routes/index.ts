// oRPC procedures for Payments. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/payments/status",
      operationId: "paymentsStatus",
      summary: "Payments service health status",
      tags: ["payments"],
    })
    .handler(() => ({ service: "payments", status: "ok" as const })),
};
