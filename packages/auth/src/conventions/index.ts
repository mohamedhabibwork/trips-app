// Typed accessor over ./conventions.json — the single source of cross-app auth conventions
// (ARCHITECTURE-auth.md §6). Nothing in this package (or the web/mobile auth layers) may restate
// these values: they are read from the JSON so TypeScript and the generated Kotlin cannot drift.
import type { AuthErrorRecovery, AuthLocale, AuthStatus, ClientSurface, SurfaceId } from "../types";
import conventionsJson from "./conventions.json";

/** One row of the error table. `codes` are server `SharedErrorCode` values. */
export interface AuthErrorRow {
  codes: readonly string[];
  key: string;
  recovery: AuthErrorRecovery;
  field?: string;
}

/**
 * One market option on a registration form (FR-AUTH-02).
 *
 * Lives in `conventions.json` so the mobile codegen can emit the identical list: PRD §7.10 G6 asks
 * for a byte-identical option list on web and mobile, which two hand-copied literals cannot prove.
 */
export interface RegistrationCountry {
  code: string;
  nameEn: string;
  nameAr: string;
  enabled: boolean;
}

/** The shape of the conventions document, for the codegen task and the parity tests. */
export interface AuthConventions {
  version: number;
  storageKey: string;
  refreshLeadMs: number;
  accessTokenTtlSeconds: number;
  webSessionMaxSeconds: number;
  otpCodeLength: number;
  otpMaxWrongAttempts: number;
  statuses: readonly string[];
  surfaces: readonly string[];
  surfacePlatforms: Readonly<Record<string, string>>;
  signInPaths: Readonly<Record<string, string>>;
  registrationCountries: readonly RegistrationCountry[];
  defaultRegistrationCountry: string;
  defaultCountryByLocale: Readonly<Record<string, string>>;
  noRefreshProcedures: readonly string[];
  signInProcedures: readonly string[];
  otpProcedures: readonly string[];
  refreshableCodes: readonly string[];
  maxSessionReason: string;
  fieldNames: readonly string[];
  fallbackErrorKey: string;
  errorRows: readonly AuthErrorRow[];
}

const conventions = conventionsJson as unknown as AuthConventions;

/** The whole document, for the codegen task and parity tests. */
export const AUTH_CONVENTIONS: AuthConventions = conventions;

/** T1: exactly one storage key per platform. */
export const AUTH_STORAGE_KEY: string = conventions.storageKey;

/** R1: refresh this long before `accessTokenExpiresAt`. */
export const REFRESH_LEAD_MS: number = conventions.refreshLeadMs;

/** Server default access-token lifetime, used only by tests and documentation. */
export const ACCESS_TOKEN_TTL_SECONDS: number = conventions.accessTokenTtlSeconds;

/** BRL-22 web session hard cap, used only by tests and documentation. */
export const WEB_SESSION_MAX_SECONDS: number = conventions.webSessionMaxSeconds;

/** OTP codes are fixed-length, so the code input can size itself. */
export const OTP_CODE_LENGTH: number = conventions.otpCodeLength;

/** BRL-20: wrong attempts before verification pauses. */
export const OTP_MAX_WRONG_ATTEMPTS: number = conventions.otpMaxWrongAttempts;

/** E1 statuses, in the order the design lists them. */
export const AUTH_STATUSES: readonly AuthStatus[] = conventions.statuses as readonly AuthStatus[];

/** Every surface a guard can protect. */
export const SURFACE_IDS: readonly SurfaceId[] = conventions.surfaces as readonly SurfaceId[];

/** Which platform surface each UI surface belongs to (`signIn.surface`). */
export const SURFACE_PLATFORMS: Readonly<Record<SurfaceId, ClientSurface>> =
  conventions.surfacePlatforms as Readonly<Record<SurfaceId, ClientSurface>>;

/** The sign-in route each surface owns (guard redirect target, correction 6). */
export const SIGN_IN_PATHS: Readonly<Record<SurfaceId, string>> =
  conventions.signInPaths as Readonly<Record<SurfaceId, string>>;

/**
 * G1: the registration country options, in the order the forms render them. Disabled markets are
 * shown disabled, never hidden. The drift test asserts this equals `DEFAULT_SYSTEM_SETTINGS.markets`.
 */
