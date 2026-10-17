// Business logic for Admin. Routes call this factory with context.db; repositories are created here.
import { AdminServiceError } from "../errors";
import {
  type AdminSubRole,
  DEFAULT_SYSTEM_SETTINGS,
  type SystemSettingsData,
  type UserRole,
} from "../model";
import { createAdminRepository, type ServiceDatabase } from "../repository";
import type { PreviewSystemSettingsChangeInput, UpdateSystemSettingsInput } from "../schemas/dtos";
import type { AdminRequestMeta } from "../types";

export function createAdminService(db: ServiceDatabase) {
  const repo = createAdminRepository(db);

  async function loadEffectiveSystemSettings(): Promise<SystemSettingsData> {
    const row = await repo.getSystemSettingsRow();
    if (!row) return DEFAULT_SYSTEM_SETTINGS;
    return {
      id: row.id,
      markets: row.markets,
      operational: row.operational,
      refundPolicyTiers: row.refundPolicyTiers,
      notifications: row.notifications,
      maintenanceAndSupport: row.maintenanceAndSupport,
      featureFlags: row.featureFlags,
    };
  }

  return {
    async getSystemSettings() {
      return loadEffectiveSystemSettings();
    },

    async previewSystemSettingsChange(input: PreviewSystemSettingsChangeInput) {
      const counts = await repo.countAccountsAndOrganizations();
      const requiresFourEyesApproval = Boolean(
        input.featureFlags ||
        input.marketCountryCode !== undefined ||
        input.maintenanceAndSupport?.maintenanceMode !== undefined,
      );

      return {
        affectedAccountsCount: counts.activeAccounts,
        affectedOrganizationsCount: counts.activeOrganizations,
        requiresFourEyesApproval,
        proposedChanges: input,
      };
    },

    async updateSystemSettings(
      actor: { accountId: string; activeRole: UserRole; adminSubRole?: AdminSubRole | null },
      input: UpdateSystemSettingsInput,
      meta?: AdminRequestMeta,
    ) {
      if (actor.activeRole !== "admin" || actor.adminSubRole !== "super_admin") {
        throw new AdminServiceError(
          "FORBIDDEN",
          "Only Super Admin can modify system settings and global feature flags (FR-ADM-03).",
        );
      }

      const requiresFourEyes = Boolean(
        input.featureFlags ||
        input.marketCountryCode !== undefined ||
        input.maintenanceAndSupport?.maintenanceMode === true,
      );

      if (requiresFourEyes) {
        if (
          !input.secondApproverAdminAccountId ||
          input.secondApproverAdminAccountId === actor.accountId
        ) {
          throw new AdminServiceError(
            "PRECONDITION_FAILED",
            "Four-eyes approval is required: a distinct second admin account must approve global flag or market changes (D-233).",
          );
        }
        const secondAdminRole = await repo.findAdminRoleForAccount(
          input.secondApproverAdminAccountId,
        );
        if (!secondAdminRole) {
          throw new AdminServiceError(
            "VALIDATION_ERROR",
            "Second approver must hold an active Platform Admin role.",
          );
        }
      }

      const before = await loadEffectiveSystemSettings();
      const nextMarkets = { ...before.markets };
      if (input.marketCountryCode && input.marketEnabled !== undefined) {
        const market = nextMarkets[input.marketCountryCode];
        if (market) {
          nextMarkets[input.marketCountryCode] = {
            ...market,
            enabled: input.marketEnabled,
          };
        }
      }

      const nextSettings: SystemSettingsData & { updatedByAccountId?: string } = {
        id: "default",
        markets: nextMarkets,
        operational: {
          ...before.operational,
          ...input.operational,
        },
        refundPolicyTiers: before.refundPolicyTiers,
        notifications: before.notifications,
        maintenanceAndSupport: {
          ...before.maintenanceAndSupport,
          ...input.maintenanceAndSupport,
        },
        featureFlags: {
          ...before.featureFlags,
          ...input.featureFlags,
        },
        updatedByAccountId: actor.accountId,
      };

      const saved = await repo.upsertSystemSettingsRow(nextSettings);

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: "admin",
        action: "settings.system.updated",
        targetEntityType: "system_settings",
        targetEntityId: "default",
        reason: input.reason,
        beforeState: before as unknown as Record<string, unknown>,
        afterState: {
          ...saved,
          secondApproverAdminAccountId: input.secondApproverAdminAccountId ?? null,
        } as unknown as Record<string, unknown>,
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return saved;
    },
  };
}
