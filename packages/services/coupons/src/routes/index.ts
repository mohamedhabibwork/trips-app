// oRPC procedures for Coupons. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/coupons/status",
      operationId: "couponsStatus",
      summary: "Coupons service health status",
      tags: ["coupons"],
    })
    .handler(() => ({ service: "coupons", status: "ok" as const })),
};