export const REGISTRATION_COUNTRIES: readonly RegistrationCountry[] =
  conventions.registrationCountries;

/**
 * G2: the market each locale pre-selects.
 *
 * This is **data, not logic**. Encoding it as a `locale → code` map is what lets web and mobile run
 * the same one-liner over the same table; an `if (locale === "ar")` on either side would agree only
 * by coincidence and would diverge silently the day a second market is enabled.
 */
export const DEFAULT_COUNTRY_BY_LOCALE: Readonly<Record<AuthLocale, string>> =
  conventions.defaultCountryByLocale as Readonly<Record<AuthLocale, string>>;

/**
 * The fallback market when a locale is unknown or its mapped code is not an enabled option.
 *
 * Derived from the map's English entry rather than hardcoded, then validated against the option
 * list so a bad data edit degrades to the first enabled market instead of throwing at import time.
 */
export const DEFAULT_REGISTRATION_COUNTRY: string = resolveDefaultCountry();

function resolveDefaultCountry(): string {
  const mapped = DEFAULT_COUNTRY_BY_LOCALE.en;
  if (mapped && isEnabledCountry(mapped)) return mapped;
  const firstEnabled = REGISTRATION_COUNTRIES.find((country) => country.enabled);
  return firstEnabled?.code ?? mapped ?? "";
}

function isEnabledCountry(code: string): boolean {
  return REGISTRATION_COUNTRIES.some((country) => country.code === code && country.enabled);
}

/**
 * R4: procedures that never trigger a refresh.
 *
 * These are the session-minting entry points. They are normally called **without** a bearer, and
 * R4's "no refresh token ⇒ no refresh" (enforced in the controller) already covers that case. The
 * list is belt-and-braces: a stale bearer left in storage while the user sits on a sign-in screen
 * must never turn a rejected password into a session-expired dialog.
 *
 * Note the cause is *not* "a 401 here means a bad code": a wrong OTP or TOTP code is a
 * `VALIDATION_ERROR` (`packages/domain/src/auth.ts` `evaluateOtpAttempt`), never a 401. The 401
 * these procedures can return is a rejected challenge token, which a refresh cannot repair.
 */
export const NO_REFRESH_PROCEDURES: readonly string[] = conventions.noRefreshProcedures;

/**
 * Procedures whose 401 means the caller's own credentials or challenge token were rejected — not
 * that an existing session expired (§3.5). This is what makes `UNAUTHORIZED` disambiguation
 * procedure-aware.
 */
export const SIGN_IN_PROCEDURES: readonly string[] = conventions.signInProcedures;

/** Procedures whose VALIDATION_ERROR is an OTP-code failure (§3.5). */
export const OTP_PROCEDURES: readonly string[] = conventions.otpProcedures;

/** Codes that make a 401 worth one refresh + one replay (R2). */
export const REFRESHABLE_CODES: readonly string[] = conventions.refreshableCodes;

/** F2: the `details.reason` value the server sends when the 12-hour cap is hit. */
export const MAX_SESSION_REASON: string = conventions.maxSessionReason;

/** Field names that have a `field.<name>` message, so the mapper never invents a key. */
export const AUTH_FIELD_NAMES: readonly string[] = conventions.fieldNames;

/** M1: the fallback key for unmapped codes. */
export const FALLBACK_ERROR_KEY: string = conventions.fallbackErrorKey;

/** §7.6 as data: every row of the error table. */
export const AUTH_ERROR_ROWS: readonly AuthErrorRow[] = conventions.errorRows;

/** Looks a server code up in the table. Returns null for codes that need disambiguation or are unmapped. */
export function errorRowForCode(code: string): AuthErrorRow | null {
  for (const row of AUTH_ERROR_ROWS) {
    if (row.codes.includes(code)) return row;
  }
  return null;
}

/** Type guard for the four `AuthStatus` strings. */
export function isAuthStatus(value: unknown): value is AuthStatus {
  return typeof value === "string" && AUTH_STATUSES.includes(value as AuthStatus);
}

/** Type guard for the eight surface ids. */
export function isSurfaceId(value: unknown): value is SurfaceId {
  return typeof value === "string" && SURFACE_IDS.includes(value as SurfaceId);
}
