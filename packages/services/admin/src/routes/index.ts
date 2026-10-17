// oRPC procedures for Admin. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  previewSystemSettingsChangeSchema,
  updateSystemSettingsSchema,
} from "../schemas/validation";
import { createAdminService } from "../services";
import { anyAdminProcedure, procedure, superAdminProcedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/admin/status",
      operationId: "adminStatus",
      summary: "Admin service health status",
      tags: ["admin"],
    })
    .handler(() => ({ service: "admin", status: "ok" as const })),

  getSystemSettings: anyAdminProcedure
    .route({
      method: "GET",
      path: "/admin/getSystemSettings",
      operationId: "adminGetSystemSettings",
      summary: "Get platform system settings",
      tags: ["admin"],
    })
    .handler(({ context }) => createAdminService(context.db).getSystemSettings()),

  previewSystemSettingsChange: superAdminProcedure
    .route({
      method: "POST",
      path: "/admin/previewSystemSettingsChange",
      operationId: "adminPreviewSystemSettingsChange",
      summary: "Preview blast radius of a system settings change (D-262)",
      tags: ["admin"],
    })
    .input(previewSystemSettingsChangeSchema)
    .handler(({ context, input }) =>
      createAdminService(context.db).previewSystemSettingsChange(input),
    ),

  updateSystemSettings: superAdminProcedure
    .route({
      method: "POST",
      path: "/admin/updateSystemSettings",
      operationId: "adminUpdateSystemSettings",
      summary: "Update platform system settings with four-eyes approval (D-233)",
      tags: ["admin"],
    })
    .input(updateSystemSettingsSchema)
    .handler(({ context, input }) =>
      createAdminService(context.db).updateSystemSettings(context.auth, input, context),
    ),
};
