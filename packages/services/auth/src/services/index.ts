// Business logic for Auth. Routes call this factory with context.db; repositories are created here.
import { AuthServiceError } from "../errors";
import {
  type AdminSubRole,
  type AuthSettingsData,
  buildTotpOtpAuthUri,
  type ClientSurface,
  computeBlindIndex,
  DEFAULT_AUTH_SETTINGS,
  DEFAULT_PERMISSION_CATALOG,
  DEFAULT_PLAN_CATALOG,
  decryptField,
  EMPLOYEE_ROLE_PRESETS,
  encryptField,
  evaluateOtpAttempt,
  evaluateSignInLockout,
  findPlanCatalogEntry,
  generateNumericOtp,
  generateRandomToken,
  generateTotpSecret,
  hasRequiredVerifiedChannels,
  hashPassword,
  hashSha256,
  isWithinDeletionGraceWindow,
  normalizeEmail,
  normalizePhoneE164,
  type OrgPermissionMatrix,
  type OtpChannel,
  type OtpPurpose,
  ROLE_AUTH_DEFAULTS,
  signAccessToken,
  USER_ROLES,
  type UserRole,
  validatePasswordPolicy,
  validateRegistrationInput,
  verifyAccessToken,
  verifyPassword,
  verifyTotpCode,
} from "../model";
import { createAuthRepository, type ServiceDatabase } from "../repository";
import type {
  AcceptEmployeeInviteInput,
  AdminAcceptInviteInput,
  AdminEnrollTotpInput,
  AdminInviteStaffInput,
  AdminResetTotpInput,
  AdminSignInInput,
  AdminVerifyTotpInput,
  ChangeSignInMethodInput,
  ConfirmContactChangeInput,
  ConfirmPasswordResetInput,
  GetPlanCatalogInput,
  InviteEmployeeInput,
  ModeratorSignInInput,
  RefreshSessionInput,
  RegisterSupplierAccountInput,
  RegisterTravelerInput,
  ReinstateAccountInput,
  RequestAccountDeletionInput,
  RequestContactChangeInput,
  RequestPasswordResetInput,
  ResendOtpInput,
  RestoreAccountFromDeletionInput,
  SignInInput,
  SignOutInput,
  StaffSetupSecondFactorInput,
  StaffSignInInput,
  StaffVerifySecondFactorInput,
  SuspendAccountInput,
  SwitchOrganizationInput,
  SwitchRoleInput,
  UpdateAuthSettingsInput,
  VerifyOtpInput,
} from "../schemas/dtos";
import type { AuthRequestMeta, OtpDispatchResult } from "../types";

