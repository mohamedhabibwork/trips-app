// Business logic for Traveler. Routes call this factory with context.db; repositories are created here.
import { TravelerServiceError } from "../errors";
import {
  computeBlindIndex,
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_PLAN_CATALOG,
  DELETION_GRACE_DAYS,
  decryptField,
  encryptField,
  normalizeEmail,
  normalizePhoneE164,
  type PlanCatalogEntry,
  QUIET_HOURS_NOTICE,
  SUPPORTED_COUNTRIES,
} from "../model";
import { createTravelerRepository, type ServiceDatabase } from "../repository";
import type {
  NotificationPreferencesDto,
  PrivacyRequestDto,
  RequestPrivacyActionInput,
  TravelerActorContext,
  TravelerPlanOverviewDto,
  TravelerProfileDto,
  UpdateNotificationPreferencesInput,
  UpdateProfileInput,
} from "../types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function safeDecryptOrFallback(encrypted: string | null, fallback: string | null): string | null {
  if (encrypted) {
    try {
      return decryptField(encrypted);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function createTravelerService(db: ServiceDatabase) {
  const repo = createTravelerRepository(db);

  async function resolveNotificationPreferences(
    accountId: string,
  ): Promise<NotificationPreferencesDto> {
    const existing = await repo.findNotificationPreferences(accountId);
    if (!existing) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    }
    return {
      bookingsPush: existing.bookingsPush,
      bookingsSms: existing.bookingsSms,
      bookingsEmail: existing.bookingsEmail,
      tripUpdatesPush: existing.tripUpdatesPush,
      tripUpdatesSms: existing.tripUpdatesSms,
      tripUpdatesEmail: existing.tripUpdatesEmail,
      promotionsPush: existing.promotionsPush,
      promotionsSms: existing.promotionsSms,
      promotionsEmail: existing.promotionsEmail,
    };
  }

  return {
    async getProfile(actor: TravelerActorContext): Promise<TravelerProfileDto> {
      const account = await repo.findAccountById(actor.accountId);
      if (!account) {
        throw new TravelerServiceError("RESOURCE_NOT_FOUND", "Traveler account not found.");
      }

      const notificationPreferences = await resolveNotificationPreferences(actor.accountId);

      return {
        accountId: account.id,
        fullName: account.fullName,
        email: safeDecryptOrFallback(account.emailEncrypted, account.emailNormalized),
        phoneE164: safeDecryptOrFallback(account.phoneEncrypted, account.phoneE164),
        countryCode: account.countryCode,
        preferredLanguage: account.preferredLanguage,
        avatarUrl: account.avatarUrl,
        travelerPlanTier: account.travelerPlanTier,
        notificationPreferences,
        quietHoursNotice: QUIET_HOURS_NOTICE,
      };
    },

    async updateProfile(
      actor: TravelerActorContext,
      input: UpdateProfileInput,
    ): Promise<TravelerProfileDto> {
      const account = await repo.findAccountById(actor.accountId);
      if (!account) {
        throw new TravelerServiceError("RESOURCE_NOT_FOUND", "Traveler account not found.");
      }

      const fullName = input.fullName.trim();
      if (!fullName) {
        throw new TravelerServiceError("VALIDATION_ERROR", "Full name is required.", {
          field: "fullName",
        });
      }

      if (!SUPPORTED_COUNTRIES.includes(input.countryCode)) {
        throw new TravelerServiceError("VALIDATION_ERROR", "Unsupported country code.", {
          field: "countryCode",
        });
      }

      const currentEmail = safeDecryptOrFallback(account.emailEncrypted, account.emailNormalized);
      const currentPhone = safeDecryptOrFallback(account.phoneEncrypted, account.phoneE164);

      const nextRawEmail =
        input.email === undefined ? currentEmail : input.email ? input.email.trim() : null;
      const nextRawPhone =
        input.phoneE164 === undefined
          ? currentPhone
          : input.phoneE164
            ? input.phoneE164.trim()
            : null;

      // D-20 invariant: Save needs a name, a country, and at least an email or a phone.
      if (!nextRawEmail && !nextRawPhone) {
        throw new TravelerServiceError(
          "VALIDATION_ERROR",
          "At least one contact method (email or phone) is required.",
          { field: "email" },
        );
      }

      let emailNormalized: string | null = null;
      let emailBlindIndex: string | null = null;
      let emailEncrypted: string | null = null;
      if (nextRawEmail) {
        emailNormalized = normalizeEmail(nextRawEmail);
        emailBlindIndex = computeBlindIndex(emailNormalized);
        const duplicateEmail = await repo.findOtherAccountByEmailBlindIndex(
          actor.accountId,
          emailBlindIndex,
        );
        if (duplicateEmail) {
          throw new TravelerServiceError(
            "DUPLICATE_RESOURCE",
            "An account with this email already exists.",
            { field: "email" },
          );
        }
        emailEncrypted = encryptField(emailNormalized);
      }

      let phoneE164: string | null = null;
      let phoneBlindIndex: string | null = null;
      let phoneEncrypted: string | null = null;
      if (nextRawPhone) {
        phoneE164 = normalizePhoneE164(nextRawPhone);
        phoneBlindIndex = computeBlindIndex(phoneE164);
        const duplicatePhone = await repo.findOtherAccountByPhoneBlindIndex(
          actor.accountId,
          phoneBlindIndex,
        );
        if (duplicatePhone) {
          throw new TravelerServiceError(
            "DUPLICATE_RESOURCE",
            "An account with this phone number already exists.",
            { field: "phoneE164" },
          );
        }
        phoneEncrypted = encryptField(phoneE164);
      }

      const updated = await repo.updateAccountProfile(actor.accountId, {
        fullName,
        emailNormalized,
        emailBlindIndex,
        emailEncrypted,
        phoneE164,
        phoneBlindIndex,
        phoneEncrypted,
        countryCode: input.countryCode,
        preferredLanguage: input.preferredLanguage,
        avatarUrl: input.avatarUrl,
        avatarFileId: input.avatarFileId,
        fileIds: input.fileIds,
      });

      if (!updated) {
        throw new TravelerServiceError("RESOURCE_NOT_FOUND", "Traveler account not found.");
      }

      if (input.notificationPreferences) {
        const currentPrefs = await resolveNotificationPreferences(actor.accountId);
        await repo.upsertNotificationPreferences(actor.accountId, {
          bookingsPush: input.notificationPreferences.bookingsPush ?? currentPrefs.bookingsPush,
          bookingsSms: input.notificationPreferences.bookingsSms ?? currentPrefs.bookingsSms,
          bookingsEmail: input.notificationPreferences.bookingsEmail ?? currentPrefs.bookingsEmail,
          tripUpdatesPush:
            input.notificationPreferences.tripUpdatesPush ?? currentPrefs.tripUpdatesPush,
          tripUpdatesSms:
            input.notificationPreferences.tripUpdatesSms ?? currentPrefs.tripUpdatesSms,
          tripUpdatesEmail:
            input.notificationPreferences.tripUpdatesEmail ?? currentPrefs.tripUpdatesEmail,
          promotionsPush:
            input.notificationPreferences.promotionsPush ?? currentPrefs.promotionsPush,
          promotionsSms: input.notificationPreferences.promotionsSms ?? currentPrefs.promotionsSms,
          promotionsEmail:
            input.notificationPreferences.promotionsEmail ?? currentPrefs.promotionsEmail,
        });
      }

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.role,
        action: "traveler.profile.updated",
        targetEntityType: "account",
        targetEntityId: actor.accountId,
        beforeState: {
          fullName: account.fullName,
          countryCode: account.countryCode,
          preferredLanguage: account.preferredLanguage,
          avatarUrl: account.avatarUrl,
        },
        afterState: {
          fullName: updated.fullName,
          countryCode: updated.countryCode,
          preferredLanguage: updated.preferredLanguage,
          avatarUrl: updated.avatarUrl,
        },
        ipAddress: actor.ipAddress,
        requestId: actor.requestId,
      });

      const notificationPreferences = await resolveNotificationPreferences(actor.accountId);

      return {
        accountId: updated.id,
        fullName: updated.fullName,
        email: emailNormalized,
        phoneE164,
        countryCode: updated.countryCode,
        preferredLanguage: updated.preferredLanguage,
        avatarUrl: updated.avatarUrl,
        travelerPlanTier: updated.travelerPlanTier,
        notificationPreferences,
        quietHoursNotice: QUIET_HOURS_NOTICE,
      };
    },

    async getNotificationPreferences(
      actor: TravelerActorContext,
    ): Promise<NotificationPreferencesDto & { quietHoursNotice: string }> {
      const account = await repo.findAccountById(actor.accountId);
      if (!account) {
        throw new TravelerServiceError("RESOURCE_NOT_FOUND", "Traveler account not found.");
      }
      const prefs = await resolveNotificationPreferences(actor.accountId);
      return {
        ...prefs,
        quietHoursNotice: QUIET_HOURS_NOTICE,
      };
    },

    async updateNotificationPreferences(
      actor: TravelerActorContext,
      input: UpdateNotificationPreferencesInput,
    ): Promise<NotificationPreferencesDto & { quietHoursNotice: string }> {
      const account = await repo.findAccountById(actor.accountId);
      if (!account) {
        throw new TravelerServiceError("RESOURCE_NOT_FOUND", "Traveler account not found.");
      }

      const current = await resolveNotificationPreferences(actor.accountId);
      const next: NotificationPreferencesDto = {
        bookingsPush: input.bookingsPush ?? current.bookingsPush,
        bookingsSms: input.bookingsSms ?? current.bookingsSms,
        bookingsEmail: input.bookingsEmail ?? current.bookingsEmail,
        tripUpdatesPush: input.tripUpdatesPush ?? current.tripUpdatesPush,
        tripUpdatesSms: input.tripUpdatesSms ?? current.tripUpdatesSms,
        tripUpdatesEmail: input.tripUpdatesEmail ?? current.tripUpdatesEmail,
        promotionsPush: input.promotionsPush ?? current.promotionsPush,
        promotionsSms: input.promotionsSms ?? current.promotionsSms,
        promotionsEmail: input.promotionsEmail ?? current.promotionsEmail,
      };

      const saved = await repo.upsertNotificationPreferences(actor.accountId, next);

      return {
        bookingsPush: saved.bookingsPush,
        bookingsSms: saved.bookingsSms,
        bookingsEmail: saved.bookingsEmail,
        tripUpdatesPush: saved.tripUpdatesPush,
        tripUpdatesSms: saved.tripUpdatesSms,
        tripUpdatesEmail: saved.tripUpdatesEmail,
        promotionsPush: saved.promotionsPush,
        promotionsSms: saved.promotionsSms,
        promotionsEmail: saved.promotionsEmail,
        quietHoursNotice: QUIET_HOURS_NOTICE,
      };
    },

    async getPlanOverview(actor: TravelerActorContext): Promise<TravelerPlanOverviewDto> {
      const account = await repo.findAccountById(actor.accountId);
      if (!account) {
        throw new TravelerServiceError("RESOURCE_NOT_FOUND", "Traveler account not found.");
      }

      const dbPlans = await repo.listTravelerPlans();
      const plans: readonly PlanCatalogEntry[] =
        dbPlans.length > 0
          ? dbPlans.map((row) => ({
              id: row.id,
              role: row.role,
              tier: row.tier,
              nameEn: row.nameEn,
              nameAr: row.nameAr,
              monthlyPriceMinor: row.monthlyPriceMinor,
              annualPriceMinor: row.annualPriceMinor,
              currencyCode: row.currencyCode,
              annualDiscountBps: row.annualDiscountBps,
              trialDays: row.trialDays,
              gracePeriodDays: row.gracePeriodDays,
              limits: row.limits,
              features: row.features,
              isDefault: row.isDefault,
              status: row.status,
            }))
          : DEFAULT_PLAN_CATALOG.filter((plan) => plan.role === "traveler");

      const annualDiscountBps = plans[0]?.annualDiscountBps ?? 1500;

      return {
        currentPlanTier: account.travelerPlanTier,
        annualDiscountBps,
        plans,
      };
    },

    async requestPrivacyAction(
      actor: TravelerActorContext,
      input: RequestPrivacyActionInput,
    ): Promise<PrivacyRequestDto> {
      const account = await repo.findAccountById(actor.accountId);
      if (!account) {
        throw new TravelerServiceError("RESOURCE_NOT_FOUND", "Traveler account not found.");
      }

      const scheduledPurgeAt =
        input.requestType === "account_deletion"
          ? new Date(Date.now() + DELETION_GRACE_DAYS * MS_PER_DAY)
          : null;

      const created = await repo.createPrivacyRequest({
        accountId: actor.accountId,
        requestType: input.requestType,
        reason: input.reason ?? null,
        scheduledPurgeAt,
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.role,
        action:
          input.requestType === "account_deletion"
            ? "traveler.privacy.account_deletion_requested"
            : "traveler.privacy.data_export_requested",
        targetEntityType: "privacy_request",
        targetEntityId: created.id,
        reason: input.reason ?? null,
        afterState: {
          requestType: created.requestType,
          status: created.status,
          scheduledPurgeAt: created.scheduledPurgeAt?.toISOString() ?? null,
        },
        ipAddress: actor.ipAddress,
        requestId: actor.requestId,
      });

      return {
        id: created.id,
        accountId: created.accountId,
        requestType: created.requestType,
        status: created.status,
        reason: created.reason,
        downloadUrl: created.downloadUrl,
        scheduledPurgeAt: created.scheduledPurgeAt,
        completedAt: created.completedAt,
        createdAt: created.createdAt,
      };
    },
  };
}
