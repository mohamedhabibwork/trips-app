import { randomUUID } from "node:crypto";

import {
  computeBlindIndex,
  DEFAULT_AUTH_SETTINGS,
  DEFAULT_PERMISSION_CATALOG,
  DEFAULT_PLAN_CATALOG,
  DEFAULT_SYSTEM_SETTINGS,
  encryptField,
  hashPassword,
  normalizeEmail,
  normalizePhoneE164,
  ROLE_AUTH_DEFAULTS,
  USER_ROLES,
} from "@trips-app/domain";
import { and, eq } from "drizzle-orm";

import {
  accountRoles,
  accounts,
  auditLogs,
  authSettings,
  notificationPreferences,
  permissionCatalog,
  planCatalog,
  roleDefinitions,
  systemSettings,
} from "../schema";
import type { Database, DefaultSeedSummary, SeedDefaultOptions } from "../types";
import { seedLookupsData } from "./lookups";

export type { DefaultSeedSummary, SeedDefaultOptions } from "../types";

export const BOOTSTRAP_SUPER_ADMIN_EMAIL = "admin@trips-enjoy.com";
export const BOOTSTRAP_SUPER_ADMIN_PHONE = "+201000000001";
export const BOOTSTRAP_SUPER_ADMIN_PASSWORD = "AdminPassword123!";
export const BOOTSTRAP_SUPER_ADMIN_TOTP_SECRET = "JBSWY3DPEHPK3PXP";

