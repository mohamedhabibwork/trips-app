// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  or,
  schema,
  type ServiceDatabase,
} from "@trips-app/db";

import type { EmployeeMembershipStatus, OrgPermissionMatrix, UserRole } from "../model";

export type { ServiceDatabase } from "@trips-app/db";

const { accountRoles, accounts, auditLogs, authSessions, employeeMemberships, organizations } =
  schema;

export function createEmployeesRepository(db: ServiceDatabase) {
  return {
    async findOrganizationByTenantId(tenantId: string) {
      const [row] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, tenantId))
        .limit(1);
      return row ?? null;
    },

    async listByTenant(
      tenantId: string,
      filter?: {
        status?: EmployeeMembershipStatus;
        search?: string;
      },
    ) {
      const conditions = [eq(employeeMemberships.tenantId, tenantId)];
      if (filter?.status) {
        conditions.push(eq(employeeMemberships.status, filter.status));
      }
      const search = filter?.search?.trim();
      if (search) {
        const pattern = `%${search}%`;
        conditions.push(
          or(
            ilike(employeeMemberships.invitedEmail, pattern),
            ilike(employeeMemberships.roleTitle, pattern),
            ilike(accounts.fullName, pattern),
          )!,
        );
      }

      return db
        .select({
          row: employeeMemberships,
          fullName: accounts.fullName,
          avatarUrl: accounts.avatarUrl,
        })
        .from(employeeMemberships)
        .leftJoin(accounts, eq(employeeMemberships.accountId, accounts.id))
        .$dynamic()
        .where(and(...conditions))
        .orderBy(desc(employeeMemberships.createdAt));
    },

    async findByIdAndTenant(membershipId: string, tenantId: string) {
      const [result] = await db
        .select({
          row: employeeMemberships,
          fullName: accounts.fullName,
          avatarUrl: accounts.avatarUrl,
        })
        .from(employeeMemberships)
        .leftJoin(accounts, eq(employeeMemberships.accountId, accounts.id))
        .where(
          and(eq(employeeMemberships.id, membershipId), eq(employeeMemberships.tenantId, tenantId)),
        )
        .limit(1);
      return result ?? null;
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
      const [row] = await db
        .select({ value: count() })
        .from(employeeMemberships)
        .where(
          and(
            eq(employeeMemberships.tenantId, tenantId),
            inArray(employeeMemberships.status, ["invited", "active"]),
          ),
        );
      return Number(row?.value ?? 0);
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
