import { ADMIN_SUB_ROLE_CATALOG, ROLE_AUTH_DEFAULTS } from "./roles-and-plans";
import { DEFAULT_AUTH_SETTINGS } from "./settings";
import type {
  AccountRoleStatus,
  AccountStatus,
  AdminSubRole,
  AuthSettingsData,
  OrgPermissionArea,
  OrgPermissionLevel,
  OrgPermissionMatrix,
  OtpAttemptState,
  OtpChannel,
  OtpEvaluationResult,
  OtpPurpose,
  RegistrationValidationInput,
  SignInLockoutEvaluation,
  UserRole,
  ValidationOutcome,
} from "./types";

export type {
  AccountRoleStatus,
  AccountStatus,
  OtpAttemptState,
  OtpChannel,
  OtpEvaluationResult,
  OtpPurpose,
  RegistrationValidationInput,
  SignInLockoutEvaluation,
  ValidationOutcome,
} from "./types";

export const ACCOUNT_STATUSES = [
  "pending_verification",
  "active",
  "suspended",
  "deletion_requested",
  "deleted",
] as const satisfies readonly AccountStatus[];

export const ACCOUNT_ROLE_STATUSES = [
  "pending_approval",
  "active",
  "paused",
  "suspended",
  "revoked",
] as const satisfies readonly AccountRoleStatus[];

export const OTP_CHANNELS = ["sms", "email"] as const satisfies readonly OtpChannel[];

export const OTP_PURPOSES = [
  "registration",
  "sign_in",
  "password_reset",
  "contact_change",
  "staff_2fa",
] as const satisfies readonly OtpPurpose[];

const COMMON_BREACHED_PASSWORDS = new Set([
  "password123456",
  "123456789012",
  "qwertyuiop12",
  "admin1234567",
  "welcome12345",
  "letmein12345",
  "iloveyou1234",
  "password1234",
  "111111111111",
  "abc123456789",
]);

/**
 * Validates registration surface & required identifier rules (FR-AUTH-01..03, FR-AUTH-11, D-20, D-86).
 */
export function validateRegistrationInput(input: RegistrationValidationInput): ValidationOutcome {
  const settings = input.authSettings ?? DEFAULT_AUTH_SETTINGS;
  const policy = settings.roleAuthPolicies[input.role] ?? ROLE_AUTH_DEFAULTS[input.role];

  if (!policy.selfRegistrationAllowed) {
    return {
      valid: false,
      code: "FORBIDDEN",
      reason: `Role "${input.role}" cannot self-register; an invitation or assignment is required.`,
      field: "role",
    };
  }

  if (!policy.allowedSurfaces.includes(input.surface)) {
    return {
      valid: false,
      code: "FORBIDDEN",
      reason: `Role "${input.role}" registration is only available on: ${policy.allowedSurfaces.join(", ")}.`,
      field: "surface",
    };
  }

  const hasEmail = Boolean(input.email && input.email.trim().length > 0);
  const hasPhone = Boolean(input.phone && input.phone.trim().length > 0);

  if (policy.requiredVerificationChannels === "both_email_and_phone") {
    if (!hasEmail || !hasPhone) {
      return {
        valid: false,
        code: "VALIDATION_ERROR",
        reason: `Role "${input.role}" requires both a verified email address and mobile phone number.`,
        field: !hasEmail ? "email" : "phone",
      };
    }
  } else if (policy.requiredVerificationChannels === "either_email_or_phone") {
    if (!hasEmail && !hasPhone) {
      return {
        valid: false,
        code: "VALIDATION_ERROR",
        reason: "At least one of email address or mobile phone number is required.",
        field: "email",
      };
    }
  } else if (policy.requiredVerificationChannels === "phone_only" && !hasPhone) {
    return {
      valid: false,
      code: "VALIDATION_ERROR",
      reason: "A mobile phone number is required.",
      field: "phone",
    };
  }

  return { valid: true };
}

/**
 * Checks whether an account has satisfied the verification channel rule for a given role (D-20).
 */
export function hasRequiredVerifiedChannels(
  role: UserRole,
  account: { emailVerifiedAt: Date | null; phoneVerifiedAt: Date | null },
  authSettings: AuthSettingsData = DEFAULT_AUTH_SETTINGS,
): boolean {
  const policy = authSettings.roleAuthPolicies[role] ?? ROLE_AUTH_DEFAULTS[role];
  switch (policy.requiredVerificationChannels) {
    case "both_email_and_phone":
      return account.emailVerifiedAt !== null && account.phoneVerifiedAt !== null;
    case "either_email_or_phone":
      return account.emailVerifiedAt !== null || account.phoneVerifiedAt !== null;
    case "phone_only":
    case "invite_link_and_phone":
      return account.phoneVerifiedAt !== null;
    case "invite_link_and_email":
      return account.emailVerifiedAt !== null;
  }
}

/**
 * Enforces NFR-SEC-02 & D-51 password policy (minimum 12 characters, breached list check).
 */
export function validatePasswordPolicy(
  password: string,
  authSettings: AuthSettingsData = DEFAULT_AUTH_SETTINGS,
): ValidationOutcome {
  if (password.length < authSettings.passwordMinLength) {
    return {
      valid: false,
      code: "VALIDATION_ERROR",
      field: "password",
      reason: `Password must be at least ${authSettings.passwordMinLength} characters long.`,
    };
  }

  if (
    authSettings.breachedPasswordCheckEnabled &&
    COMMON_BREACHED_PASSWORDS.has(password.toLowerCase())
  ) {
    return {
      valid: false,
      code: "VALIDATION_ERROR",
      field: "password",
      reason: "This password appears in known breached password lists. Choose a stronger password.",
    };
  }

  return { valid: true };
}