export function createAuthService(db: ServiceDatabase) {
  const repo = createAuthRepository(db);

  async function loadEffectiveAuthSettings(): Promise<AuthSettingsData> {
    const row = await repo.getAuthSettingsRow();
    if (!row) return DEFAULT_AUTH_SETTINGS;
    return {
      id: row.id,
      otpExpirySeconds: row.otpExpirySeconds,
      otpResendCooldownSeconds: row.otpResendCooldownSeconds,
      otpMaxWrongAttempts: row.otpMaxWrongAttempts,
      otpPauseDurationSeconds: row.otpPauseDurationSeconds,
      otpDeliveryMaxRetries: row.otpDeliveryMaxRetries,
      otpFallbackChannelEnabled: row.otpFallbackChannelEnabled,
      maxFailedSignInAttempts: row.maxFailedSignInAttempts,
      lockoutDurationSeconds: row.lockoutDurationSeconds,
      passwordMinLength: row.passwordMinLength,
      breachedPasswordCheckEnabled: row.breachedPasswordCheckEnabled,
      passwordHashAlgorithm: row.passwordHashAlgorithm,
      accessTokenTtlSeconds: row.accessTokenTtlSeconds,
      webSessionMaxSeconds: row.webSessionMaxSeconds,
      rotateRefreshTokens: row.rotateRefreshTokens,
      retainDraftsOnSessionExpiry: row.retainDraftsOnSessionExpiry,
      deletionGraceDays: row.deletionGraceDays,
      adminInviteTtlHours: row.adminInviteTtlHours,
      employeeInviteTtlDays: row.employeeInviteTtlDays,
      orgSupplierInviteTtlDays: row.orgSupplierInviteTtlDays,
      moderatorCodePostTripHours: row.moderatorCodePostTripHours,
      newDeviceAlertRoles: row.newDeviceAlertRoles,
      roleAuthPolicies: row.roleAuthPolicies,
    };
  }

  async function findAccountByIdentifier(identifier: string) {
    const trimmed = identifier.trim();
    if (trimmed.includes("@")) {
      const normalized = normalizeEmail(trimmed);
      return repo.findAccountByEmailBlindIndex(computeBlindIndex(normalized));
    }
    const normalizedPhone = normalizePhoneE164(trimmed);
    return repo.findAccountByPhoneBlindIndex(computeBlindIndex(normalizedPhone));
  }

  function normalizeTargetIdentifier(identifier: string): {
    normalized: string;
    channel: OtpChannel;
  } {
    if (identifier.includes("@")) {
      return { normalized: normalizeEmail(identifier), channel: "email" };
    }
    return { normalized: normalizePhoneE164(identifier), channel: "sms" };
  }

  async function issueOtpCode(params: {
    accountId?: string | null;
    targetIdentifier: string;
    channel: OtpChannel;
    purpose: OtpPurpose;
    authSettings: AuthSettingsData;
  }): Promise<OtpDispatchResult> {
    const code = generateNumericOtp(6);
    const expiresAt = new Date(Date.now() + params.authSettings.otpExpirySeconds * 1000);
    await repo.createOtpVerification({
      accountId: params.accountId ?? null,
      targetIdentifier: params.targetIdentifier,
      channel: params.channel,
      purpose: params.purpose,
      codeHash: hashSha256(code),
      expiresAt,
      deliveryStatus: "sent",
    });

    return {
      channel: params.channel,
      targetIdentifier: params.targetIdentifier,
      expiresAt: expiresAt.toISOString(),
      resendAvailableInSeconds: params.authSettings.otpResendCooldownSeconds,
      fallbackChannelAvailable: params.authSettings.otpFallbackChannelEnabled,
      devCodePreview: process.env.NODE_ENV === "production" ? undefined : code,
    };
  }

  async function createSessionAndTokens(params: {
    accountId: string;
    activeRole: UserRole;
    adminSubRole?: AdminSubRole | null;
    activeTenantId?: string | null;
    planTier?: string | null;
    permissions?: Partial<OrgPermissionMatrix> | null;
    moderatorVehicleId?: string | null;
    moderatorTripId?: string | null;
    surface: ClientSurface;
    meta?: AuthRequestMeta;
    secondFactorVerified?: boolean;
    authSettings: AuthSettingsData;
  }) {
    const now = new Date();
    const refreshToken = generateRandomToken(32);
    const refreshTokenHash = hashSha256(refreshToken);

    const maxSessionSeconds =
      params.surface === "web" ? params.authSettings.webSessionMaxSeconds : 30 * 24 * 60 * 60;
    const maxSessionExpiresAt = new Date(now.getTime() + maxSessionSeconds * 1000);
    const expiresAt = maxSessionExpiresAt;

    const session = await repo.createSession({
      accountId: params.accountId,
      activeRole: params.activeRole,
      adminSubRole: params.adminSubRole ?? null,
      activeTenantId: params.activeTenantId ?? null,
      moderatorVehicleId: params.moderatorVehicleId ?? null,
      moderatorTripId: params.moderatorTripId ?? null,
      refreshTokenHash,
      surface: params.surface,
      deviceFingerprint: params.meta?.deviceFingerprint ?? null,
      ipAddress: params.meta?.ipAddress ?? null,
      userAgent: params.meta?.userAgent ?? null,
      secondFactorVerifiedAt: params.secondFactorVerified ? now : null,
      expiresAt,
      maxSessionExpiresAt,
    });

    // Check new-device sign-in alert for Admin and Organization Owner (D-54)
    const account = await repo.findAccountById(params.accountId);
    let newDeviceAlertTriggered = false;
    if (
      account &&
      params.meta?.deviceFingerprint &&
      params.authSettings.newDeviceAlertRoles.includes(params.activeRole)
    ) {
      const known = account.knownDeviceFingerprints ?? [];
      if (!known.includes(params.meta.deviceFingerprint)) {
        newDeviceAlertTriggered = true;
        await repo.updateAccount(account.id, {
          knownDeviceFingerprints: [...known, params.meta.deviceFingerprint],
        });
      }
    }

    const accessToken = signAccessToken(
      {
        sub: params.accountId,
        sid: session.id,
        role: params.activeRole,
        adminSubRole: params.adminSubRole ?? null,
        tenantId: params.activeTenantId ?? null,
        planTier: params.planTier ?? null,
        permissions: params.permissions ?? null,
        moderatorVehicleId: params.moderatorVehicleId ?? null,
        moderatorTripId: params.moderatorTripId ?? null,
      },
      { ttlSeconds: params.authSettings.accessTokenTtlSeconds },
    );

    return {
      sessionId: session.id,
      accessToken,
      refreshToken,
      accessTokenExpiresInSeconds: params.authSettings.accessTokenTtlSeconds,
      sessionMaxExpiresAt: maxSessionExpiresAt.toISOString(),
      activeRole: params.activeRole,
      adminSubRole: params.adminSubRole ?? null,
      activeTenantId: params.activeTenantId ?? null,
      planTier: params.planTier ?? null,
      permissions: params.permissions ?? null,
      moderatorVehicleId: params.moderatorVehicleId ?? null,
      moderatorTripId: params.moderatorTripId ?? null,
      newDeviceAlertTriggered,
    };
  }

  return {
    // 1. Catalogs & Auth Settings
    async getRoleCatalog() {
      const rows = await repo.listRoleDefinitions();
      if (rows.length > 0) return rows;
      return USER_ROLES.map((roleKey) => ROLE_AUTH_DEFAULTS[roleKey]);
    },

    async getPermissionCatalog() {
      const rows = await repo.listPermissionCatalog();
      return {
        areas: rows.length > 0 ? rows : DEFAULT_PERMISSION_CATALOG,
        presets: EMPLOYEE_ROLE_PRESETS,
      };
    },

    async getPlanCatalog(input?: GetPlanCatalogInput) {
      const rows = await repo.listPlanCatalog(input?.role);
      if (rows.length > 0) return rows;
      if (input?.role) {
        return DEFAULT_PLAN_CATALOG.filter((p) => p.role === input.role);
      }
      return DEFAULT_PLAN_CATALOG;
    },

    async getAuthSettings() {
      return loadEffectiveAuthSettings();
    },

    async updateAuthSettings(
      actor: { accountId: string; activeRole: UserRole; adminSubRole?: AdminSubRole | null },
      input: UpdateAuthSettingsInput,
      meta?: AuthRequestMeta,
    ) {
      if (actor.activeRole !== "admin" || actor.adminSubRole !== "super_admin") {
        throw new AuthServiceError(
          "FORBIDDEN",
          "Only Super Admin can update platform authentication settings.",
        );
      }

      const before = await loadEffectiveAuthSettings();
      const { reason, ...patch } = input;
      const updated = await repo.upsertAuthSettingsRow({
        ...patch,
        updatedByAccountId: actor.accountId,
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: "admin",
        action: "settings.auth.updated",
        targetEntityType: "auth_settings",
        targetEntityId: "default",
        reason,
        beforeState: before as unknown as Record<string, unknown>,
        afterState: (updated ?? { ...before, ...patch }) as unknown as Record<string, unknown>,
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return loadEffectiveAuthSettings();
    },

    // 2. Registration & Verification
    async registerTraveler(input: RegisterTravelerInput, _meta?: AuthRequestMeta) {
      const settings = await loadEffectiveAuthSettings();
      const validation = validateRegistrationInput({
        role: "traveler",
        surface: input.surface,
        email: input.email,
        phone: input.phone,
        authSettings: settings,
      });
      if (!validation.valid) {
        throw new AuthServiceError(
          validation.code ?? "VALIDATION_ERROR",
          validation.reason ?? "Invalid registration input.",
          validation.field ? { field: validation.field } : undefined,
        );
      }

      let passwordHash: string | null = null;
      if (input.password) {
        const pwCheck = validatePasswordPolicy(input.password, settings);
        if (!pwCheck.valid) {
          throw new AuthServiceError("VALIDATION_ERROR", pwCheck.reason!, {
            field: "password",
          });
        }
        passwordHash = await hashPassword(input.password);
      } else if (input.preferredSignInMethod === "password") {
        throw new AuthServiceError(
          "VALIDATION_ERROR",
          "A password is required when preferredSignInMethod is password.",
          { field: "password" },
        );
      }

      const emailNorm = input.email ? normalizeEmail(input.email) : null;
      const phoneNorm = input.phone ? normalizePhoneE164(input.phone) : null;

      if (emailNorm) {
        const existingEmail = await repo.findAccountByEmailBlindIndex(computeBlindIndex(emailNorm));
        if (existingEmail) {
          throw new AuthServiceError(
            "CONFLICT",
            "An account with this email address already exists.",
            { field: "email" },
          );
        }
      }
      if (phoneNorm) {
        const existingPhone = await repo.findAccountByPhoneBlindIndex(computeBlindIndex(phoneNorm));
        if (existingPhone) {
          throw new AuthServiceError(
            "CONFLICT",
            "An account with this phone number already exists.",
            { field: "phone" },
          );
        }
      }

      const account = await repo.createAccount({
        emailNormalized: emailNorm,
        emailBlindIndex: emailNorm ? computeBlindIndex(emailNorm) : null,
        emailEncrypted: emailNorm ? encryptField(emailNorm) : null,
        phoneE164: phoneNorm,
        phoneBlindIndex: phoneNorm ? computeBlindIndex(phoneNorm) : null,
        phoneEncrypted: phoneNorm ? encryptField(phoneNorm) : null,
        passwordHash,
        passwordChangedAt: passwordHash ? new Date() : null,
        preferredSignInMethod: input.preferredSignInMethod,
        fullName: input.fullName,
        preferredLanguage: input.preferredLanguage,
        status: "pending_verification",
      });

      await repo.createAccountRole({
        accountId: account.id,
        role: "traveler",
        planTier: "free",
        status: "active",
        approvedAt: new Date(),
      });

      if (input.enableParentRole) {
        await repo.createAccountRole({
          accountId: account.id,
          role: "parent",
          planTier: "free",
          status: "active",
          approvedAt: new Date(),
        });
      }

      const otpDispatches: OtpDispatchResult[] = [];
      if (phoneNorm) {
        otpDispatches.push(
          await issueOtpCode({
            accountId: account.id,
            targetIdentifier: phoneNorm,
            channel: "sms",
            purpose: "registration",
            authSettings: settings,
          }),
        );
      }
      if (emailNorm) {
        otpDispatches.push(
          await issueOtpCode({
            accountId: account.id,
            targetIdentifier: emailNorm,
            channel: "email",
            purpose: "registration",
            authSettings: settings,
          }),
        );
      }

      return {
        accountId: account.id,
        status: account.status,
        roles: input.enableParentRole ? ["traveler", "parent"] : ["traveler"],
        defaultPlanTier: "free",
        verificationRequired: "either_email_or_phone" as const,
        otpDispatches,
      };
    },

    async registerSupplierAccount(input: RegisterSupplierAccountInput, _meta?: AuthRequestMeta) {
      const settings = await loadEffectiveAuthSettings();
      const validation = validateRegistrationInput({
        role: input.role,
        surface: input.surface,
        email: input.email,
        phone: input.phone,
        authSettings: settings,
      });
      if (!validation.valid) {
        throw new AuthServiceError(
          validation.code ?? "VALIDATION_ERROR",
          validation.reason ?? "Invalid supplier registration input.",
          validation.field ? { field: validation.field } : undefined,
        );
      }

      const pwCheck = validatePasswordPolicy(input.password, settings);
      if (!pwCheck.valid) {
        throw new AuthServiceError("VALIDATION_ERROR", pwCheck.reason!, {
          field: "password",
        });
      }

      const emailNorm = normalizeEmail(input.email);
      const phoneNorm = normalizePhoneE164(input.phone);

      const existingByEmail = await repo.findAccountByEmailBlindIndex(computeBlindIndex(emailNorm));
      const existingByPhone = await repo.findAccountByPhoneBlindIndex(computeBlindIndex(phoneNorm));

      if (existingByEmail && existingByPhone && existingByEmail.id !== existingByPhone.id) {
        throw new AuthServiceError(
          "CONFLICT",
          "Email and phone belong to two different existing accounts.",
        );
      }

      let account = existingByEmail ?? existingByPhone;
      const passwordHash = await hashPassword(input.password);

      if (!account) {
        account = await repo.createAccount({
          emailNormalized: emailNorm,
          emailBlindIndex: computeBlindIndex(emailNorm),
          emailEncrypted: encryptField(emailNorm),
          phoneE164: phoneNorm,
          phoneBlindIndex: computeBlindIndex(phoneNorm),
          phoneEncrypted: encryptField(phoneNorm),
          passwordHash,
          passwordChangedAt: new Date(),
          preferredSignInMethod: "password",
          fullName: input.fullName,
          preferredLanguage: input.preferredLanguage,
          status: "pending_verification",
        });

        // Per BRL-06, platform_driver and platform_photographer also retain a Traveler profile
        if (input.role === "platform_driver" || input.role === "platform_photographer") {
          await repo.createAccountRole({
            accountId: account.id,
            role: "traveler",
            planTier: "free",
            status: "active",
            approvedAt: new Date(),
          });
        }
      }

      const existingRoles = await repo.listRolesForAccount(account.id);
      if (!existingRoles.some((r) => r.role === input.role)) {
        const defaultPlan = ROLE_AUTH_DEFAULTS[input.role].defaultPlanTier;
        await repo.createAccountRole({
          accountId: account.id,
          role: input.role,
          planTier: defaultPlan,
          status: "pending_approval",
        });
      }

      const otpDispatches: OtpDispatchResult[] = [
        await issueOtpCode({
          accountId: account.id,
          targetIdentifier: emailNorm,
          channel: "email",
          purpose: "registration",
          authSettings: settings,
        }),
        await issueOtpCode({
          accountId: account.id,
          targetIdentifier: phoneNorm,
          channel: "sms",
          purpose: "registration",
          authSettings: settings,
        }),
      ];

      return {
        accountId: account.id,
        role: input.role,
        status: account.status,
        verificationRequired: "both_email_and_phone" as const,
        otpDispatches,
      };
    },

    async verifyOtp(input: VerifyOtpInput, meta?: AuthRequestMeta) {
      const settings = await loadEffectiveAuthSettings();
      const { normalized, channel } = normalizeTargetIdentifier(input.targetIdentifier);
      const latestOtp = await repo.findLatestOtp(normalized, input.purpose);

      if (!latestOtp) {
        throw new AuthServiceError(
          "VALIDATION_ERROR",
          "No active verification code found for this identifier.",
        );
      }

      const now = new Date();
      const providedMatches = latestOtp.codeHash === hashSha256(input.code);
      const evaluation = evaluateOtpAttempt({
        state: {
          wrongAttempts: latestOtp.wrongAttempts,
          pausedUntil: latestOtp.pausedUntil,
          expiresAt: latestOtp.expiresAt,
          consumedAt: latestOtp.consumedAt,
        },
        providedMatches,
        now,
        authSettings: settings,
      });

      if (!evaluation.matched) {
        await repo.updateOtpVerification(latestOtp.id, {
          wrongAttempts: evaluation.nextWrongAttempts,
          pausedUntil: evaluation.nextPausedUntil,
        });
        throw new AuthServiceError(
          evaluation.code ?? "VALIDATION_ERROR",
          evaluation.reason ?? "Invalid verification code.",
          {
            wrongAttempts: evaluation.nextWrongAttempts,
            pausedUntil: evaluation.nextPausedUntil?.toISOString() ?? null,
          },
        );
      }

      await repo.updateOtpVerification(latestOtp.id, {
        wrongAttempts: 0,
        pausedUntil: null,
        consumedAt: now,
      });

      const account = latestOtp.accountId
        ? await repo.findAccountById(latestOtp.accountId)
        : await findAccountByIdentifier(normalized);

      if (!account) {
        return { verified: true, channel, accountActivated: false };
      }

      const updatedFields: Partial<{
        emailVerifiedAt: Date | null;
        phoneVerifiedAt: Date | null;
        status: "pending_verification" | "active";
      }> = {};

      if (channel === "email") {
        updatedFields.emailVerifiedAt = now;
      } else {
        updatedFields.phoneVerifiedAt = now;
      }

      const nextAccountState = {
        emailVerifiedAt: updatedFields.emailVerifiedAt ?? account.emailVerifiedAt,
        phoneVerifiedAt: updatedFields.phoneVerifiedAt ?? account.phoneVerifiedAt,
      };

      const roles = await repo.listRolesForAccount(account.id);
      const supplierRoleRow = roles.find(
        (r) =>
          r.role === "organization_owner" ||
          r.role === "platform_driver" ||
          r.role === "platform_photographer",
      );
      const primaryRole = supplierRoleRow?.role ?? roles[0]?.role ?? "traveler";
      const allRequiredChannelsVerified = hasRequiredVerifiedChannels(
        primaryRole,
        nextAccountState,
        settings,
      );

      if (account.status === "pending_verification" && allRequiredChannelsVerified) {
        updatedFields.status = "active";
      }

      const updatedAccount = await repo.updateAccount(account.id, updatedFields);

      let sessionTokens = null;
      if (
        updatedAccount?.status === "active" &&
        (input.purpose === "registration" || input.purpose === "sign_in")
      ) {
        const activeRoleRow = roles.find((r) => r.status === "active") ?? roles[0];
        if (activeRoleRow) {
          sessionTokens = await createSessionAndTokens({
            accountId: account.id,
            activeRole: activeRoleRow.role,
            adminSubRole: activeRoleRow.adminSubRole,
            activeTenantId: activeRoleRow.tenantId,
            planTier: activeRoleRow.planTier,
            surface: input.surface,
            meta,
            authSettings: settings,
          });
        }
      }

      return {
        verified: true,
        channel,
        accountId: account.id,
        accountActivated: updatedAccount?.status === "active",
        allRequiredChannelsVerified,
        session: sessionTokens,
      };
    },

    async resendOtp(input: ResendOtpInput) {
      const settings = await loadEffectiveAuthSettings();
      const { normalized, channel: detectedChannel } = normalizeTargetIdentifier(
        input.targetIdentifier,
      );
      const existing = await repo.findLatestOtp(normalized, input.purpose);
      const now = new Date();

      if (existing) {
        if (existing.pausedUntil && existing.pausedUntil.getTime() > now.getTime()) {
          throw new AuthServiceError(
            "RATE_LIMITED",
            "Verification is paused for 15 minutes due to repeated wrong attempts.",
            { pausedUntil: existing.pausedUntil.toISOString() },
          );
        }

        const elapsedSec = (now.getTime() - existing.lastSentAt.getTime()) / 1000;
        if (elapsedSec < settings.otpResendCooldownSeconds && !input.useFallbackChannel) {
          throw new AuthServiceError(
            "RATE_LIMITED",
            `Please wait ${Math.ceil(settings.otpResendCooldownSeconds - elapsedSec)} seconds before requesting another code.`,
            {
              retryAfterSeconds: Math.ceil(settings.otpResendCooldownSeconds - elapsedSec),
            },
          );
        }
      }

      const account = await findAccountByIdentifier(normalized);
      let targetIdentifier = normalized;
      let targetChannel: OtpChannel = input.channel ?? detectedChannel;

      // D-59: If fallback channel requested and account has alternate verified/known channel, switch channel
      if (input.useFallbackChannel && settings.otpFallbackChannelEnabled && account) {
        if (targetChannel === "sms" && account.emailNormalized) {
          targetChannel = "email";
          targetIdentifier = account.emailNormalized;
        } else if (targetChannel === "email" && account.phoneE164) {
          targetChannel = "sms";
          targetIdentifier = account.phoneE164;
        }
      }

      return issueOtpCode({
        accountId: account?.id ?? existing?.accountId ?? null,
        targetIdentifier,
        channel: targetChannel,
        purpose: input.purpose,
        authSettings: settings,
      });
    },

    // 3. Sign-In for Traveler, Parent, Driver, Photographer
    async signIn(input: SignInInput, meta?: AuthRequestMeta) {
      const settings = await loadEffectiveAuthSettings();
      const account = await findAccountByIdentifier(input.identifier);
      const now = new Date();

      if (!account) {
        throw new AuthServiceError("UNAUTHORIZED", "Invalid credentials.");
      }

      if (account.lockedUntil && account.lockedUntil.getTime() > now.getTime()) {
        throw new AuthServiceError(
          "RATE_LIMITED",
          "Account is temporarily locked for 15 minutes due to 5 failed sign-in attempts.",
          {
            lockedUntil: account.lockedUntil.toISOString(),
            remainingLockoutSeconds: Math.ceil(
              (account.lockedUntil.getTime() - now.getTime()) / 1000,
            ),
          },
        );
      }

      if (account.status === "suspended") {
        throw new AuthServiceError(
          "FORBIDDEN",
          `Account is suspended: ${account.suspendedReason ?? "Policy violation"}`,
          {
            status: "suspended",
            suspendedReason: account.suspendedReason,
          },
        );
      }

      if (account.status === "deleted") {
        throw new AuthServiceError("UNAUTHORIZED", "Account has been permanently deleted.");
      }

      // If OTP sign-in without a code, send the OTP challenge first
      if (input.method === "otp" && !input.otpCode) {
        const { normalized, channel } = normalizeTargetIdentifier(input.identifier);
        const dispatch = await issueOtpCode({
          accountId: account.id,
          targetIdentifier: normalized,
          channel,
          purpose: "sign_in",
          authSettings: settings,
        });
        return {
          step: "otp_required" as const,
          otpDispatch: dispatch,
        };
      }

      // Verify credentials
      let authenticated = false;
      if (input.method === "password") {
        if (!input.password || !account.passwordHash) {
          authenticated = false;
        } else {
          authenticated = await verifyPassword(input.password, account.passwordHash);
        }
      } else if (input.method === "otp" && input.otpCode) {
        const { normalized } = normalizeTargetIdentifier(input.identifier);
        const latestOtp = await repo.findLatestOtp(normalized, "sign_in");
        if (latestOtp) {
          const evalOtp = evaluateOtpAttempt({
            state: {
              wrongAttempts: latestOtp.wrongAttempts,
              pausedUntil: latestOtp.pausedUntil,
              expiresAt: latestOtp.expiresAt,
              consumedAt: latestOtp.consumedAt,
            },
            providedMatches: latestOtp.codeHash === hashSha256(input.otpCode),
            now,
            authSettings: settings,
          });
          if (evalOtp.matched) {
            authenticated = true;
            await repo.updateOtpVerification(latestOtp.id, {
              wrongAttempts: 0,
              pausedUntil: null,
              consumedAt: now,
            });
          } else {
            await repo.updateOtpVerification(latestOtp.id, {
              wrongAttempts: evalOtp.nextWrongAttempts,
              pausedUntil: evalOtp.nextPausedUntil,
            });
          }
        }
      }

      const lockoutEval = evaluateSignInLockout({
        failedAttempts: account.failedSignInAttempts,
        lockedUntil: account.lockedUntil,
        succeeded: authenticated,
        now,
        authSettings: settings,
      });

      await repo.updateAccount(account.id, {
        failedSignInAttempts: lockoutEval.nextFailedAttempts,
        lockedUntil: lockoutEval.nextLockedUntil,
      });

      if (!authenticated) {
        if (lockoutEval.locked) {
          throw new AuthServiceError(
            "RATE_LIMITED",
            "Account is locked for 15 minutes after 5 failed sign-in attempts.",
            { lockedUntil: lockoutEval.nextLockedUntil?.toISOString() },
          );
        }
        throw new AuthServiceError("UNAUTHORIZED", "Invalid credentials.");
      }

      // FR-AUTH-09 / D-38: Signing in during the 30-day deletion grace window automatically restores the account
      let autoRestoredFromDeletion = false;
      if (account.status === "deletion_requested") {
        if (isWithinDeletionGraceWindow(account.deletionRequestedAt, now, settings)) {
          await repo.updateAccount(account.id, {
            status: "active",
            deletionRequestedAt: null,
          });
          autoRestoredFromDeletion = true;
        } else {
          throw new AuthServiceError("FORBIDDEN", "The 30-day deletion grace period has expired.");
        }
      }

      const roles = await repo.listRolesForAccount(account.id);
      const selectedRoleRow = input.requestedRole
        ? roles.find((r) => r.role === input.requestedRole)
        : (roles.find((r) => r.status === "active") ?? roles[0]);

      if (!selectedRoleRow) {
        throw new AuthServiceError("FORBIDDEN", "Requested role is not assigned to this account.");
      }

      if (selectedRoleRow.status === "pending_approval") {
        const session = await createSessionAndTokens({
          accountId: account.id,
          activeRole: selectedRoleRow.role,
          adminSubRole: selectedRoleRow.adminSubRole,
          activeTenantId: selectedRoleRow.tenantId,
          planTier: selectedRoleRow.planTier,
          surface: input.surface,
          meta,
          authSettings: settings,
        });
        return {
          step: "application_pending_approval" as const,
          accountId: account.id,
          role: selectedRoleRow.role,
          status: selectedRoleRow.status,
          session,
        };
      }

      const session = await createSessionAndTokens({
        accountId: account.id,
        activeRole: selectedRoleRow.role,
        adminSubRole: selectedRoleRow.adminSubRole,
        activeTenantId: selectedRoleRow.tenantId,
        planTier: selectedRoleRow.planTier,
        surface: input.surface,
        meta,
        authSettings: settings,
      });

      return {
        step: "authenticated" as const,
        autoRestoredFromDeletion,
        roleStatus: selectedRoleRow.status,
        rolePauseReason: selectedRoleRow.pauseReason,
        availableRoles: roles.map((r) => ({
          role: r.role,
          status: r.status,
          tenantId: r.tenantId,
          planTier: r.planTier,
        })),
        session,
      };
    },

    // 4. Platform Admin Sign-In, TOTP Enrollment, Invites & Reset (WF-ID-04, SCR-PUB-09..10)
    async adminSignIn(input: AdminSignInInput) {
      const settings = await loadEffectiveAuthSettings();
      const emailNorm = normalizeEmail(input.email);
      const account = await repo.findAccountByEmailBlindIndex(computeBlindIndex(emailNorm));
      const now = new Date();

      if (!account || !account.passwordHash) {
        throw new AuthServiceError("UNAUTHORIZED", "Invalid admin credentials.");
      }

      if (account.lockedUntil && account.lockedUntil.getTime() > now.getTime()) {
        throw new AuthServiceError(
          "RATE_LIMITED",
          "Admin account is temporarily locked for 15 minutes.",
          { lockedUntil: account.lockedUntil.toISOString() },
        );
      }

      const roles = await repo.listRolesForAccount(account.id);
      const adminRole = roles.find((r) => r.role === "admin" && r.status === "active");
      if (!adminRole || !adminRole.adminSubRole) {
        throw new AuthServiceError(
          "FORBIDDEN",
          "Account does not hold an active Platform Admin role.",
        );
      }

      const passwordMatches = await verifyPassword(input.password, account.passwordHash);
      const lockoutEval = evaluateSignInLockout({
        failedAttempts: account.failedSignInAttempts,
        lockedUntil: account.lockedUntil,
        succeeded: passwordMatches,
        now,
        authSettings: settings,
      });

      await repo.updateAccount(account.id, {
        failedSignInAttempts: lockoutEval.nextFailedAttempts,
        lockedUntil: lockoutEval.nextLockedUntil,
      });

      if (!passwordMatches) {
        throw new AuthServiceError("UNAUTHORIZED", "Invalid admin credentials.");
      }

      // First-sign-in TOTP enrollment required (SCR-PUB-10)
      if (!account.totpEnabledAt || !account.totpSecretEncrypted) {
        const secret = account.totpSecretEncrypted
          ? decryptField(account.totpSecretEncrypted)
          : generateTotpSecret();
        await repo.updateAccount(account.id, {
          totpSecretEncrypted: encryptField(secret),
        });
        const enrollmentToken = signAccessToken(
          {
            sub: account.id,
            sid: "totp-enroll",
            role: "admin",
            adminSubRole: adminRole.adminSubRole,
          },
          { ttlSeconds: 600 },
        );
        return {
          step: "totp_enrollment_required" as const,
          enrollmentToken,
          secret,
          otpauthUri: buildTotpOtpAuthUri({
            secret,
            accountLabel: emailNorm,
          }),
          subRole: adminRole.adminSubRole,
        };
      }

      const challengeToken = signAccessToken(
        {
          sub: account.id,
          sid: "totp-challenge",
          role: "admin",
          adminSubRole: adminRole.adminSubRole,
        },
        { ttlSeconds: 300 },
      );

      return {
        step: "totp_verification_required" as const,
        challengeToken,
        subRole: adminRole.adminSubRole,
      };
    },

    async adminEnrollTotp(input: AdminEnrollTotpInput, meta?: AuthRequestMeta) {
      const settings = await loadEffectiveAuthSettings();
      const claims = verifyAccessToken(input.enrollmentToken);
      if (!claims || claims.sid !== "totp-enroll" || claims.role !== "admin") {
        throw new AuthServiceError("UNAUTHORIZED", "Invalid or expired TOTP enrollment token.");
      }

      const account = await repo.findAccountById(claims.sub);
      if (!account || !account.totpSecretEncrypted) {
        throw new AuthServiceError("NOT_FOUND", "Admin account or TOTP secret not found.");
      }

      const secret = decryptField(account.totpSecretEncrypted);
      if (!verifyTotpCode(secret, input.totpCode)) {
        throw new AuthServiceError("VALIDATION_ERROR", "Invalid TOTP authenticator code.");
      }

      await repo.updateAccount(account.id, {
        totpEnabledAt: new Date(),
      });

      const session = await createSessionAndTokens({
        accountId: account.id,
        activeRole: "admin",
        adminSubRole: claims.adminSubRole ?? "operations",
        surface: "web",
        secondFactorVerified: true,
        meta,
        authSettings: settings,
      });

      await repo.writeAuditLog({
        actorAccountId: account.id,
        actorRole: "admin",
        action: "admin.totp.enrolled",
        targetEntityType: "account",
        targetEntityId: account.id,
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return {
        step: "authenticated" as const,
        session,
      };
    },

    async adminVerifyTotp(input: AdminVerifyTotpInput, meta?: AuthRequestMeta) {
      const settings = await loadEffectiveAuthSettings();
      const claims = verifyAccessToken(input.challengeToken);
      if (!claims || claims.sid !== "totp-challenge" || claims.role !== "admin") {
        throw new AuthServiceError("UNAUTHORIZED", "Invalid or expired TOTP challenge token.");
      }

      const account = await repo.findAccountById(claims.sub);
      if (!account || !account.totpSecretEncrypted) {
        throw new AuthServiceError("UNAUTHORIZED", "Admin TOTP is not configured.");
      }

      const secret = decryptField(account.totpSecretEncrypted);
      if (!verifyTotpCode(secret, input.totpCode)) {
        throw new AuthServiceError("VALIDATION_ERROR", "Invalid TOTP authenticator code.");
      }

      const session = await createSessionAndTokens({
        accountId: account.id,
        activeRole: "admin",
        adminSubRole: claims.adminSubRole ?? "operations",
        surface: "web",
        secondFactorVerified: true,
        meta,
        authSettings: settings,
      });

      return {
        step: "authenticated" as const,
        session,
      };
    },

    async adminInviteStaff(
      actor: { accountId: string; activeRole: UserRole; adminSubRole?: AdminSubRole | null },
      input: AdminInviteStaffInput,
      meta?: AuthRequestMeta,
    ) {
      if (actor.activeRole !== "admin" || actor.adminSubRole !== "super_admin") {
        throw new AuthServiceError(
          "FORBIDDEN",
          "Only Super Admin can invite platform staff (D-13).",
        );
      }

      const settings = await loadEffectiveAuthSettings();
      const emailNorm = normalizeEmail(input.email);
      const rawToken = generateRandomToken(24);
      const expiresAt = new Date(Date.now() + settings.adminInviteTtlHours * 60 * 60 * 1000);

      const invite = await repo.createAdminInvite({
        emailNormalized: emailNorm,
        fullName: input.fullName,
        subRole: input.subRole,
        inviteTokenHash: hashSha256(rawToken),
        expiresAt,
        invitedByAccountId: actor.accountId,
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: "admin",
        action: "admin.staff.invited",
        targetEntityType: "admin_invite",
        targetEntityId: invite.id,
        afterState: {
          email: emailNorm,
          subRole: input.subRole,
          expiresAt: expiresAt.toISOString(),
        },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return {
        inviteId: invite.id,
        email: emailNorm,
        subRole: input.subRole,
        expiresAt: expiresAt.toISOString(),
        inviteToken: rawToken,
      };
    },

    async adminAcceptInvite(input: AdminAcceptInviteInput, meta?: AuthRequestMeta) {
      const settings = await loadEffectiveAuthSettings();
      const invite = await repo.findAdminInviteByTokenHash(hashSha256(input.inviteToken));
      const now = new Date();

      if (!invite || invite.acceptedAt || invite.expiresAt.getTime() <= now.getTime()) {
        throw new AuthServiceError(
          "VALIDATION_ERROR",
          "Admin invitation link is invalid or has expired (72-hour limit).",
        );
      }

      const pwCheck = validatePasswordPolicy(input.password, settings);
      if (!pwCheck.valid) {
        throw new AuthServiceError("VALIDATION_ERROR", pwCheck.reason!, { field: "password" });
      }

      const phoneNorm = normalizePhoneE164(input.phone);
      const passwordHash = await hashPassword(input.password);

      const account = await repo.createAccount({
        emailNormalized: invite.emailNormalized,
        emailBlindIndex: computeBlindIndex(invite.emailNormalized),
        emailEncrypted: encryptField(invite.emailNormalized),
        phoneE164: phoneNorm,
        phoneBlindIndex: computeBlindIndex(phoneNorm),
        phoneEncrypted: encryptField(phoneNorm),
        emailVerifiedAt: now,
        phoneVerifiedAt: now,
        passwordHash,
        passwordChangedAt: now,
        preferredSignInMethod: "password",
        fullName: invite.fullName,
        preferredLanguage: "ar",
        status: "active",
      });

      await repo.createAccountRole({
        accountId: account.id,
        role: "admin",
        adminSubRole: invite.subRole,
        status: "active",
        approvedAt: now,
      });

      await repo.markAdminInviteAccepted(invite.id, account.id);

      await repo.writeAuditLog({
        actorAccountId: account.id,
        actorRole: "admin",
        action: "admin.invite.accepted",
        targetEntityType: "account",
        targetEntityId: account.id,
        afterState: { subRole: invite.subRole },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return {
        accountId: account.id,
        email: invite.emailNormalized,
        subRole: invite.subRole,
        nextStep: "admin_sign_in_and_enroll_totp" as const,
      };
    },

    async adminResetTotp(
      actor: { accountId: string; activeRole: UserRole; adminSubRole?: AdminSubRole | null },
      input: AdminResetTotpInput,
      meta?: AuthRequestMeta,
    ) {
      if (actor.activeRole !== "admin" || actor.adminSubRole !== "super_admin") {
        throw new AuthServiceError(
          "FORBIDDEN",
          "Only Super Admin can reset an admin's TOTP (D-52).",
        );
      }

      const target = await repo.findAccountById(input.targetAdminAccountId);
      if (!target) {
        throw new AuthServiceError("NOT_FOUND", "Target admin account not found.");
      }

      await repo.updateAccount(target.id, {
        totpSecretEncrypted: null,
        totpEnabledAt: null,
      });
      await repo.revokeAllSessionsForAccount(target.id, "totp_reset_by_super_admin");

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: "admin",
        action: "admin.totp.reset",
        targetEntityType: "account",
        targetEntityId: target.id,
        reason: input.reason,
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return { reset: true, targetAdminAccountId: target.id };
    },

    // 5. Organization Owner & Employee Sign-In + Mandatory 2FA (WF-ID-05, SCR-PUB-11..12)
    async staffSignIn(input: StaffSignInInput) {
      const settings = await loadEffectiveAuthSettings();
      const emailNorm = normalizeEmail(input.email);
      const account = await repo.findAccountByEmailBlindIndex(computeBlindIndex(emailNorm));
      const now = new Date();

      if (!account || !account.passwordHash) {
        throw new AuthServiceError("UNAUTHORIZED", "Invalid staff credentials.");
      }

      if (account.lockedUntil && account.lockedUntil.getTime() > now.getTime()) {
        throw new AuthServiceError(
          "RATE_LIMITED",
          "Account is locked for 15 minutes due to 5 failed sign-in attempts.",
          { lockedUntil: account.lockedUntil.toISOString() },
        );
      }

      const roles = await repo.listRolesForAccount(account.id);
      const staffRoles = roles.filter(
        (r) =>
          (r.role === "organization_owner" || r.role === "organization_employee") &&
          r.status === "active",
      );

      if (staffRoles.length === 0) {
        throw new AuthServiceError(
          "FORBIDDEN",
          "No active Organization Owner or Employee role found on this account.",
        );
      }

      const passwordMatches = await verifyPassword(input.password, account.passwordHash);
      const lockoutEval = evaluateSignInLockout({
        failedAttempts: account.failedSignInAttempts,
        lockedUntil: account.lockedUntil,
        succeeded: passwordMatches,
        now,
        authSettings: settings,
      });

      await repo.updateAccount(account.id, {
        failedSignInAttempts: lockoutEval.nextFailedAttempts,
        lockedUntil: lockoutEval.nextLockedUntil,
      });

      if (!passwordMatches) {
        throw new AuthServiceError("UNAUTHORIZED", "Invalid staff credentials.");
      }

      const primaryStaffRole = staffRoles[0]!;
      const challengeToken = signAccessToken(
        {
          sub: account.id,
          sid: "staff-2fa",
          role: primaryStaffRole.role,
          tenantId: primaryStaffRole.tenantId,
          planTier: primaryStaffRole.planTier,
        },
        { ttlSeconds: 300 },
      );

      // First-sign-in 2FA setup for employees/owners without configured second factor (SCR-PUB-12)
      if (!account.staffSecondFactorMethod) {
        const totpSecret = account.totpSecretEncrypted
          ? decryptField(account.totpSecretEncrypted)
          : generateTotpSecret();
        await repo.updateAccount(account.id, {
          totpSecretEncrypted: encryptField(totpSecret),
        });

        let smsDispatch: OtpDispatchResult | undefined;
        if (account.phoneE164) {
          smsDispatch = await issueOtpCode({
            accountId: account.id,
            targetIdentifier: account.phoneE164,
            channel: "sms",
            purpose: "staff_2fa",
            authSettings: settings,
          });
        }

        return {
          step: "staff_2fa_setup_required" as const,
          challengeToken,
          totpSecret,
          otpauthUri: buildTotpOtpAuthUri({
            secret: totpSecret,
            accountLabel: emailNorm,
          }),
          smsDispatch,
        };
      }

      let smsDispatch: OtpDispatchResult | undefined;
      if (account.staffSecondFactorMethod === "sms" && account.phoneE164) {
        smsDispatch = await issueOtpCode({
          accountId: account.id,
          targetIdentifier: account.phoneE164,
          channel: "sms",
          purpose: "staff_2fa",
          authSettings: settings,
        });
      }

      return {
        step: "staff_2fa_verification_required" as const,
        method: account.staffSecondFactorMethod,
        challengeToken,
        smsDispatch,
      };
    },

    async staffSetupSecondFactor(input: StaffSetupSecondFactorInput, meta?: AuthRequestMeta) {
      const settings = await loadEffectiveAuthSettings();
      const claims = verifyAccessToken(input.challengeToken);
      if (!claims || claims.sid !== "staff-2fa") {
        throw new AuthServiceError("UNAUTHORIZED", "Invalid or expired staff 2FA setup token.");
      }

      const account = await repo.findAccountById(claims.sub);
      if (!account) {
        throw new AuthServiceError("NOT_FOUND", "Staff account not found.");
      }

      if (input.method === "totp") {
        if (!account.totpSecretEncrypted) {
          throw new AuthServiceError("VALIDATION_ERROR", "TOTP secret was not initialized.");
        }
        const secret = decryptField(account.totpSecretEncrypted);
        if (!verifyTotpCode(secret, input.verificationCode)) {
          throw new AuthServiceError("VALIDATION_ERROR", "Invalid TOTP verification code.");
        }
        await repo.updateAccount(account.id, {
          totpEnabledAt: new Date(),
          staffSecondFactorMethod: "totp",
        });
      } else {
        if (!account.phoneE164) {
          throw new AuthServiceError("VALIDATION_ERROR", "No phone number configured for SMS 2FA.");
        }
        const latestOtp = await repo.findLatestOtp(account.phoneE164, "staff_2fa");
        if (!latestOtp || latestOtp.codeHash !== hashSha256(input.verificationCode)) {
          throw new AuthServiceError("VALIDATION_ERROR", "Invalid SMS verification code.");
        }
        await repo.updateOtpVerification(latestOtp.id, { consumedAt: new Date() });
        await repo.updateAccount(account.id, {
          staffSecondFactorMethod: "sms",
        });
      }

      const memberships = await repo.listEmployeeMembershipsForAccount(account.id);
      for (const m of memberships) {
        if (!m.firstSignInCompletedAt) {
          await repo.updateEmployeeMembership(m.id, { firstSignInCompletedAt: new Date() });
        }
      }

      return this.completeStaffSecondFactorSession(
        account.id,
        claims.tenantId ?? undefined,
        meta,
        settings,
      );
    },

    async staffVerifySecondFactor(input: StaffVerifySecondFactorInput, meta?: AuthRequestMeta) {
      const settings = await loadEffectiveAuthSettings();
      const claims = verifyAccessToken(input.challengeToken);
      if (!claims || claims.sid !== "staff-2fa") {
        throw new AuthServiceError("UNAUTHORIZED", "Invalid or expired staff 2FA challenge token.");
      }

      const account = await repo.findAccountById(claims.sub);
      if (!account) {
        throw new AuthServiceError("NOT_FOUND", "Staff account not found.");
      }

      let verified = false;
      if (account.staffSecondFactorMethod === "totp" && account.totpSecretEncrypted) {
        const secret = decryptField(account.totpSecretEncrypted);
        verified = verifyTotpCode(secret, input.code);
      } else if (account.phoneE164) {
        const latestOtp = await repo.findLatestOtp(account.phoneE164, "staff_2fa");
        if (latestOtp && latestOtp.codeHash === hashSha256(input.code)) {
          verified = true;
          await repo.updateOtpVerification(latestOtp.id, { consumedAt: new Date() });
        }
      }

      if (!verified) {
        throw new AuthServiceError("VALIDATION_ERROR", "Invalid second-factor code.");
      }

      return this.completeStaffSecondFactorSession(
        account.id,
        input.tenantId ?? claims.tenantId ?? undefined,
        meta,
        settings,
      );
    },

    async completeStaffSecondFactorSession(
      accountId: string,
      requestedTenantId?: string,
      meta?: AuthRequestMeta,
      authSettingsParam?: AuthSettingsData,
    ) {
      const settings = authSettingsParam ?? (await loadEffectiveAuthSettings());
      const roles = await repo.listRolesForAccount(accountId);
      const staffRoles = roles.filter(
        (r) =>
          (r.role === "organization_owner" || r.role === "organization_employee") &&
          r.status === "active",
      );

      const selectedRole =
        (requestedTenantId
          ? staffRoles.find((r) => r.tenantId === requestedTenantId)
          : staffRoles[0]) ?? staffRoles[0];

      if (!selectedRole || !selectedRole.tenantId) {
        throw new AuthServiceError("FORBIDDEN", "No active organization membership found.");
      }

      const org = await repo.findOrganizationById(selectedRole.tenantId);
      let permissions: OrgPermissionMatrix | null = null;
      if (selectedRole.role === "organization_employee") {
        const membership = await repo.findEmployeeMembership(selectedRole.tenantId, accountId);
        if (!membership || membership.status !== "active") {
          throw new AuthServiceError("FORBIDDEN", "Employee membership is not active.");
        }
        permissions = membership.permissions;
      }

      const session = await createSessionAndTokens({
        accountId,
        activeRole: selectedRole.role,
        activeTenantId: selectedRole.tenantId,
        planTier: org?.planTier ?? selectedRole.planTier ?? "starter",
        permissions,
        surface: "web",
        secondFactorVerified: true,
        meta,
        authSettings: settings,
      });

      return {
        step: "authenticated" as const,
        organizations: staffRoles.map((r) => ({
          tenantId: r.tenantId,
          role: r.role,
        })),
        session,
      };
    },

    async inviteEmployee(
      actor: {
        accountId: string;
        activeRole: UserRole;
        activeTenantId?: string | null;
        permissions?: Partial<OrgPermissionMatrix> | null;
      },
      input: InviteEmployeeInput,
      meta?: AuthRequestMeta,
    ) {
      if (!actor.activeTenantId) {
        throw new AuthServiceError("NOT_FOUND", "Organization context not found.");
      }
      if (
        actor.activeRole !== "organization_owner" &&
        !(actor.activeRole === "organization_employee" && actor.permissions?.employees === "manage")
      ) {
        throw new AuthServiceError("FORBIDDEN", "Permission to manage employees is required.");
      }

      const org = await repo.findOrganizationById(actor.activeTenantId);
      if (!org) {
        throw new AuthServiceError("NOT_FOUND", "Organization not found.");
      }

      // Check plan employee seat cap (Starter: 5, Growth: 20, Enterprise: unlimited)
      const plan = findPlanCatalogEntry("organization", org.planTier);
      const currentCount = await repo.countActiveEmployeesForTenant(org.id);
      if (plan?.limits.employeesMax !== null && plan?.limits.employeesMax !== undefined) {
        if (currentCount >= plan.limits.employeesMax) {
          throw new AuthServiceError(
            "FORBIDDEN",
            `Employee limit reached for ${org.planTier} plan (max ${plan.limits.employeesMax}). Upgrade your plan to invite more employees.`,
          );
        }
      }

      const settings = await loadEffectiveAuthSettings();
      const permissions: OrgPermissionMatrix =
        input.permissions ??
        (input.preset ? EMPLOYEE_ROLE_PRESETS[input.preset] : undefined) ??
        EMPLOYEE_ROLE_PRESETS.trip_coordinator!;

      // ASM-04: Subscription management is Owner-only unless explicitly granted by Owner
      if (actor.activeRole !== "organization_owner") {
        permissions.subscription = "none";
      }

      const rawToken = generateRandomToken(24);
      const inviteExpiresAt = new Date(
        Date.now() + settings.employeeInviteTtlDays * 24 * 60 * 60 * 1000,
      );

      const membership = await repo.createEmployeeInvite({
        tenantId: org.id,
        invitedEmail: normalizeEmail(input.email),
        invitedPhone: input.phone ? normalizePhoneE164(input.phone) : null,
        roleTitle: input.roleTitle,
        permissions,
        inviteTokenHash: hashSha256(rawToken),
        inviteExpiresAt,
        invitedByAccountId: actor.accountId,
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.activeRole,
        tenantId: org.id,
        action: "organization.employee.invited",
        targetEntityType: "employee_membership",
        targetEntityId: membership.id,
        afterState: {
          invitedEmail: membership.invitedEmail,
          roleTitle: membership.roleTitle,
          permissions,
        },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return {
        membershipId: membership.id,
        tenantId: org.id,
        invitedEmail: membership.invitedEmail,
        roleTitle: membership.roleTitle,
        permissions: membership.permissions,
        inviteExpiresAt: inviteExpiresAt.toISOString(),
        inviteToken: rawToken,
      };
    },

    async acceptEmployeeInvite(input: AcceptEmployeeInviteInput, meta?: AuthRequestMeta) {
      const settings = await loadEffectiveAuthSettings();
      const invite = await repo.findEmployeeInviteByTokenHash(hashSha256(input.inviteToken));
      const now = new Date();

      if (
        !invite ||
        invite.status !== "invited" ||
        invite.inviteExpiresAt.getTime() <= now.getTime()
      ) {
        throw new AuthServiceError(
          "VALIDATION_ERROR",
          "Employee invitation link is invalid or has expired (7-day limit).",
        );
      }

      const pwCheck = validatePasswordPolicy(input.password, settings);
      if (!pwCheck.valid) {
        throw new AuthServiceError("VALIDATION_ERROR", pwCheck.reason!, { field: "password" });
      }

      const emailNorm = normalizeEmail(invite.invitedEmail);
      const phoneNorm = normalizePhoneE164(input.phone);
      const passwordHash = await hashPassword(input.password);

      let account = await repo.findAccountByEmailBlindIndex(computeBlindIndex(emailNorm));
      if (!account) {
        account = await repo.createAccount({
          emailNormalized: emailNorm,
          emailBlindIndex: computeBlindIndex(emailNorm),
          emailEncrypted: encryptField(emailNorm),
          phoneE164: phoneNorm,
          phoneBlindIndex: computeBlindIndex(phoneNorm),
          phoneEncrypted: encryptField(phoneNorm),
          emailVerifiedAt: now,
          phoneVerifiedAt: now,
          passwordHash,
          passwordChangedAt: now,
          preferredSignInMethod: "password",
          fullName: input.fullName,
          preferredLanguage: "ar",
          status: "active",
        });
      }

      await repo.createAccountRole({
        accountId: account.id,
        role: "organization_employee",
        tenantId: invite.tenantId,
        status: "active",
        approvedAt: now,
      });

      await repo.updateEmployeeMembership(invite.id, {
        accountId: account.id,
        status: "active",
      });

      await repo.writeAuditLog({
        actorAccountId: account.id,
        actorRole: "organization_employee",
        tenantId: invite.tenantId,
        action: "organization.employee.invite_accepted",
        targetEntityType: "employee_membership",
        targetEntityId: invite.id,
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return {
        accountId: account.id,
        tenantId: invite.tenantId,
        email: emailNorm,
        nextStep: "staff_sign_in_and_setup_2fa" as const,
      };
    },

    // 6. Vehicle Moderator Sign-In (SCR-PUB-19, FR-MOD-05, D-107)
    async moderatorSignIn(input: ModeratorSignInInput, meta?: AuthRequestMeta) {
      const settings = await loadEffectiveAuthSettings();
      const account = await findAccountByIdentifier(input.identifier);
      const now = new Date();

      if (!account) {
        throw new AuthServiceError("UNAUTHORIZED", "Invalid moderator credentials.");
      }

      const assignment = await repo.findModeratorAssignmentForAccount(account.id);
      if (!assignment || assignment.status === "revoked" || assignment.status === "expired") {
        throw new AuthServiceError("FORBIDDEN", "No active vehicle moderator assignment found.");
      }

      if (assignment.validUntil.getTime() <= now.getTime()) {
        await repo.updateModeratorAssignment(assignment.id, { status: "expired" });
        throw new AuthServiceError(
          "FORBIDDEN",
          "Moderator assignment has expired (valid up to 24 hours after trip end).",
        );
      }

      if (assignment.staffCodeHash !== hashSha256(input.staffCode.trim())) {
        throw new AuthServiceError("UNAUTHORIZED", "Invalid moderator staff code.");
      }

      // D-107: Single active device enforcement — revoke prior moderator sessions for this account
      await repo.revokeAllSessionsForAccount(account.id, "moderator_single_device_enforcement");

      const session = await createSessionAndTokens({
        accountId: account.id,
        activeRole: "moderator",
        activeTenantId: assignment.tenantId,
        moderatorVehicleId: assignment.vehicleId,
        moderatorTripId: assignment.tripId,
        surface: input.surface,
        secondFactorVerified: true,
        meta,
        authSettings: settings,
      });

      await repo.updateModeratorAssignment(assignment.id, {
        activeDeviceFingerprint: meta?.deviceFingerprint ?? "mobile-device",
        activeSessionId: session.sessionId,
        status: "active",
      });

      return {
        step: "authenticated" as const,
        assignment: {
          id: assignment.id,
          tenantId: assignment.tenantId,
          tripId: assignment.tripId,
          vehicleId: assignment.vehicleId,
          validUntil: assignment.validUntil.toISOString(),
        },
        session,
      };
    },

    // 7. Session Refresh, Sign-Out, Role Switcher & Multi-Org Switcher (FR-AUTH-06, FR-AUTH-07, FR-AUTH-10, BRL-22)
    async refreshSession(input: RefreshSessionInput) {
      const settings = await loadEffectiveAuthSettings();
      const session = await repo.findSessionByRefreshTokenHash(hashSha256(input.refreshToken));
      const now = new Date();

      if (!session || session.revokedAt) {
        throw new AuthServiceError("UNAUTHORIZED", "Session has been revoked or is invalid.");
      }

      // BRL-22: 12-hour web session hard cap with draft retention indicator
      if (session.maxSessionExpiresAt.getTime() <= now.getTime()) {
        await repo.updateSession(session.id, {
          revokedAt: now,
          revokedReason: "max_session_lifetime_reached",
        });
        throw new AuthServiceError(
          "UNAUTHORIZED",
          "Maximum 12-hour session duration reached. Please sign in again; your drafts have been retained.",
          {
            reason: "MAX_SESSION_DURATION_REACHED",
            draftsRetained: settings.retainDraftsOnSessionExpiry,
          },
        );
      }

      const nextRefreshToken = generateRandomToken(32);
      await repo.updateSession(session.id, {
        refreshTokenHash: hashSha256(nextRefreshToken),
        lastRotatedAt: now,
      });

      let permissions: Partial<OrgPermissionMatrix> | null = null;
      if (session.activeRole === "organization_employee" && session.activeTenantId) {
        const m = await repo.findEmployeeMembership(session.activeTenantId, session.accountId);
        permissions = m?.permissions ?? null;
      }

      const accessToken = signAccessToken(
        {
          sub: session.accountId,
          sid: session.id,
          role: session.activeRole,
          adminSubRole: session.adminSubRole,
          tenantId: session.activeTenantId,
          permissions,
          moderatorVehicleId: session.moderatorVehicleId,
          moderatorTripId: session.moderatorTripId,
        },
        { ttlSeconds: settings.accessTokenTtlSeconds },
      );

      return {
        sessionId: session.id,
        accessToken,
        refreshToken: nextRefreshToken,
        accessTokenExpiresInSeconds: settings.accessTokenTtlSeconds,
        sessionMaxExpiresAt: session.maxSessionExpiresAt.toISOString(),
        draftsRetained: settings.retainDraftsOnSessionExpiry,
      };
    },

    async signOut(actor: { accountId: string; sessionId: string } | null, input: SignOutInput) {
      if (input.allDevices && actor) {
        await repo.revokeAllSessionsForAccount(actor.accountId, "user_signed_out_all_devices");
        return { signedOut: true, allDevices: true };
      }

      if (input.refreshToken) {
        const session = await repo.findSessionByRefreshTokenHash(hashSha256(input.refreshToken));
        if (session) {
          await repo.updateSession(session.id, {
            revokedAt: new Date(),
            revokedReason: "user_signed_out",
          });
        }
      } else if (actor?.sessionId) {
        await repo.updateSession(actor.sessionId, {
          revokedAt: new Date(),
          revokedReason: "user_signed_out",
        });
      }

      return { signedOut: true, allDevices: false };
    },

    async listMyRolesAndOrganizations(accountId: string) {
      const roles = await repo.listRolesForAccount(accountId);
      const memberships = await repo.listEmployeeMembershipsForAccount(accountId);
      const organizationsList = [];

      for (const r of roles) {
        if (r.tenantId) {
          const org = await repo.findOrganizationById(r.tenantId);
          if (org) {
            const emp = memberships.find((m) => m.tenantId === org.id);
            organizationsList.push({
              tenantId: org.id,
              displayNameEn: org.displayNameEn,
              displayNameAr: org.displayNameAr,
              planTier: org.planTier,
              role: r.role,
              permissions: emp?.permissions ?? null,
            });
          }
        }
      }

      return {
        roles: roles.map((r) => ({
          id: r.id,
          role: r.role,
          adminSubRole: r.adminSubRole,
          tenantId: r.tenantId,
          planTier: r.planTier,
          status: r.status,
          pauseReason: r.pauseReason,
        })),
        organizations: organizationsList,
      };
    },

    async switchRole(actor: { accountId: string; sessionId: string }, input: SwitchRoleInput) {
      const settings = await loadEffectiveAuthSettings();
      const roles = await repo.listRolesForAccount(actor.accountId);
      const target = roles.find(
        (r) =>
          r.role === input.targetRole && (input.tenantId ? r.tenantId === input.tenantId : true),
      );

      if (!target) {
        throw new AuthServiceError(
          "FORBIDDEN",
          `Account does not hold role "${input.targetRole}".`,
        );
      }

      if (target.status !== "active" && target.status !== "paused") {
        throw new AuthServiceError(
          "FORBIDDEN",
          `Role "${input.targetRole}" is currently "${target.status}".`,
        );
      }

      let permissions: Partial<OrgPermissionMatrix> | null = null;
      if (target.role === "organization_employee" && target.tenantId) {
        const m = await repo.findEmployeeMembership(target.tenantId, actor.accountId);
        permissions = m?.permissions ?? null;
      }

      await repo.updateSession(actor.sessionId, {
        activeRole: target.role,
        adminSubRole: target.adminSubRole,
        activeTenantId: target.tenantId,
      });

      const accessToken = signAccessToken(
        {
          sub: actor.accountId,
          sid: actor.sessionId,
          role: target.role,
          adminSubRole: target.adminSubRole,
          tenantId: target.tenantId,
          planTier: target.planTier,
          permissions,
        },
        { ttlSeconds: settings.accessTokenTtlSeconds },
      );

      return {
        activeRole: target.role,
        activeTenantId: target.tenantId,
        planTier: target.planTier,
        roleStatus: target.status,
        accessToken,
      };
    },

    async switchOrganization(
      actor: { accountId: string; sessionId: string },
      input: SwitchOrganizationInput,
    ) {
      const settings = await loadEffectiveAuthSettings();
      const roles = await repo.listRolesForAccount(actor.accountId);
      const targetRole = roles.find(
        (r) =>
          r.tenantId === input.targetTenantId &&
          (r.role === "organization_owner" || r.role === "organization_employee") &&
          r.status === "active",
      );

      if (!targetRole) {
        throw new AuthServiceError("NOT_FOUND", "Organization membership not found.");
      }

      const org = await repo.findOrganizationById(input.targetTenantId);
      if (!org || org.status !== "active") {
        throw new AuthServiceError("NOT_FOUND", "Organization not found.");
      }

      let permissions: Partial<OrgPermissionMatrix> | null = null;
      if (targetRole.role === "organization_employee") {
        const m = await repo.findEmployeeMembership(input.targetTenantId, actor.accountId);
        if (!m || m.status !== "active") {
          throw new AuthServiceError("FORBIDDEN", "Employee membership is not active.");
        }
        permissions = m.permissions;
      }

      await repo.updateSession(actor.sessionId, {
        activeRole: targetRole.role,
        activeTenantId: org.id,
      });

      const accessToken = signAccessToken(
        {
          sub: actor.accountId,
          sid: actor.sessionId,
          role: targetRole.role,
          tenantId: org.id,
          planTier: org.planTier,
          permissions,
        },
        { ttlSeconds: settings.accessTokenTtlSeconds },
      );

      return {
        activeTenantId: org.id,
        displayNameEn: org.displayNameEn,
        displayNameAr: org.displayNameAr,
        activeRole: targetRole.role,
        planTier: org.planTier,
        permissions,
        accessToken,
      };
    },

    // 8. Password Reset, Contact Change & Account Lifecycle (SCR-PUB-13, D-318, FR-AUTH-08..09)
    async requestPasswordReset(input: RequestPasswordResetInput) {
      const settings = await loadEffectiveAuthSettings();
      const { normalized, channel } = normalizeTargetIdentifier(input.identifier);
      const account = await findAccountByIdentifier(normalized);

      const dispatch = await issueOtpCode({
        accountId: account?.id ?? null,
        targetIdentifier: normalized,
        channel,
        purpose: "password_reset",
        authSettings: settings,
      });

      return {
        sent: true,
        otpDispatch: dispatch,
      };
    },

    async confirmPasswordReset(input: ConfirmPasswordResetInput) {
      const settings = await loadEffectiveAuthSettings();
      const pwCheck = validatePasswordPolicy(input.newPassword, settings);
      if (!pwCheck.valid) {
        throw new AuthServiceError("VALIDATION_ERROR", pwCheck.reason!, { field: "password" });
      }

      const { normalized } = normalizeTargetIdentifier(input.identifier);
      const latestOtp = await repo.findLatestOtp(normalized, "password_reset");
      if (!latestOtp || latestOtp.codeHash !== hashSha256(input.otpCode)) {
        throw new AuthServiceError("VALIDATION_ERROR", "Invalid or expired password reset code.");
      }

      const account = await findAccountByIdentifier(normalized);
      if (!account) {
        throw new AuthServiceError("NOT_FOUND", "Account not found.");
      }

      await repo.updateOtpVerification(latestOtp.id, { consumedAt: new Date() });
      const passwordHash = await hashPassword(input.newPassword);
      await repo.updateAccount(account.id, {
        passwordHash,
        passwordChangedAt: new Date(),
        failedSignInAttempts: 0,
        lockedUntil: null,
      });
      await repo.revokeAllSessionsForAccount(account.id, "password_reset");

      return { passwordReset: true };
    },

    async requestContactChange(accountId: string, input: RequestContactChangeInput) {
      const settings = await loadEffectiveAuthSettings();
      const normalized =
        input.channel === "email"
          ? normalizeEmail(input.newValue)
          : normalizePhoneE164(input.newValue);

      const dispatch = await issueOtpCode({
        accountId,
        targetIdentifier: normalized,
        channel: input.channel === "email" ? "email" : "sms",
        purpose: "contact_change",
        authSettings: settings,
      });

      return { otpDispatch: dispatch };
    },

    async confirmContactChange(accountId: string, input: ConfirmContactChangeInput) {
      const normalized =
        input.channel === "email"
          ? normalizeEmail(input.newValue)
          : normalizePhoneE164(input.newValue);

      const latestOtp = await repo.findLatestOtp(normalized, "contact_change");
      if (!latestOtp || latestOtp.codeHash !== hashSha256(input.otpCode)) {
        throw new AuthServiceError("VALIDATION_ERROR", "Invalid or expired verification code.");
      }

      await repo.updateOtpVerification(latestOtp.id, { consumedAt: new Date() });
      const now = new Date();

      if (input.channel === "email") {
        await repo.updateAccount(accountId, {
          emailNormalized: normalized,
          emailBlindIndex: computeBlindIndex(normalized),
          emailEncrypted: encryptField(normalized),
          emailVerifiedAt: now,
        });
      } else {
        await repo.updateAccount(accountId, {
          phoneE164: normalized,
          phoneBlindIndex: computeBlindIndex(normalized),
          phoneEncrypted: encryptField(normalized),
          phoneVerifiedAt: now,
        });
      }

      return { updated: true, channel: input.channel, value: normalized };
    },

    async changeSignInMethod(accountId: string, input: ChangeSignInMethodInput) {
      const settings = await loadEffectiveAuthSettings();
      const account = await repo.findAccountById(accountId);
      if (!account) {
        throw new AuthServiceError("NOT_FOUND", "Account not found.");
      }

      let passwordHash = account.passwordHash;
      if (input.preferredSignInMethod === "password") {
        if (input.password) {
          const pwCheck = validatePasswordPolicy(input.password, settings);
          if (!pwCheck.valid) {
            throw new AuthServiceError("VALIDATION_ERROR", pwCheck.reason!, {
              field: "password",
            });
          }
          passwordHash = await hashPassword(input.password);
        } else if (!passwordHash) {
          throw new AuthServiceError(
            "VALIDATION_ERROR",
            "Password must be provided when switching sign-in method to password.",
          );
        }
      }

      await repo.updateAccount(accountId, {
        preferredSignInMethod: input.preferredSignInMethod,
        passwordHash,
      });

      return { preferredSignInMethod: input.preferredSignInMethod };
    },

    async suspendAccount(
      actor: { accountId: string; activeRole: UserRole; adminSubRole?: AdminSubRole | null },
      input: SuspendAccountInput,
      meta?: AuthRequestMeta,
    ) {
      if (
        actor.activeRole !== "admin" ||
        (actor.adminSubRole !== "super_admin" && actor.adminSubRole !== "operations")
      ) {
        throw new AuthServiceError(
          "FORBIDDEN",
          "Super Admin or Operations Admin privileges are required to suspend an account.",
        );
      }

      const target = await repo.findAccountById(input.targetAccountId);
      if (!target) {
        throw new AuthServiceError("NOT_FOUND", "Account not found.");
      }

      const now = new Date();
      await repo.updateAccount(target.id, {
        status: "suspended",
        suspendedAt: now,
        suspendedReason: input.reason,
      });
      await repo.updateAccountRolesStatus(target.id, "suspended");
      await repo.revokeAllSessionsForAccount(target.id, "account_suspended");

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: "admin",
        action: "account.suspended",
        targetEntityType: "account",
        targetEntityId: target.id,
        reason: input.reason,
        beforeState: { status: target.status },
        afterState: { status: "suspended", suspendedReason: input.reason },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return { suspended: true, accountId: target.id, reason: input.reason };
    },

    async reinstateAccount(
      actor: { accountId: string; activeRole: UserRole; adminSubRole?: AdminSubRole | null },
      input: ReinstateAccountInput,
      meta?: AuthRequestMeta,
    ) {
      if (
        actor.activeRole !== "admin" ||
        (actor.adminSubRole !== "super_admin" && actor.adminSubRole !== "operations")
      ) {
        throw new AuthServiceError(
          "FORBIDDEN",
          "Super Admin or Operations Admin privileges are required to reinstate an account.",
        );
      }

      const target = await repo.findAccountById(input.targetAccountId);
      if (!target) {
        throw new AuthServiceError("NOT_FOUND", "Account not found.");
      }

      await repo.updateAccount(target.id, {
        status: "active",
        suspendedAt: null,
        suspendedReason: null,
      });
      await repo.updateAccountRolesStatus(target.id, "active");

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: "admin",
        action: "account.reinstated",
        targetEntityType: "account",
        targetEntityId: target.id,
        reason: input.reason,
        beforeState: { status: target.status },
        afterState: { status: "active" },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return { reinstated: true, accountId: target.id };
    },

    async requestAccountDeletion(
      actor: { accountId: string; activeRole: UserRole },
      input: RequestAccountDeletionInput,
      meta?: AuthRequestMeta,
    ) {
      const settings = await loadEffectiveAuthSettings();
      const now = new Date();
      const purgeScheduledAt = new Date(
        now.getTime() + settings.deletionGraceDays * 24 * 60 * 60 * 1000,
      );

      await repo.updateAccount(actor.accountId, {
        status: "deletion_requested",
        deletionRequestedAt: now,
      });
      await repo.revokeAllSessionsForAccount(actor.accountId, "account_deletion_requested");

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.activeRole,
        action: "account.deletion_requested",
        targetEntityType: "account",
        targetEntityId: actor.accountId,
        reason: input.reason ?? "User requested account deletion",
        afterState: {
          status: "deletion_requested",
          graceDays: settings.deletionGraceDays,
          purgeScheduledAt: purgeScheduledAt.toISOString(),
        },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return {
        accountId: actor.accountId,
        status: "deletion_requested" as const,
        gracePeriodDays: settings.deletionGraceDays,
        purgeScheduledAt: purgeScheduledAt.toISOString(),
      };
    },

    async restoreAccountFromDeletion(input: RestoreAccountFromDeletionInput) {
      const settings = await loadEffectiveAuthSettings();
      const account = await findAccountByIdentifier(input.identifier);
      if (!account || account.status !== "deletion_requested") {
        throw new AuthServiceError("NOT_FOUND", "No account in deletion grace period found.");
      }

      const now = new Date();
      if (!isWithinDeletionGraceWindow(account.deletionRequestedAt, now, settings)) {
        throw new AuthServiceError(
          "FORBIDDEN",
          "The 30-day deletion grace period has already expired.",
        );
      }

      if (input.password && account.passwordHash) {
        const ok = await verifyPassword(input.password, account.passwordHash);
        if (!ok) {
          throw new AuthServiceError("UNAUTHORIZED", "Invalid password.");
        }
      }

      await repo.updateAccount(account.id, {
        status: "active",
        deletionRequestedAt: null,
      });

      return { restored: true, accountId: account.id, status: "active" as const };
    },

    async runDeletionPurgeSweep(now: Date = new Date()) {
      const settings = await loadEffectiveAuthSettings();
      const cutoffDate = new Date(now.getTime() - settings.deletionGraceDays * 24 * 60 * 60 * 1000);
      const dueAccounts = await repo.findAccountsDueForDeletionPurge(cutoffDate);

      for (const acc of dueAccounts) {
        // D-164 / D-168: Anonymize personal identifiers while preserving ledger/account UUID integrity
        await repo.updateAccount(acc.id, {
          emailNormalized: null,
          emailBlindIndex: null,
          emailEncrypted: null,
          phoneE164: null,
          phoneBlindIndex: null,
          phoneEncrypted: null,
          passwordHash: null,
          totpSecretEncrypted: null,
          fullName: `Deleted User (${acc.id.slice(0, 8)})`,
          status: "deleted",
          deletionPurgedAt: now,
        });
        await repo.updateAccountRolesStatus(acc.id, "revoked");
      }

      return {
        purgedCount: dueAccounts.length,
        purgedAccountIds: dueAccounts.map((a) => a.id),
      };
    },
  };
}
