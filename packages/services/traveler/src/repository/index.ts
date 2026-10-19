// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import {
  and,
  type Database,
  desc,
  eq,
  linkUploadedFilesOnItemSave,
  ne,
  schema,
} from "@trips-app/db";

import type {
  NotificationPreferencesData,
  PrivacyRequestType,
  SupportedCountryCode,
  SupportedLocale,
  UserRole,
} from "../model";

export type { Database as ServiceDatabase } from "@trips-app/db";

const { accounts, auditLogs, notificationPreferences, planCatalog, privacyRequests } = schema;

export function createTravelerRepository(db: Database) {
  return {
    async findAccountById(accountId: string) {
      const [row] = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1);
      return row ?? null;
    },

    async findOtherAccountByEmailBlindIndex(accountId: string, emailBlindIndex: string) {
      const [row] = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(and(eq(accounts.emailBlindIndex, emailBlindIndex), ne(accounts.id, accountId)))
        .limit(1);
      return row ?? null;
    },

    async findOtherAccountByPhoneBlindIndex(accountId: string, phoneBlindIndex: string) {
      const [row] = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(and(eq(accounts.phoneBlindIndex, phoneBlindIndex), ne(accounts.id, accountId)))
        .limit(1);
      return row ?? null;
    },

    async updateAccountProfile(
      accountId: string,
      values: {
        fullName: string;
        emailNormalized: string | null;
        emailBlindIndex: string | null;
        emailEncrypted: string | null;
        phoneE164: string | null;
        phoneBlindIndex: string | null;
        phoneEncrypted: string | null;
        countryCode: SupportedCountryCode;
        preferredLanguage?: SupportedLocale;
        avatarUrl?: string | null;
        avatarFileId?: string | null;
        fileIds?: readonly string[];
      },
    ) {
      const now = new Date();
      const [updated] = await db
        .update(accounts)
        .set({
          fullName: values.fullName,
          emailNormalized: values.emailNormalized,
          emailBlindIndex: values.emailBlindIndex,
          emailEncrypted: values.emailEncrypted,
          phoneE164: values.phoneE164,
          phoneBlindIndex: values.phoneBlindIndex,
          phoneEncrypted: values.phoneEncrypted,
          countryCode: values.countryCode,
          ...(values.preferredLanguage !== undefined
            ? { preferredLanguage: values.preferredLanguage }
            : {}),
          ...(values.avatarUrl !== undefined ? { avatarUrl: values.avatarUrl } : {}),
          updatedAt: now,
        })
        .where(eq(accounts.id, accountId))
        .returning();

      if (
        values.avatarUrl !== undefined ||
        values.avatarFileId !== undefined ||
        values.fileIds !== undefined
      ) {
        const resolvedFileIds = [
          ...(values.avatarFileId ? [values.avatarFileId] : []),
          ...(values.fileIds ?? []),
        ];
        await linkUploadedFilesOnItemSave(db, {
          entityType: "profile",
          entityId: accountId,
          uploaderAccountId: accountId,
          fileIds: [...new Set(resolvedFileIds)],
          urls: values.avatarUrl ? [values.avatarUrl] : [],
          storageKeys: values.avatarUrl ? [values.avatarUrl] : [],
          replaceExistingForEntity: true,
          now,
        });
      }

      return updated ?? null;
    },

    async findNotificationPreferences(accountId: string) {
      const [row] = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.accountId, accountId))
        .limit(1);
      return row ?? null;
    },

    async upsertNotificationPreferences(accountId: string, values: NotificationPreferencesData) {
      const now = new Date();
      const [upserted] = await db
        .insert(notificationPreferences)
        .values({
          accountId,
          ...values,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: notificationPreferences.accountId,
          set: {
            ...values,
            updatedAt: now,
          },
        })
        .returning();
      return upserted!;
    },

    async listTravelerPlans() {
      return db
        .select()
        .from(planCatalog)
        .where(and(eq(planCatalog.role, "traveler"), eq(planCatalog.status, "active")));
    },

    async createPrivacyRequest(values: {
      accountId: string;
      requestType: PrivacyRequestType;
      reason: string | null;
      scheduledPurgeAt: Date | null;
    }) {
      const now = new Date();
      const [created] = await db
        .insert(privacyRequests)
        .values({
          accountId: values.accountId,
          requestType: values.requestType,
          status: "pending",
          reason: values.reason,
          scheduledPurgeAt: values.scheduledPurgeAt,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      if (values.requestType === "account_deletion") {
        await db
          .update(accounts)
          .set({
            status: "deletion_requested",
            deletionRequestedAt: now,
            updatedAt: now,
          })
          .where(eq(accounts.id, values.accountId));
      }

      return created!;
    },

    async listPrivacyRequests(accountId: string) {
      return db
        .select()
        .from(privacyRequests)
        .where(eq(privacyRequests.accountId, accountId))
        .orderBy(desc(privacyRequests.createdAt));
    },

    async writeAuditLog(entry: {
      actorAccountId: string;
      actorRole: UserRole;
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
          ...entry,
          tenantId: null,
        })
        .returning();
      return created!;
    },
  };
}
