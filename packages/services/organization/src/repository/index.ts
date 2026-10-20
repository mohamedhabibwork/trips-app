// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { and, desc, eq, ilike, linkUploadedFilesOnItemSave, or, schema } from "@trips-app/db";
import type { ServiceDatabase } from "@trips-app/db";

import type { OrganizationSettingsData, OrganizationWebhookEndpoint, UserRole } from "../model";

export type { ServiceDatabase };

const { auditLogs, organizations, organizationSettings } = schema;

export function createOrganizationRepository(db: ServiceDatabase) {
  return {
    async listOrganizations(filters?: {
      countryCode?: typeof organizations.$inferSelect.countryCode;
      planTier?: typeof organizations.$inferSelect.planTier;
      status?: typeof organizations.$inferSelect.status;
      search?: string;
      limit?: number;
      offset?: number;
    }) {
      let query = db.select().from(organizations).$dynamic();
      const conditions = [];
      if (filters?.countryCode) conditions.push(eq(organizations.countryCode, filters.countryCode));
      if (filters?.planTier) conditions.push(eq(organizations.planTier, filters.planTier));
      if (filters?.status) conditions.push(eq(organizations.status, filters.status));
      if (filters?.search) {
        conditions.push(
          or(
            ilike(organizations.displayNameEn, `%${filters.search}%`),
            ilike(organizations.displayNameAr, `%${filters.search}%`),
            ilike(organizations.legalEntityName, `%${filters.search}%`),
          )!,
        );
      }
      if (conditions.length > 0) query = query.where(and(...conditions));
      query = query.orderBy(desc(organizations.createdAt));
      if (filters?.limit !== undefined) query = query.limit(filters.limit);
      if (filters?.offset !== undefined) query = query.offset(filters.offset);
      return query;
    },

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
      return db.transaction(async (tx) => {
        const now = new Date();
        const [upserted] = await tx
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

        await linkUploadedFilesOnItemSave(tx, {
          entityType: "organization",
          entityId: tenantId,
          tenantId,
          urls: [values.logoUrl],
          storageKeys: values.logoUrl ? [values.logoUrl] : [],
          replaceExistingForEntity: true,
          now,
        });

        return upserted!;
      });
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
