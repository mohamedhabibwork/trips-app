// oRPC procedures for Employees. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import { procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/employees/status",
      operationId: "employeesStatus",
      summary: "Employees service health status",
      tags: ["employees"],
    })
    .handler(() => ({ service: "employees", status: "ok" as const })),
};
