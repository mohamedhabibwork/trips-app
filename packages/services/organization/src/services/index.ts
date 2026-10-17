// Business logic for Organization. Routes call this factory with context.db; repositories are created here.
import { OrganizationServiceError } from "../errors";
import {
  createDefaultOrganizationSettings,
  findPlanCatalogEntry,
  generateRandomToken,
  hashSha256,
  type OrganizationWebhookEndpoint,
  type UserRole,
  validateOrganizationSettingsAgainstPlan,
} from "../model";
import { createOrganizationRepository, type ServiceDatabase } from "../repository";
import type {
  ConfigureWebhooksInput,
  GetOrganizationSettingsInput,
  UpdateOrganizationSettingsInput,
} from "../schemas/dtos";
import type { OrganizationRequestMeta } from "../types";

export function createOrganizationService(db: ServiceDatabase) {
  const repo = createOrganizationRepository(db);

  function assertTenantMatch(
    actorTenantId: string | null | undefined,
    requestedTenantId?: string,
  ): string {
    if (!actorTenantId) {
      throw new OrganizationServiceError("NOT_FOUND", "Organization resource not found.");
    }
    // FR-ORG-01 / IF-12: Cross-tenant requests return NOT_FOUND so existence of other tenants is not leaked
    if (requestedTenantId && requestedTenantId !== actorTenantId) {
      throw new OrganizationServiceError("NOT_FOUND", "Organization resource not found.");
    }
    return actorTenantId;
  }

  return {
    async getOrganizationSettings(
      actor: { accountId: string; activeRole: UserRole; activeTenantId?: string | null },
      input?: GetOrganizationSettingsInput,
    ) {
      const tenantId = assertTenantMatch(actor.activeTenantId, input?.tenantId);
      const org = await repo.findOrganizationByTenantId(tenantId);
      if (!org || org.status === "deleted") {
        throw new OrganizationServiceError("NOT_FOUND", "Organization resource not found.");
      }

      let settings = await repo.findSettingsByTenantId(tenantId);
      if (!settings) {
        const defaults = createDefaultOrganizationSettings({
          tenantId,
          countryCode: org.countryCode,
          planTier: org.planTier,
        });
        settings = await repo.upsertOrganizationSettings(tenantId, defaults);
      }

      const plan = findPlanCatalogEntry("organization", org.planTier);

      return {
        organization: {
          id: org.id,
          legalEntityName: org.legalEntityName,
          displayNameEn: org.displayNameEn,
          displayNameAr: org.displayNameAr,
          countryCode: org.countryCode,
          headquartersAddress: org.headquartersAddress,
          planTier: org.planTier,
          status: org.status,
          childSafetyOptIn: org.childSafetyOptIn,
        },
        settings,
        planEntitlements: {
          tier: org.planTier,
          limits: plan?.limits ?? null,
          features: plan?.features ?? null,
        },
      };
    },

    async updateOrganizationSettings(
      actor: { accountId: string; activeRole: UserRole; activeTenantId?: string | null },
      input: UpdateOrganizationSettingsInput,
      meta?: OrganizationRequestMeta,
    ) {
      const tenantId = assertTenantMatch(actor.activeTenantId, input.tenantId);
      const org = await repo.findOrganizationByTenantId(tenantId);
      if (!org || org.status === "deleted") {
        throw new OrganizationServiceError("NOT_FOUND", "Organization resource not found.");
      }

      // Enforce plan-gated settings (CON-06, FR-ORG-05, D-05, SCR-ORG-03)
      const planCheck = validateOrganizationSettingsAgainstPlan(org.planTier, {
        seatSelfSelectionEnabled: input.seatSelfSelectionEnabled,
        childTrackingEnabledByDefault: input.childTrackingEnabledByDefault,
        customBrandingEnabled: input.customBrandingEnabled,
      });
      if (!planCheck.valid) {
        throw new OrganizationServiceError("FORBIDDEN", planCheck.reason!, {
          field: planCheck.field,
          currentPlanTier: org.planTier,
        });
      }

      const existing =
        (await repo.findSettingsByTenantId(tenantId)) ??
        createDefaultOrganizationSettings({
          tenantId,
          countryCode: org.countryCode,
          planTier: org.planTier,
        });

      // D-68: Enabling default child tracking requires child safety lead & hotline phone
      const nextChildTracking =
        input.childTrackingEnabledByDefault ?? existing.childTrackingEnabledByDefault;
      const nextSafetyLead =
        input.safetyLeadName !== undefined ? input.safetyLeadName : existing.safetyLeadName;
      const nextSafetyHotline =
        input.safetyHotlinePhone !== undefined
          ? input.safetyHotlinePhone
          : existing.safetyHotlinePhone;

      if (nextChildTracking && (!nextSafetyLead || !nextSafetyHotline)) {
        throw new OrganizationServiceError(
          "VALIDATION_ERROR",
          "Safety lead name and hotline phone are required when enabling child tracking (D-68).",
          { field: !nextSafetyLead ? "safetyLeadName" : "safetyHotlinePhone" },
        );
      }

      if (input.displayNameEn || input.displayNameAr) {
        await repo.updateOrganizationDisplayNames(tenantId, {
          displayNameEn: input.displayNameEn,
          displayNameAr: input.displayNameAr,
        });
      }

      const merged = {
        ...existing,
        timeZone: input.timeZone ?? existing.timeZone,
        defaultLanguage: input.defaultLanguage ?? existing.defaultLanguage,
        seatSelfSelectionEnabled:
          input.seatSelfSelectionEnabled ?? existing.seatSelfSelectionEnabled,
        seatPriorityWindowMinutes:
          input.seatPriorityWindowMinutes ?? existing.seatPriorityWindowMinutes,
        childTrackingEnabledByDefault: nextChildTracking,
        operationsContactPhone:
          input.operationsContactPhone !== undefined
            ? input.operationsContactPhone
            : existing.operationsContactPhone,
        operationsContactEmail:
          input.operationsContactEmail !== undefined
            ? input.operationsContactEmail
            : existing.operationsContactEmail,
        safetyLeadName: nextSafetyLead,
        safetyHotlinePhone: nextSafetyHotline,
        billingContactName:
          input.billingContactName !== undefined
            ? input.billingContactName
            : existing.billingContactName,
        billingContactEmail:
          input.billingContactEmail !== undefined
            ? input.billingContactEmail
            : existing.billingContactEmail,
        billingContactPhone:
          input.billingContactPhone !== undefined
            ? input.billingContactPhone
            : existing.billingContactPhone,
        billingAddress:
          input.billingAddress !== undefined ? input.billingAddress : existing.billingAddress,
        invoiceLanguage: input.invoiceLanguage ?? existing.invoiceLanguage,
        taxNumber: input.taxNumber !== undefined ? input.taxNumber : existing.taxNumber,
        b2bInvoicingEnabled: input.b2bInvoicingEnabled ?? existing.b2bInvoicingEnabled,
        customBrandingEnabled: input.customBrandingEnabled ?? existing.customBrandingEnabled,
        logoUrl: input.logoUrl !== undefined ? input.logoUrl : existing.logoUrl,
        primaryColorHex:
          input.primaryColorHex !== undefined ? input.primaryColorHex : existing.primaryColorHex,
        secondaryColorHex:
          input.secondaryColorHex !== undefined
            ? input.secondaryColorHex
            : existing.secondaryColorHex,
        crmProvider: input.crmProvider !== undefined ? input.crmProvider : existing.crmProvider,
        updatedByAccountId: actor.accountId,
      };

      const saved = await repo.upsertOrganizationSettings(tenantId, merged);

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.activeRole,
        tenantId,
        action: "organization.settings.updated",
        targetEntityType: "organization_settings",
        targetEntityId: tenantId,
        beforeState: existing as unknown as Record<string, unknown>,
        afterState: saved as unknown as Record<string, unknown>,
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return saved;
    },

    async configureWebhooks(
      actor: { accountId: string; activeRole: UserRole; activeTenantId?: string | null },
      input: ConfigureWebhooksInput,
      meta?: OrganizationRequestMeta,
    ) {
      const tenantId = assertTenantMatch(actor.activeTenantId, input.tenantId);
      const org = await repo.findOrganizationByTenantId(tenantId);
      if (!org || org.status === "deleted") {
        throw new OrganizationServiceError("NOT_FOUND", "Organization resource not found.");
      }

      const existing =
        (await repo.findSettingsByTenantId(tenantId)) ??
        (await repo.upsertOrganizationSettings(
          tenantId,
          createDefaultOrganizationSettings({
            tenantId,
            countryCode: org.countryCode,
            planTier: org.planTier,
          }),
        ));

      const generatedSecrets: { endpointId: string; url: string; signingSecret: string }[] = [];
      const nextEndpoints: OrganizationWebhookEndpoint[] = input.endpoints.map((ep, idx) => {
        const endpointId = ep.id ?? `wh-${idx + 1}-${generateRandomToken(4)}`;
        const prior = existing.webhookEndpoints.find((p) => p.id === endpointId);
        if (!prior || ep.rotateSecret) {
          const rawSecret = `whsec_${generateRandomToken(24)}`;
          generatedSecrets.push({
            endpointId,
            url: ep.url,
            signingSecret: rawSecret,
          });
          return {
            id: endpointId,
            url: ep.url,
            secretHash: hashSha256(rawSecret),
            events: ep.events,
            enabled: ep.enabled,
          };
        }
        return {
          id: endpointId,
          url: ep.url,
          secretHash: prior.secretHash,
          events: ep.events,
          enabled: ep.enabled,
        };
      });

      const planCheck = validateOrganizationSettingsAgainstPlan(org.planTier, {
        webhookEndpoints: nextEndpoints,
      });
      if (!planCheck.valid) {
        throw new OrganizationServiceError("FORBIDDEN", planCheck.reason!, {
          field: "webhookEndpoints",
        });
      }

      await repo.updateWebhookEndpoints(tenantId, nextEndpoints, actor.accountId);

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.activeRole,
        tenantId,
        action: "organization.webhooks.configured",
        targetEntityType: "organization_settings",
        targetEntityId: tenantId,
        afterState: { endpointCount: nextEndpoints.length },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return {
        tenantId,
        endpoints: nextEndpoints,
        newlyGeneratedSecrets: generatedSecrets,
      };
    },
  };
}
