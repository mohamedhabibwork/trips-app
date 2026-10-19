// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { and, type Database, desc, eq, inArray, isNull, schema } from "@trips-app/db";

import type { EmployeeMembershipStatus, OrgPermissionMatrix, UserRole } from "../model";

export type { Database as ServiceDatabase } from "@trips-app/db";

const { accountRoles, accounts, auditLogs, authSessions, employeeMemberships, organizations } =
  schema;

export function createEmployeesRepository(db: Database) {
  return {
    async findOrganizationByTenantId(tenantId: string) {
      const [row] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, tenantId))
        .limit(1);
      return row ?? null;
    },

    async listByTenant(tenantId: string) {
      const rows = await db
        .select()
        .from(employeeMemberships)
        .where(eq(employeeMemberships.tenantId, tenantId))
        .orderBy(desc(employeeMemberships.createdAt));

      const accountIds = rows
        .map((r) => r.accountId)
        .filter((id): id is string => typeof id === "string" && id.length > 0);

      const accountMap = new Map<string, { fullName: string; avatarUrl: string | null }>();
      if (accountIds.length > 0) {
        const accRows = await db
          .select({
            id: accounts.id,
            fullName: accounts.fullName,
            avatarUrl: accounts.avatarUrl,
          })
          .from(accounts)
          .where(inArray(accounts.id, accountIds));
        for (const acc of accRows) {
          accountMap.set(acc.id, { fullName: acc.fullName, avatarUrl: acc.avatarUrl });
        }
      }

      return rows.map((row) => {
        const acc = row.accountId ? accountMap.get(row.accountId) : undefined;
        return {
          row,
          fullName: acc?.fullName ?? null,
          avatarUrl: acc?.avatarUrl ?? null,
        };
      });
    },

    async findByIdAndTenant(membershipId: string, tenantId: string) {
      const [row] = await db
        .select()
        .from(employeeMemberships)
        .where(
          and(eq(employeeMemberships.id, membershipId), eq(employeeMemberships.tenantId, tenantId)),
        )
        .limit(1);
      if (!row) return null;

      let fullName: string | null = null;
      let avatarUrl: string | null = null;
      if (row.accountId) {
        const [acc] = await db
          .select({
            fullName: accounts.fullName,
            avatarUrl: accounts.avatarUrl,
          })
          .from(accounts)
          .where(eq(accounts.id, row.accountId))
          .limit(1);
        fullName = acc?.fullName ?? null;
        avatarUrl = acc?.avatarUrl ?? null;
      }

      return { row, fullName, avatarUrl };
    },

    async findByEmailAndTenant(invitedEmail: string, tenantId: string) {
      const [row] = await db
        .select()
        .from(employeeMemberships)
        .where(
          and(
            eq(employeeMemberships.tenantId, tenantId),
            eq(employeeMemberships.invitedEmail, invitedEmail),
          ),
        )
        .limit(1);
      return row ?? null;
    },

    async findByInviteTokenHash(inviteTokenHash: string) {
      const [row] = await db
        .select()
        .from(employeeMemberships)
        .where(eq(employeeMemberships.inviteTokenHash, inviteTokenHash))
        .limit(1);
      return row ?? null;
    },

    async countActiveOrInvitedForTenant(tenantId: string) {
      const rows = await db
        .select({ status: employeeMemberships.status })
        .from(employeeMemberships)
        .where(eq(employeeMemberships.tenantId, tenantId));
      return rows.filter((r) => r.status === "invited" || r.status === "active").length;
    },

    async createMembership(values: {
      tenantId: string;
      invitedEmail: string;
      invitedPhone?: string | null;
      roleTitle: string;
      permissions: OrgPermissionMatrix;
      inviteTokenHash: string;
      inviteExpiresAt: Date;
      invitedByAccountId: string;
    }) {
      const [created] = await db
        .insert(employeeMemberships)
        .values({
          tenantId: values.tenantId,
          invitedEmail: values.invitedEmail,
          invitedPhone: values.invitedPhone ?? null,
          roleTitle: values.roleTitle,
          permissions: values.permissions,
          inviteTokenHash: values.inviteTokenHash,
          inviteExpiresAt: values.inviteExpiresAt,
          status: "invited",
          invitedByAccountId: values.invitedByAccountId,
        })
        .returning();
      return created!;
    },

    async updateMembershipByTenant(
      membershipId: string,
      tenantId: string,
      patch: Partial<{
        roleTitle: string;
        permissions: OrgPermissionMatrix;
        inviteTokenHash: string;
        inviteExpiresAt: Date;
        status: EmployeeMembershipStatus;
      }>,
    ) {
      const [updated] = await db
        .update(employeeMemberships)
        .set({
          ...patch,
          updatedAt: new Date(),
        })
        .where(
          and(eq(employeeMemberships.id, membershipId), eq(employeeMemberships.tenantId, tenantId)),
        )
        .returning();
      return updated ?? null;
    },

    async acceptMembershipInvite(membershipId: string, accountId: string, now: Date) {
      const [updated] = await db
        .update(employeeMemberships)
        .set({
          accountId,
          status: "active",
          firstSignInCompletedAt: now,
          updatedAt: now,
        })
        .where(eq(employeeMemberships.id, membershipId))
        .returning();
      return updated ?? null;
    },

    async ensureEmployeeAccountRole(accountId: string, tenantId: string, planTier: string) {
      const [existing] = await db
        .select()
        .from(accountRoles)
        .where(
          and(
            eq(accountRoles.accountId, accountId),
            eq(accountRoles.tenantId, tenantId),
            eq(accountRoles.role, "organization_employee"),
          ),
        )
        .limit(1);

      const now = new Date();
      if (existing) {
        await db
          .update(accountRoles)
          .set({
            status: "active",
            approvedAt: existing.approvedAt ?? now,
            updatedAt: now,
          })
          .where(eq(accountRoles.id, existing.id));
        return;
      }

      await db.insert(accountRoles).values({
        accountId,
        role: "organization_employee",
        tenantId,
        planTier,
        status: "active",
        approvedAt: now,
      });
    },

    async updateEmployeeAccountRoleStatus(
      accountId: string,
      tenantId: string,
      status: "active" | "suspended" | "revoked",
    ) {
      await db
        .update(accountRoles)
        .set({ status, updatedAt: new Date() })
        .where(
          and(
            eq(accountRoles.accountId, accountId),
            eq(accountRoles.tenantId, tenantId),
            eq(accountRoles.role, "organization_employee"),
          ),
        );
    },

    async revokeActiveTenantSessionsForAccount(
      accountId: string,
      tenantId: string,
      reason: string,
    ): Promise<number> {
      const revoked = await db
        .update(authSessions)
        .set({
          revokedAt: new Date(),
          revokedReason: reason,
        })
        .where(
          and(
            eq(authSessions.accountId, accountId),
            eq(authSessions.activeTenantId, tenantId),
            isNull(authSessions.revokedAt),
          ),
        )
        .returning({ id: authSessions.id });
      return revoked.length;
    },

    async listAuditLogsForMembership(tenantId: string, membershipId: string, limit = 25) {
      return db
        .select()
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.tenantId, tenantId),
            eq(auditLogs.targetEntityType, "employee_membership"),
            eq(auditLogs.targetEntityId, membershipId),
          ),
        )
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit);
    },

    /** Declines a pending invitation; only an `invited` row changes. */
    async declineMembershipInvite(membershipId: string, now: Date) {
      const [updated] = await db
        .update(employeeMemberships)
        .set({ status: "revoked", updatedAt: now })
        .where(
          and(eq(employeeMemberships.id, membershipId), eq(employeeMemberships.status, "invited")),
        )
        .returning();
      return updated ?? null;
    },

    async writeAuditLog(entry: {
      /** Null when the invited person acts from the email link without a session. */
      actorAccountId: string | null;
      actorRole: UserRole | "system";
      tenantId: string;
      action: string;
      targetEntityType: string;
      targetEntityId: string;
      reason?: string | null;
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
