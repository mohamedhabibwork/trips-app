// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { type Database, eq, schema } from "@trips-app/db";

import type { SystemSettingsData, UserRole } from "../model";

export type { Database as ServiceDatabase } from "@trips-app/db";

const { accountRoles, accounts, auditLogs, organizations, systemSettings } = schema;

export function createAdminRepository(db: Database) {
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

    async countAccountsAndOrganizations() {
      const allAccounts = await db.select().from(accounts);
      const allOrgs = await db.select().from(organizations);
      return {
        totalAccounts: allAccounts.length,
        activeAccounts: allAccounts.filter((a) => a.status === "active").length,
        totalOrganizations: allOrgs.length,
        activeOrganizations: allOrgs.filter((o) => o.status === "active").length,
      };
    },

    async findAdminRoleForAccount(accountId: string) {
      const rows = await db
        .select()
        .from(accountRoles)
        .where(eq(accountRoles.accountId, accountId));
      return rows.find((r) => r.role === "admin" && r.status === "active") ?? null;
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