export async function seedDefaultData(
  db: Database,
  options?: SeedDefaultOptions,
): Promise<DefaultSeedSummary> {
  const now = options?.now ?? new Date();
  const adminEmail = normalizeEmail(options?.superAdminEmail ?? BOOTSTRAP_SUPER_ADMIN_EMAIL);
  const adminPhone = normalizePhoneE164(options?.superAdminPhone ?? BOOTSTRAP_SUPER_ADMIN_PHONE);
  const adminPassword = options?.superAdminPassword ?? BOOTSTRAP_SUPER_ADMIN_PASSWORD;
  const adminTotpSecret = options?.superAdminTotpSecret ?? BOOTSTRAP_SUPER_ADMIN_TOTP_SECRET;

  // 1. Seed system_settings
  await db
    .insert(systemSettings)
    .values({
      id: DEFAULT_SYSTEM_SETTINGS.id,
      markets: DEFAULT_SYSTEM_SETTINGS.markets,
      operational: DEFAULT_SYSTEM_SETTINGS.operational,
      refundPolicyTiers: DEFAULT_SYSTEM_SETTINGS.refundPolicyTiers,
      notifications: DEFAULT_SYSTEM_SETTINGS.notifications,
      maintenanceAndSupport: DEFAULT_SYSTEM_SETTINGS.maintenanceAndSupport,
      featureFlags: DEFAULT_SYSTEM_SETTINGS.featureFlags,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: systemSettings.id,
      set: {
        markets: DEFAULT_SYSTEM_SETTINGS.markets,
        operational: DEFAULT_SYSTEM_SETTINGS.operational,
        refundPolicyTiers: DEFAULT_SYSTEM_SETTINGS.refundPolicyTiers,
        notifications: DEFAULT_SYSTEM_SETTINGS.notifications,
        maintenanceAndSupport: DEFAULT_SYSTEM_SETTINGS.maintenanceAndSupport,
        featureFlags: DEFAULT_SYSTEM_SETTINGS.featureFlags,
        updatedAt: now,
      },
    });

  // 2. Seed auth_settings
  await db
    .insert(authSettings)
    .values({
      id: DEFAULT_AUTH_SETTINGS.id,
      otpExpirySeconds: DEFAULT_AUTH_SETTINGS.otpExpirySeconds,
      otpResendCooldownSeconds: DEFAULT_AUTH_SETTINGS.otpResendCooldownSeconds,
      otpMaxWrongAttempts: DEFAULT_AUTH_SETTINGS.otpMaxWrongAttempts,
      otpPauseDurationSeconds: DEFAULT_AUTH_SETTINGS.otpPauseDurationSeconds,
      otpDeliveryMaxRetries: DEFAULT_AUTH_SETTINGS.otpDeliveryMaxRetries,
      otpFallbackChannelEnabled: DEFAULT_AUTH_SETTINGS.otpFallbackChannelEnabled,
      maxFailedSignInAttempts: DEFAULT_AUTH_SETTINGS.maxFailedSignInAttempts,
      lockoutDurationSeconds: DEFAULT_AUTH_SETTINGS.lockoutDurationSeconds,
      passwordMinLength: DEFAULT_AUTH_SETTINGS.passwordMinLength,
      breachedPasswordCheckEnabled: DEFAULT_AUTH_SETTINGS.breachedPasswordCheckEnabled,
      passwordHashAlgorithm: DEFAULT_AUTH_SETTINGS.passwordHashAlgorithm,
      accessTokenTtlSeconds: DEFAULT_AUTH_SETTINGS.accessTokenTtlSeconds,
      webSessionMaxSeconds: DEFAULT_AUTH_SETTINGS.webSessionMaxSeconds,
      rotateRefreshTokens: DEFAULT_AUTH_SETTINGS.rotateRefreshTokens,
      retainDraftsOnSessionExpiry: DEFAULT_AUTH_SETTINGS.retainDraftsOnSessionExpiry,
      deletionGraceDays: DEFAULT_AUTH_SETTINGS.deletionGraceDays,
      adminInviteTtlHours: DEFAULT_AUTH_SETTINGS.adminInviteTtlHours,
      employeeInviteTtlDays: DEFAULT_AUTH_SETTINGS.employeeInviteTtlDays,
      orgSupplierInviteTtlDays: DEFAULT_AUTH_SETTINGS.orgSupplierInviteTtlDays,
      moderatorCodePostTripHours: DEFAULT_AUTH_SETTINGS.moderatorCodePostTripHours,
      newDeviceAlertRoles: DEFAULT_AUTH_SETTINGS.newDeviceAlertRoles,
      roleAuthPolicies: DEFAULT_AUTH_SETTINGS.roleAuthPolicies,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: authSettings.id,
      set: {
        otpExpirySeconds: DEFAULT_AUTH_SETTINGS.otpExpirySeconds,
        otpResendCooldownSeconds: DEFAULT_AUTH_SETTINGS.otpResendCooldownSeconds,
        otpMaxWrongAttempts: DEFAULT_AUTH_SETTINGS.otpMaxWrongAttempts,
        otpPauseDurationSeconds: DEFAULT_AUTH_SETTINGS.otpPauseDurationSeconds,
        otpDeliveryMaxRetries: DEFAULT_AUTH_SETTINGS.otpDeliveryMaxRetries,
        otpFallbackChannelEnabled: DEFAULT_AUTH_SETTINGS.otpFallbackChannelEnabled,
        maxFailedSignInAttempts: DEFAULT_AUTH_SETTINGS.maxFailedSignInAttempts,
        lockoutDurationSeconds: DEFAULT_AUTH_SETTINGS.lockoutDurationSeconds,
        passwordMinLength: DEFAULT_AUTH_SETTINGS.passwordMinLength,
        breachedPasswordCheckEnabled: DEFAULT_AUTH_SETTINGS.breachedPasswordCheckEnabled,
        accessTokenTtlSeconds: DEFAULT_AUTH_SETTINGS.accessTokenTtlSeconds,
        webSessionMaxSeconds: DEFAULT_AUTH_SETTINGS.webSessionMaxSeconds,
        rotateRefreshTokens: DEFAULT_AUTH_SETTINGS.rotateRefreshTokens,
        retainDraftsOnSessionExpiry: DEFAULT_AUTH_SETTINGS.retainDraftsOnSessionExpiry,
        deletionGraceDays: DEFAULT_AUTH_SETTINGS.deletionGraceDays,
        adminInviteTtlHours: DEFAULT_AUTH_SETTINGS.adminInviteTtlHours,
        employeeInviteTtlDays: DEFAULT_AUTH_SETTINGS.employeeInviteTtlDays,
        orgSupplierInviteTtlDays: DEFAULT_AUTH_SETTINGS.orgSupplierInviteTtlDays,
        moderatorCodePostTripHours: DEFAULT_AUTH_SETTINGS.moderatorCodePostTripHours,
        newDeviceAlertRoles: DEFAULT_AUTH_SETTINGS.newDeviceAlertRoles,
        roleAuthPolicies: DEFAULT_AUTH_SETTINGS.roleAuthPolicies,
        updatedAt: now,
      },
    });

  // 3. Seed role_definitions for all 10 user roles
  for (const roleKey of USER_ROLES) {
    const def = ROLE_AUTH_DEFAULTS[roleKey];
    await db
      .insert(roleDefinitions)
      .values({
        role: def.role,
        nameEn: def.nameEn,
        nameAr: def.nameAr,
        descriptionEn: def.descriptionEn,
        descriptionAr: def.descriptionAr,
        selfRegistrationAllowed: def.selfRegistrationAllowed,
        allowedSurfaces: def.allowedSurfaces,
        requiredVerificationChannels: def.requiredVerificationChannels,
        allowedPrimaryMethods: def.allowedPrimaryMethods,
        requiredSecondFactor: def.requiredSecondFactor,
        requiresApproval: def.requiresApproval,
        planScope: def.planScope,
        defaultPlanTier: def.defaultPlanTier,
        rateLimitPerMinute: def.rateLimitPerMinute,
        subRoles: def.subRoles,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: roleDefinitions.role,
        set: {
          nameEn: def.nameEn,
          nameAr: def.nameAr,
          descriptionEn: def.descriptionEn,
          descriptionAr: def.descriptionAr,
          selfRegistrationAllowed: def.selfRegistrationAllowed,
          allowedSurfaces: def.allowedSurfaces,
          requiredVerificationChannels: def.requiredVerificationChannels,
          allowedPrimaryMethods: def.allowedPrimaryMethods,
          requiredSecondFactor: def.requiredSecondFactor,
          requiresApproval: def.requiresApproval,
          planScope: def.planScope,
          defaultPlanTier: def.defaultPlanTier,
          rateLimitPerMinute: def.rateLimitPerMinute,
          subRoles: def.subRoles,
          updatedAt: now,
        },
      });
  }

  // 4. Seed permission_catalog for all 9 organization permission areas (D-284)
  for (const perm of DEFAULT_PERMISSION_CATALOG) {
    await db
      .insert(permissionCatalog)
      .values({
        area: perm.area,
        nameEn: perm.nameEn,
        nameAr: perm.nameAr,
        descriptionEn: perm.descriptionEn,
        descriptionAr: perm.descriptionAr,
        allowedLevels: perm.allowedLevels,
        mappedScreens: perm.mappedScreens,
        ownerOnlyByDefault: perm.ownerOnlyByDefault,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: permissionCatalog.area,
        set: {
          nameEn: perm.nameEn,
          nameAr: perm.nameAr,
          descriptionEn: perm.descriptionEn,
          descriptionAr: perm.descriptionAr,
          allowedLevels: perm.allowedLevels,
          mappedScreens: perm.mappedScreens,
          ownerOnlyByDefault: perm.ownerOnlyByDefault,
          updatedAt: now,
        },
      });
  }

  // 5. Seed plan_catalog for all 12 subscription plan tiers
  for (const plan of DEFAULT_PLAN_CATALOG) {
    await db
      .insert(planCatalog)
      .values({
        id: plan.id,
        role: plan.role,
        tier: plan.tier,
        nameEn: plan.nameEn,
        nameAr: plan.nameAr,
        monthlyPriceMinor: plan.monthlyPriceMinor,
        annualPriceMinor: plan.annualPriceMinor,
        currencyCode: plan.currencyCode,
        annualDiscountBps: plan.annualDiscountBps,
        trialDays: plan.trialDays,
        gracePeriodDays: plan.gracePeriodDays,
        limits: plan.limits,
        features: plan.features,
        isDefault: plan.isDefault,
        status: plan.status,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: planCatalog.id,
        set: {
          nameEn: plan.nameEn,
          nameAr: plan.nameAr,
          monthlyPriceMinor: plan.monthlyPriceMinor,
          annualPriceMinor: plan.annualPriceMinor,
          currencyCode: plan.currencyCode,
          annualDiscountBps: plan.annualDiscountBps,
          trialDays: plan.trialDays,
          gracePeriodDays: plan.gracePeriodDays,
          limits: plan.limits,
          features: plan.features,
          isDefault: plan.isDefault,
          status: plan.status,
          updatedAt: now,
        },
      });
  }

  // 6. Seed Bootstrap Super Admin Account
  const passwordHash = await hashPassword(adminPassword);
  const emailBlindIndex = computeBlindIndex(adminEmail);
  const phoneBlindIndex = computeBlindIndex(adminPhone);

  // Reuse the existing bootstrap admin when re-seeding so the seeder stays idempotent without
  // relying on a hardcoded identifier.
  const [existingSuperAdmin] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.emailBlindIndex, emailBlindIndex))
    .limit(1);
  const superAdminId = existingSuperAdmin?.id ?? randomUUID();

  await db
    .insert(accounts)
    .values({
      id: superAdminId,
      emailNormalized: adminEmail,
      emailBlindIndex,
      emailEncrypted: encryptField(adminEmail),
      phoneE164: adminPhone,
      phoneBlindIndex,
      phoneEncrypted: encryptField(adminPhone),
      emailVerifiedAt: now,
      phoneVerifiedAt: now,
      passwordHash,
      passwordChangedAt: now,
      preferredSignInMethod: "password",
      totpSecretEncrypted: encryptField(adminTotpSecret),
      totpEnabledAt: now,
      fullName: "Platform Super Admin / مدير النظام الأعلى",
      preferredLanguage: "ar",
      status: "active",
      failedSignInAttempts: 0,
      knownDeviceFingerprints: ["bootstrap-admin-device"],
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: accounts.id,
      set: {
        emailNormalized: adminEmail,
        emailBlindIndex,
        emailEncrypted: encryptField(adminEmail),
        phoneE164: adminPhone,
        phoneBlindIndex,
        phoneEncrypted: encryptField(adminPhone),
        emailVerifiedAt: now,
        phoneVerifiedAt: now,
        passwordHash,
        totpSecretEncrypted: encryptField(adminTotpSecret),
        totpEnabledAt: now,
        status: "active",
        updatedAt: now,
      },
    });

  const [existingSuperAdminRole] = await db
    .select({ id: accountRoles.id })
    .from(accountRoles)
    .where(
      and(
        eq(accountRoles.accountId, superAdminId),
        eq(accountRoles.role, "admin"),
        eq(accountRoles.adminSubRole, "super_admin"),
      ),
    )
    .limit(1);

  await db
    .insert(accountRoles)
    .values({
      id: existingSuperAdminRole?.id ?? randomUUID(),
      accountId: superAdminId,
      role: "admin",
      adminSubRole: "super_admin",
      tenantId: null,
      planTier: null,
      status: "active",
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: accountRoles.id,
      set: {
        role: "admin",
        adminSubRole: "super_admin",
        status: "active",
        updatedAt: now,
      },
    });

  await db
    .insert(notificationPreferences)
    .values({
      accountId: superAdminId,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: notificationPreferences.accountId,
      set: { updatedAt: now },
    });

  // 7. Seed lookup_types and lookups (linked to bootstrap Super Admin as created_by / updated_by)
  const lookupsSummary = await seedLookupsData(db, {
    actorAccountId: superAdminId,
    now,
  });

  const [existingSeedAuditLog] = await db
    .select({ id: auditLogs.id })
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.action, "seed.default.completed"),
        eq(auditLogs.targetEntityType, "system_settings"),
      ),
    )
    .limit(1);

  await db
    .insert(auditLogs)
    .values({
      id: existingSeedAuditLog?.id ?? randomUUID(),
      actorAccountId: superAdminId,
      actorRole: "system",
      action: "seed.default.completed",
      targetEntityType: "system_settings",
      targetEntityId: "default",
      reason: "Initial default platform seed executed",
      afterState: {
        roles: USER_ROLES.length,
        permissions: DEFAULT_PERMISSION_CATALOG.length,
        plans: DEFAULT_PLAN_CATALOG.length,
        lookupTypes: lookupsSummary.lookupTypesSeeded,
        lookups: lookupsSummary.lookupsSeeded,
      },
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: auditLogs.id,
      set: {
        afterState: {
          roles: USER_ROLES.length,
          permissions: DEFAULT_PERMISSION_CATALOG.length,
          plans: DEFAULT_PLAN_CATALOG.length,
          lookupTypes: lookupsSummary.lookupTypesSeeded,
          lookups: lookupsSummary.lookupsSeeded,
        },
        createdAt: now,
      },
    });

  return {
    mode: "default",
    systemSettingsSeeded: true,
    authSettingsSeeded: true,
    rolesSeeded: USER_ROLES.length,
    permissionsSeeded: DEFAULT_PERMISSION_CATALOG.length,
    plansSeeded: DEFAULT_PLAN_CATALOG.length,
    lookupTypesSeeded: lookupsSummary.lookupTypesSeeded,
    lookupsSeeded: lookupsSummary.lookupsSeeded,
    bootstrapSuperAdmin: {
      id: superAdminId,
      email: adminEmail,
      phone: adminPhone,
      defaultPassword: adminPassword,
      totpSecret: adminTotpSecret,
      subRole: "super_admin",
    },
  };
}
