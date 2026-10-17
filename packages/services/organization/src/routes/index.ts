// oRPC procedures for Organization. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  configureWebhooksSchema,
  getOrganizationSettingsSchema,
  updateOrganizationSettingsSchema,
} from "../schemas/validation";
import { createOrganizationService } from "../services";
import { orgSettingsManageProcedure, orgSettingsViewProcedure, procedure } from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/organization/status",
      operationId: "organizationStatus",
      summary: "Organization service health status",
      tags: ["organization"],
    })
    .handler(() => ({ service: "organization", status: "ok" as const })),

  getOrganizationSettings: orgSettingsViewProcedure
    .route({
      method: "POST",
      path: "/organization/getOrganizationSettings",
      operationId: "organizationGetSettings",
      summary: "Get tenant-scoped organization settings (FR-ORG-01..05)",
      tags: ["organization"],
    })
    .input(getOrganizationSettingsSchema)
    .handler(({ context, input }) =>
      createOrganizationService(context.db).getOrganizationSettings(context.auth, input),
    ),

  updateOrganizationSettings: orgSettingsManageProcedure
    .route({
      method: "POST",
      path: "/organization/updateOrganizationSettings",
      operationId: "organizationUpdateSettings",
      summary: "Update organization settings with server-side plan gating (CON-06)",
      tags: ["organization"],
    })
    .input(updateOrganizationSettingsSchema)
    .handler(({ context, input }) =>
      createOrganizationService(context.db).updateOrganizationSettings(
        context.auth,
        input,
        context,
      ),
    ),

  configureWebhooks: orgSettingsManageProcedure
    .route({
      method: "POST",
      path: "/organization/configureWebhooks",
      operationId: "organizationConfigureWebhooks",
      summary: "Configure outbound CRM and webhook endpoints (D-18)",
      tags: ["organization"],
    })
    .input(configureWebhooksSchema)
    .handler(({ context, input }) =>
      createOrganizationService(context.db).configureWebhooks(context.auth, input, context),
    ),
};
