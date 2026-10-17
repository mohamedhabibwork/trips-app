// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { and, type Database, desc, eq, isNull, lte, schema } from "@trips-app/db";

import type {
  AccountRoleStatus,
  AccountStatus,
  AdminSubRole,
  AuthSettingsData,
  ClientSurface,
  OrgPermissionMatrix,
  OtpChannel,
  OtpPurpose,
  PrimarySignInMethod,
  UserRole,
} from "../model";

export type { Database as ServiceDatabase } from "@trips-app/db";

const {
  accounts,
  accountRoles,
  adminInvites,
  auditLogs,
  authSessions,
  authSettings,
  employeeMemberships,
  moderatorAssignments,
  notificationPreferences,
  organizations,
  otpVerifications,
  permissionCatalog,
  planCatalog,
  roleDefinitions,
} = schema;

export function createAuthRepository(db: Database) {
  return {
    async getAuthSettingsRow() {
      const [row] = await db
        .select()
        .from(authSettings)
        .where(eq(authSettings.id, "default"))
        .limit(1);
      return row ?? null;
    },

    async upsertAuthSettingsRow(data: Partial<AuthSettingsData> & { updatedByAccountId?: string }) {
      const existing = await this.getAuthSettingsRow();
      const now = new Date();
      if (!existing) {
        return null;
      }
      const [updated] = await db
        .update(authSettings)
        .set({
          ...data,
          updatedAt: now,
        })
        .where(eq(authSettings.id, "default"))
        .returning();
      return updated ?? null;
    },

    async listRoleDefinitions() {
      return db.select().from(roleDefinitions);
    },

    async listPermissionCatalog() {
      return db.select().from(permissionCatalog);
    },

    async listPlanCatalog(
      role?: "traveler" | "organization" | "platform_driver" | "platform_photographer",
    ) {
      if (role) {
        return db.select().from(planCatalog).where(eq(planCatalog.role, role));
      }
      return db.select().from(planCatalog);
    },

    async findAccountById(id: string) {
      const [row] = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
      return row ?? null;
    },

    async findAccountByEmailBlindIndex(emailBlindIndex: string) {
      const [row] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.emailBlindIndex, emailBlindIndex))
        .limit(1);
      return row ?? null;
    },

    async findAccountByPhoneBlindIndex(phoneBlindIndex: string) {
      const [row] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.phoneBlindIndex, phoneBlindIndex))
        .limit(1);
      return row ?? null;
    },

    async createAccount(values: {
      emailNormalized?: string | null;
      emailBlindIndex?: string | null;
      emailEncrypted?: string | null;
      phoneE164?: string | null;
      phoneBlindIndex?: string | null;
      phoneEncrypted?: string | null;
      emailVerifiedAt?: Date | null;
      phoneVerifiedAt?: Date | null;
      passwordHash?: string | null;
      passwordChangedAt?: Date | null;
      preferredSignInMethod: PrimarySignInMethod;
      fullName: string;
      preferredLanguage: "ar" | "en";
      status: AccountStatus;
    }) {
      const [created] = await db
        .insert(accounts)
        .values({
          emailNormalized: values.emailNormalized ?? null,
          emailBlindIndex: values.emailBlindIndex ?? null,
          emailEncrypted: values.emailEncrypted ?? null,
          phoneE164: values.phoneE164 ?? null,
          phoneBlindIndex: values.phoneBlindIndex ?? null,
          phoneEncrypted: values.phoneEncrypted ?? null,
          emailVerifiedAt: values.emailVerifiedAt ?? null,
          phoneVerifiedAt: values.phoneVerifiedAt ?? null,
          passwordHash: values.passwordHash ?? null,
          passwordChangedAt: values.passwordChangedAt ?? null,
          preferredSignInMethod: values.preferredSignInMethod,
          fullName: values.fullName,
          preferredLanguage: values.preferredLanguage,
          status: values.status,
        })
        .returning();

      if (created) {
        await db
          .insert(notificationPreferences)
          .values({ accountId: created.id })
          .onConflictDoNothing();
      }
      return created!;
    },

    async updateAccount(
      id: string,
      patch: Partial<{
        emailNormalized: string | null;
        emailBlindIndex: string | null;
        emailEncrypted: string | null;
        phoneE164: string | null;
        phoneBlindIndex: string | null;
        phoneEncrypted: string | null;
        emailVerifiedAt: Date | null;
        phoneVerifiedAt: Date | null;
        passwordHash: string | null;
        passwordChangedAt: Date | null;
        preferredSignInMethod: PrimarySignInMethod;
        totpSecretEncrypted: string | null;
        totpEnabledAt: Date | null;
        staffSecondFactorMethod: "sms" | "totp" | null;
        fullName: string;
        status: AccountStatus;
        failedSignInAttempts: number;
        lockedUntil: Date | null;
        suspendedAt: Date | null;
        suspendedReason: string | null;
        deletionRequestedAt: Date | null;
        deletionPurgedAt: Date | null;
        knownDeviceFingerprints: string[];
      }>,
    ) {
      const [updated] = await db
        .update(accounts)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(accounts.id, id))
        .returning();
      return updated ?? null;
    },

    async listRolesForAccount(accountId: string) {
      return db.select().from(accountRoles).where(eq(accountRoles.accountId, accountId));
    },

    async createAccountRole(values: {
      accountId: string;
      role: UserRole;
      adminSubRole?: AdminSubRole | null;
      tenantId?: string | null;
      planTier?: string | null;
      status: AccountRoleStatus;
      approvedAt?: Date | null;
    }) {
      const [created] = await db
        .insert(accountRoles)
        .values({
          accountId: values.accountId,
          role: values.role,
          adminSubRole: values.adminSubRole ?? null,
          tenantId: values.tenantId ?? null,
          planTier: values.planTier ?? null,
          status: values.status,
          approvedAt: values.approvedAt ?? null,
        })
        .returning();
      return created!;
    },

    async updateAccountRolesStatus(accountId: string, status: AccountRoleStatus) {
      await db
        .update(accountRoles)
        .set({ status, updatedAt: new Date() })
        .where(eq(accountRoles.accountId, accountId));
    },

    async findLatestOtp(targetIdentifier: string, purpose: OtpPurpose) {
      const [row] = await db
        .select()
        .from(otpVerifications)
        .where(
          and(
            eq(otpVerifications.targetIdentifier, targetIdentifier),
            eq(otpVerifications.purpose, purpose),
            isNull(otpVerifications.consumedAt),
          ),
        )
        .orderBy(desc(otpVerifications.createdAt))
        .limit(1);
      return row ?? null;
    },

    async createOtpVerification(values: {
      accountId?: string | null;
      targetIdentifier: string;
      channel: OtpChannel;
      purpose: OtpPurpose;
      codeHash: string;
      expiresAt: Date;
      resendCount?: number;
      deliveryStatus?: "sent" | "retrying" | "failed_fallback_available";
    }) {
      const [created] = await db
        .insert(otpVerifications)
        .values({
          accountId: values.accountId ?? null,
          targetIdentifier: values.targetIdentifier,
          channel: values.channel,
          purpose: values.purpose,
          codeHash: values.codeHash,
          expiresAt: values.expiresAt,
          resendCount: values.resendCount ?? 0,
          deliveryStatus: values.deliveryStatus ?? "sent",
        })
        .returning();
      return created!;
    },

    async updateOtpVerification(
      id: string,
      patch: Partial<{
        codeHash: string;
        wrongAttempts: number;
        pausedUntil: Date | null;
        resendCount: number;
        lastSentAt: Date;
        expiresAt: Date;
        consumedAt: Date | null;
        channel: OtpChannel;
        deliveryStatus: "sent" | "retrying" | "failed_fallback_available";
      }>,
    ) {
      const [updated] = await db
        .update(otpVerifications)
        .set(patch)
        .where(eq(otpVerifications.id, id))
        .returning();
      return updated ?? null;
    },

    async createSession(values: {
      accountId: string;
      activeRole: UserRole;
      adminSubRole?: AdminSubRole | null;
      activeTenantId?: string | null;
      moderatorVehicleId?: string | null;
      moderatorTripId?: string | null;
      refreshTokenHash: string;
      surface: ClientSurface;
      deviceFingerprint?: string | null;
      ipAddress?: string | null;
      userAgent?: string | null;
      secondFactorVerifiedAt?: Date | null;
      expiresAt: Date;
      maxSessionExpiresAt: Date;
    }) {
      const [created] = await db
        .insert(authSessions)
        .values({
          accountId: values.accountId,
          activeRole: values.activeRole,
          adminSubRole: values.adminSubRole ?? null,
          activeTenantId: values.activeTenantId ?? null,
          moderatorVehicleId: values.moderatorVehicleId ?? null,
          moderatorTripId: values.moderatorTripId ?? null,
          refreshTokenHash: values.refreshTokenHash,
          surface: values.surface,
          deviceFingerprint: values.deviceFingerprint ?? null,
          ipAddress: values.ipAddress ?? null,
          userAgent: values.userAgent ?? null,
          secondFactorVerifiedAt: values.secondFactorVerifiedAt ?? null,
          expiresAt: values.expiresAt,
          maxSessionExpiresAt: values.maxSessionExpiresAt,
        })
        .returning();
      return created!;
    },

    async findSessionById(id: string) {
      const [row] = await db.select().from(authSessions).where(eq(authSessions.id, id)).limit(1);
      return row ?? null;
    },

    async findSessionByRefreshTokenHash(refreshTokenHash: string) {
      const [row] = await db
        .select()
        .from(authSessions)
        .where(eq(authSessions.refreshTokenHash, refreshTokenHash))
        .limit(1);
      return row ?? null;
    },

    async updateSession(
      id: string,
      patch: Partial<{
        activeRole: UserRole;
        adminSubRole: AdminSubRole | null;
        activeTenantId: string | null;
        refreshTokenHash: string;
        lastRotatedAt: Date;
        expiresAt: Date;
        revokedAt: Date | null;
        revokedReason: string | null;
      }>,
    ) {
      const [updated] = await db
        .update(authSessions)
        .set(patch)
        .where(eq(authSessions.id, id))
        .returning();
      return updated ?? null;
    },

    async revokeAllSessionsForAccount(accountId: string, reason: string) {
      await db
        .update(authSessions)
        .set({ revokedAt: new Date(), revokedReason: reason })
        .where(and(eq(authSessions.accountId, accountId), isNull(authSessions.revokedAt)));
    },

    async listEmployeeMembershipsForAccount(accountId: string) {
      return db
        .select()
        .from(employeeMemberships)
        .where(eq(employeeMemberships.accountId, accountId));
    },

    async findEmployeeMembership(tenantId: string, accountId: string) {
      const [row] = await db
        .select()
        .from(employeeMemberships)
        .where(
          and(
            eq(employeeMemberships.tenantId, tenantId),
            eq(employeeMemberships.accountId, accountId),
          ),
        )
        .limit(1);
      return row ?? null;
    },

    async countActiveEmployeesForTenant(tenantId: string) {
      const rows = await db
        .select()
        .from(employeeMemberships)
        .where(eq(employeeMemberships.tenantId, tenantId));
      return rows.filter((r) => r.status === "invited" || r.status === "active").length;
    },

    async createEmployeeInvite(values: {
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

    async findEmployeeInviteByTokenHash(inviteTokenHash: string) {
      const [row] = await db
        .select()
        .from(employeeMemberships)
        .where(eq(employeeMemberships.inviteTokenHash, inviteTokenHash))
        .limit(1);
      return row ?? null;
    },

    async updateEmployeeMembership(
      id: string,
      patch: Partial<{
        accountId: string;
        status: "invited" | "active" | "suspended" | "revoked";
        firstSignInCompletedAt: Date | null;
      }>,
    ) {
      const [updated] = await db
        .update(employeeMemberships)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(employeeMemberships.id, id))
        .returning();
      return updated ?? null;
    },

    async findOrganizationById(tenantId: string) {
      const [row] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, tenantId))
        .limit(1);
      return row ?? null;
    },

    async createAdminInvite(values: {
      emailNormalized: string;
      fullName: string;
      subRole: AdminSubRole;
      inviteTokenHash: string;
      expiresAt: Date;
      invitedByAccountId: string;
    }) {
      const [created] = await db.insert(adminInvites).values(values).returning();
      return created!;
    },

    async findAdminInviteByTokenHash(inviteTokenHash: string) {
      const [row] = await db
        .select()
        .from(adminInvites)
        .where(eq(adminInvites.inviteTokenHash, inviteTokenHash))
        .limit(1);
      return row ?? null;
    },

    async markAdminInviteAccepted(id: string, acceptedByAccountId: string) {
      const [updated] = await db
        .update(adminInvites)
        .set({ acceptedByAccountId, acceptedAt: new Date() })
        .where(eq(adminInvites.id, id))
        .returning();
      return updated ?? null;
    },

    async findModeratorAssignmentForAccount(accountId: string) {
      const [row] = await db
        .select()
        .from(moderatorAssignments)
        .where(eq(moderatorAssignments.accountId, accountId))
        .orderBy(desc(moderatorAssignments.createdAt))
        .limit(1);
      return row ?? null;
    },

    async updateModeratorAssignment(
      id: string,
      patch: Partial<{
        activeDeviceFingerprint: string | null;
        activeSessionId: string | null;
        status: "assigned" | "active" | "expired" | "revoked";
      }>,
    ) {
      const [updated] = await db
        .update(moderatorAssignments)
        .set(patch)
        .where(eq(moderatorAssignments.id, id))
        .returning();
      return updated ?? null;
    },

    async findAccountsDueForDeletionPurge(cutoffDate: Date) {
      return db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.status, "deletion_requested"),
            lte(accounts.deletionRequestedAt, cutoffDate),
            isNull(accounts.deletionPurgedAt),
          ),
        );
    },

    async writeAuditLog(entry: {
      actorAccountId?: string | null;
      actorRole: UserRole | "system";
      tenantId?: string | null;
      action: string;
      targetEntityType: string;
      targetEntityId: string;
      reason?: string | null;
      beforeState?: Record<string, unknown> | null;
      afterState?: Record<string, unknown> | null;
      ipAddress?: string | null;
      requestId?: string | null;
    }) {
      const [created] = await db
        .insert(auditLogs)
        .values({
          actorAccountId: entry.actorAccountId ?? null,
          actorRole: entry.actorRole,
          tenantId: entry.tenantId ?? null,
          action: entry.action,
          targetEntityType: entry.targetEntityType,
          targetEntityId: entry.targetEntityId,
          reason: entry.reason ?? null,
          beforeState: entry.beforeState ?? null,
          afterState: entry.afterState ?? null,
          ipAddress: entry.ipAddress ?? null,
          requestId: entry.requestId ?? null,
        })
        .returning();
      return created!;
    },
  };
}
