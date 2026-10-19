import { publicProcedure } from "../index";
import type { AppRouter, AppRouterClient } from "../types";
import { lookupsRouter } from "./lookups";
import { serviceRouters } from "./services";
import { travelerAccountRouter } from "./traveler-account";
import { travelerAlbumsRouter } from "./traveler-media";
import { travelerReceiptsRouter } from "./traveler-receipts";
import { travelerTripDayRouter } from "./traveler-trip-day";

export type { AppRouter, AppRouterClient };

export const appRouter = {
  healthCheck: publicProcedure
    .route({
      method: "GET",
      path: "/healthCheck",
      operationId: "healthCheck",
      summary: "Platform API health check",
      description: "Returns OK when the Trips Enjoy backend API is healthy.",
      tags: ["system"],
    })
    .handler(() => {
      return "OK";
    }),
  lookups: lookupsRouter,
  ...serviceRouters,
  traveler: {
    // Profile/notification/plan-overview/privacy surface from the traveler service.
    ...serviceRouters.traveler,
    tripDay: travelerTripDayRouter,
    albums: travelerAlbumsRouter,
    receipts: travelerReceiptsRouter,
    account: travelerAccountRouter,
  },
  organization: {
    ...serviceRouters.organization,
    employees: {
      list: serviceRouters.employees.list.route({
        method: "POST",
        path: "/organization/employees/list",
        operationId: "organizationEmployeesList",
        summary: "Backward-compatible alias for /employees/list",
        tags: ["organization"],
      }),
      getById: serviceRouters.employees.getById.route({
        method: "POST",
        path: "/organization/employees/getById",
        operationId: "organizationEmployeesGetById",
        summary: "Backward-compatible alias for /employees/getById",
        tags: ["organization"],
      }),
      invite: serviceRouters.employees.invite.route({
        method: "POST",
        path: "/organization/employees/invite",
        operationId: "organizationEmployeesInvite",
        summary: "Backward-compatible alias for /employees/invite",
        tags: ["organization"],
      }),
      resendInvite: serviceRouters.employees.resendInvite.route({
        method: "POST",
        path: "/organization/employees/resendInvite",
        operationId: "organizationEmployeesResendInvite",
        summary: "Backward-compatible alias for /employees/resendInvite",
        tags: ["organization"],
      }),
      acceptInvite: serviceRouters.employees.acceptInvite.route({
        method: "POST",
        path: "/organization/employees/acceptInvite",
        operationId: "organizationEmployeesAcceptInvite",
        summary: "Backward-compatible alias for /employees/acceptInvite",
        tags: ["organization"],
      }),
      updatePermissions: serviceRouters.employees.updatePermissions.route({
        method: "POST",
        path: "/organization/employees/updatePermissions",
        operationId: "organizationEmployeesUpdatePermissions",
        summary: "Backward-compatible alias for /employees/updatePermissions",
        tags: ["organization"],
      }),
      updateStatus: serviceRouters.employees.updateStatus.route({
        method: "POST",
        path: "/organization/employees/updateStatus",
        operationId: "organizationEmployeesUpdateStatus",
        summary: "Backward-compatible alias for /employees/updateStatus",
        tags: ["organization"],
      }),
    },
  },
};
