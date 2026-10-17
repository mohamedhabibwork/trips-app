// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { type Database, eq, schema } from "@trips-app/db";

import type { OrganizationSettingsData, OrganizationWebhookEndpoint, UserRole } from "../model";

export type { Database as ServiceDatabase } from "@trips-app/db";

const { auditLogs, organizations, organizationSettings } = schema;

export function createOrganizationRepository(db: Database) {
  return {
    async findOrganizationByTenantId(tenantId: string) {
      const [row] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, tenantId))
        .limit(1);
      return row ?? null;
    },

    async findSettingsByTenantId(tenantId: string) {
      const [row] = await db
        .select()
        .from(organizationSettings)
        .where(eq(organizationSettings.tenantId, tenantId))
        .limit(1);
      return row ?? null;
    },

    async upsertOrganizationSettings(
      tenantId: string,
      values: OrganizationSettingsData & { updatedByAccountId?: string | null },
    ) {
      const now = new Date();
      const [upserted] = await db
        .insert(organizationSettings)
        .values({
          ...values,
          tenantId,
          updatedByAccountId: values.updatedByAccountId ?? null,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: organizationSettings.tenantId,
          set: {
            ...values,
            updatedByAccountId: values.updatedByAccountId ?? null,
            updatedAt: now,
          },
        })
        .returning();
      return upserted!;
    },

    async updateOrganizationDisplayNames(
      tenantId: string,
      patch: { displayNameEn?: string; displayNameAr?: string },
    ) {
      const [updated] = await db
        .update(organizations)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(organizations.id, tenantId))
        .returning();
      return updated ?? null;
    },

    async updateWebhookEndpoints(
      tenantId: string,
      webhookEndpoints: readonly OrganizationWebhookEndpoint[],
      updatedByAccountId: string,
    ) {
      const [updated] = await db
        .update(organizationSettings)
        .set({
          webhookEndpoints,
          updatedByAccountId,
          updatedAt: new Date(),
        })
        .where(eq(organizationSettings.tenantId, tenantId))
        .returning();
      return updated ?? null;
    },

    async writeAuditLog(entry: {
      actorAccountId: string;
      actorRole: UserRole;
      tenantId: string;
      action: string;
      targetEntityType: string;
      targetEntityId: string;
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
