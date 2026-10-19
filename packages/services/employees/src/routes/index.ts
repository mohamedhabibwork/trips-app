// oRPC procedures for Employees. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  acceptEmployeeInviteSchema,
  declineEmployeeInviteSchema,
  getEmployeeByIdSchema,
  inviteEmployeeSchema,
  listEmployeesSchema,
  previewEmployeeInviteSchema,
  resendEmployeeInviteSchema,
  updateEmployeePermissionsSchema,
  updateEmployeeStatusSchema,
} from "../schemas/validation";
import { createEmployeesService } from "../services";
import {
  authedProcedure,
  employeesManageProcedure,
  employeesViewProcedure,
  procedure,
} from "./procedure";

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

  list: employeesViewProcedure
    .route({
      method: "POST",
      path: "/employees/list",
      operationId: "employeesList",
      summary:
        "List organization employees with status/search filters and plan quota summary (T-EMP-01, T-EMP-07)",
      tags: ["employees"],
    })
    .input(listEmployeesSchema)
    .handler(({ context, input }) => createEmployeesService(context.db).list(context.auth, input)),

  getById: employeesViewProcedure
    .route({
      method: "POST",
      path: "/employees/getById",
      operationId: "employeesGetById",
      summary: "Get employee membership detail and recent audit log entries (T-EMP-02)",
      tags: ["employees"],
    })
    .input(getEmployeeByIdSchema)
    .handler(({ context, input }) =>
      createEmployeesService(context.db).getById(context.auth, input),
    ),

  invite: employeesManageProcedure
    .route({
      method: "POST",
      path: "/employees/invite",
      operationId: "employeesInvite",
      summary:
        "Invite an employee to the active organization with 9-area permissions and quota check (T-EMP-03, T-EMP-07)",
      tags: ["employees"],
    })
    .input(inviteEmployeeSchema)
    .handler(({ context, input }) =>
      createEmployeesService(context.db).invite(context.auth, input, context),
    ),

  resendInvite: employeesManageProcedure
    .route({
      method: "POST",
      path: "/employees/resendInvite",
      operationId: "employeesResendInvite",
      summary:
        "Rotate invitation token and extend 7-day expiry for a pending employee invite (T-EMP-03)",
      tags: ["employees"],
    })
    .input(resendEmployeeInviteSchema)
    .handler(({ context, input }) =>
      createEmployeesService(context.db).resendInvite(context.auth, input, context),
    ),

  previewInvite: procedure
    .route({
      method: "POST",
      path: "/employees/previewInvite",
      operationId: "employeesPreviewInvite",
      summary: "Read an employee invitation by its email-link token, before sign-in (SCR-ORG-02)",
      tags: ["employees"],
    })
    .input(previewEmployeeInviteSchema)
    .handler(({ context, input }) => createEmployeesService(context.db).previewInvite(input)),

  declineInvite: procedure
    .route({
      method: "POST",
      path: "/employees/declineInvite",
      operationId: "employeesDeclineInvite",
      summary: "Decline an employee invitation by its email-link token (SCR-ORG-02)",
      tags: ["employees"],
    })
    .input(declineEmployeeInviteSchema)
    .handler(({ context, input }) =>
      createEmployeesService(context.db).declineInvite(context.auth ?? null, input, context),
    ),

  acceptInvite: authedProcedure
    .route({
      method: "POST",
      path: "/employees/acceptInvite",
      operationId: "employeesAcceptInvite",
      summary: "Accept an organization employee invitation and activate membership (T-EMP-04)",
      tags: ["employees"],
    })
    .input(acceptEmployeeInviteSchema)
    .handler(({ context, input }) =>
      createEmployeesService(context.db).acceptInvite(context.auth, input, context),
    ),

  updatePermissions: employeesManageProcedure
    .route({
      method: "POST",
      path: "/employees/updatePermissions",
      operationId: "employeesUpdatePermissions",
      summary: "Update employee role title and 9-area permission matrix (T-EMP-06)",
      tags: ["employees"],
    })
    .input(updateEmployeePermissionsSchema)
    .handler(({ context, input }) =>
      createEmployeesService(context.db).updatePermissions(context.auth, input, context),
    ),

  updateStatus: employeesManageProcedure
    .route({
      method: "POST",
      path: "/employees/updateStatus",
      operationId: "employeesUpdateStatus",
      summary:
        "Suspend, reactivate, or revoke an employee membership and immediately revoke active sessions (T-EMP-05)",
      tags: ["employees"],
    })
    .input(updateEmployeeStatusSchema)
    .handler(({ context, input }) =>
      createEmployeesService(context.db).updateStatus(context.auth, input, context),
    ),
};