/**
 * Evaluates an OTP code entry per BRL-20 (5-minute validity, 5 wrong entries -> 15-minute pause).
 */
export function evaluateOtpAttempt(params: {
  state: OtpAttemptState;
  providedMatches: boolean;
  now: Date;
  authSettings?: AuthSettingsData;
}): OtpEvaluationResult {
  const settings = params.authSettings ?? DEFAULT_AUTH_SETTINGS;
  const { state, providedMatches, now } = params;

  if (state.consumedAt !== null) {
    return {
      allowed: false,
      matched: false,
      nextWrongAttempts: state.wrongAttempts,
      nextPausedUntil: state.pausedUntil,
      code: "VALIDATION_ERROR",
      reason: "Verification code has already been used.",
    };
  }

  if (state.pausedUntil && state.pausedUntil.getTime() > now.getTime()) {
    return {
      allowed: false,
      matched: false,
      nextWrongAttempts: state.wrongAttempts,
      nextPausedUntil: state.pausedUntil,
      code: "RATE_LIMITED",
      reason: "Too many incorrect verification attempts. Verification is paused for 15 minutes.",
    };
  }

  if (state.expiresAt.getTime() <= now.getTime()) {
    return {
      allowed: false,
      matched: false,
      nextWrongAttempts: state.wrongAttempts,
      nextPausedUntil: state.pausedUntil,
      code: "VALIDATION_ERROR",
      reason: "Verification code has expired. Request a new code.",
    };
  }

  if (providedMatches) {
    return {
      allowed: true,
      matched: true,
      nextWrongAttempts: 0,
      nextPausedUntil: null,
    };
  }

  const nextWrongAttempts = state.wrongAttempts + 1;
  const shouldPause = nextWrongAttempts >= settings.otpMaxWrongAttempts;
  const nextPausedUntil = shouldPause
    ? new Date(now.getTime() + settings.otpPauseDurationSeconds * 1000)
    : state.pausedUntil;

  return {
    allowed: !shouldPause,
    matched: false,
    nextWrongAttempts,
    nextPausedUntil,
    code: shouldPause ? "RATE_LIMITED" : "VALIDATION_ERROR",
    reason: shouldPause
      ? "Five wrong codes entered. Verification is paused for 15 minutes."
      : "Invalid verification code.",
  };
}

/**
 * Evaluates sign-in lockout state per BRL-21 and D-53 (5 failed attempts -> 15-minute lockout).
 */
export function evaluateSignInLockout(params: {
  failedAttempts: number;
  lockedUntil: Date | null;
  succeeded: boolean;
  now: Date;
  authSettings?: AuthSettingsData;
}): SignInLockoutEvaluation {
  const settings = params.authSettings ?? DEFAULT_AUTH_SETTINGS;
  const { failedAttempts, lockedUntil, succeeded, now } = params;

  if (lockedUntil && lockedUntil.getTime() > now.getTime()) {
    return {
      locked: true,
      nextFailedAttempts: failedAttempts,
      nextLockedUntil: lockedUntil,
      remainingLockoutSeconds: Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000),
    };
  }

  if (succeeded) {
    return {
      locked: false,
      nextFailedAttempts: 0,
      nextLockedUntil: null,
      remainingLockoutSeconds: 0,
    };
  }

  const baseAttempts = lockedUntil && lockedUntil.getTime() <= now.getTime() ? 0 : failedAttempts;
  const nextFailedAttempts = baseAttempts + 1;
  const shouldLock = nextFailedAttempts >= settings.maxFailedSignInAttempts;
  const nextLockedUntil = shouldLock
    ? new Date(now.getTime() + settings.lockoutDurationSeconds * 1000)
    : null;

  return {
    locked: shouldLock,
    nextFailedAttempts,
    nextLockedUntil,
    remainingLockoutSeconds: shouldLock ? settings.lockoutDurationSeconds : 0,
  };
}

/**
 * Checks if an employee permission matrix grants the required level for an area (D-284).
 */
export function hasEmployeePermission(
  permissions: Partial<OrgPermissionMatrix> | null | undefined,
  area: OrgPermissionArea,
  requiredLevel: "view" | "manage" = "view",
): boolean {
  if (!permissions) return false;
  const current: OrgPermissionLevel = permissions[area] ?? "none";
  if (requiredLevel === "view") {
    return current === "view" || current === "manage";
  }
  return current === "manage";
}

/**
 * Checks if an admin sub-role (`super_admin`, `operations`, `finance`) can execute an action (D-49).
 */
export function hasAdminSubRolePermission(subRole: AdminSubRole, action: string): boolean {
  if (subRole === "super_admin") return true;
  const meta = ADMIN_SUB_ROLE_CATALOG.find((item) => item.subRole === subRole);
  if (!meta) return false;
  return meta.allowedActions.includes(action);
}

/**
 * Checks whether an account in `deletion_requested` is still within the 30-day grace window (FR-AUTH-09, D-38).
 */
export function isWithinDeletionGraceWindow(
  deletionRequestedAt: Date | null,
  now: Date,
  authSettings: AuthSettingsData = DEFAULT_AUTH_SETTINGS,
): boolean {
  if (!deletionRequestedAt) return false;
  const graceMs = authSettings.deletionGraceDays * 24 * 60 * 60 * 1000;
  return now.getTime() - deletionRequestedAt.getTime() <= graceMs;
}

export function getRateLimitForRole(
  role: UserRole | null,
  authSettings: AuthSettingsData = DEFAULT_AUTH_SETTINGS,
): number {
  if (!role) return 60;
  return (
    authSettings.roleAuthPolicies[role]?.rateLimitPerMinute ??
    ROLE_AUTH_DEFAULTS[role].rateLimitPerMinute
  );
}
