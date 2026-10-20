// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { and, count, eq, schema, type ServiceDatabase } from "@trips-app/db";

import type { SystemSettingsData, UserRole } from "../model";

export type { ServiceDatabase } from "@trips-app/db";

const { accountRoles, accounts, auditLogs, organizations, systemSettings } = schema;

export function createAdminRepository(db: ServiceDatabase) {
  return {
    async getSystemSettingsRow() {
      const [row] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.id, "default"))
        .limit(1);
      return row ?? null;
    },

    async upsertSystemSettingsRow(
      values: SystemSettingsData & { updatedByAccountId?: string | null },
    ) {
      const now = new Date();
      const [row] = await db
        .insert(systemSettings)
        .values({
          id: "default",
          markets: values.markets,
          operational: values.operational,
          refundPolicyTiers: values.refundPolicyTiers,
          notifications: values.notifications,
          maintenanceAndSupport: values.maintenanceAndSupport,
          featureFlags: values.featureFlags,
          updatedByAccountId: values.updatedByAccountId ?? null,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: systemSettings.id,
          set: {
            markets: values.markets,
            operational: values.operational,
            refundPolicyTiers: values.refundPolicyTiers,
            notifications: values.notifications,
            maintenanceAndSupport: values.maintenanceAndSupport,
            featureFlags: values.featureFlags,
            updatedByAccountId: values.updatedByAccountId ?? null,
            updatedAt: now,
          },
        })
        .returning();
      return row!;
    },

    // Counts in the database. Loading whole rows would pull credential columns into memory for no reason.
    async countAccountsAndOrganizations() {
      const countOf = async (query: Promise<{ value: number }[]>) => {
        const [row] = await query;
        return row?.value ?? 0;
      };
      const [totalAccounts, activeAccounts, totalOrganizations, activeOrganizations] =
        await Promise.all([
          countOf(db.select({ value: count() }).from(accounts)),
          countOf(
            db.select({ value: count() }).from(accounts).where(eq(accounts.status, "active")),
          ),
          countOf(db.select({ value: count() }).from(organizations)),
          countOf(
            db
              .select({ value: count() })
              .from(organizations)
              .where(eq(organizations.status, "active")),
          ),
        ]);
      return {
        totalAccounts,
        activeAccounts,
        totalOrganizations,
        activeOrganizations,
      };
    },

    async findAdminRoleForAccount(accountId: string) {
      const [row] = await db
        .select()
        .from(accountRoles)
        .$dynamic()
        .where(
          and(
            eq(accountRoles.accountId, accountId),
            eq(accountRoles.role, "admin"),
            eq(accountRoles.status, "active"),
          ),
        )
        .limit(1);
      return row ?? null;
    },

    async writeAuditLog(entry: {
      actorAccountId: string;
      actorRole: UserRole;
      action: string;
      targetEntityType: string;
      targetEntityId: string;
      reason: string;
      beforeState?: Record<string, unknown> | null;
      afterState?: Record<string, unknown> | null;
      ipAddress?: string | null;
      requestId?: string | null;
    }) {
      const [created] = await db.insert(auditLogs).values(entry).returning();
      return created!;
    },
  };
}
