// Shared TypeScript types for @trips-app/auth (ARCHITECTURE-auth.md §3).
//
// These types are the contract every platform implements: the field names below are the field names
// persisted by web (`localStorage["trips.auth.v1"]`), Android (`SharedPreferences`) and iOS
// (`NSUserDefaults`), and the JSON encoding is identical (camelCase, epoch **milliseconds** for both
// expiry fields). The Kotlin mirror lives in mobile/shared/src/commonMain/.../auth.

/** Lifecycle state of the local session. E1: expiry is a state, not an exception. */
export type AuthStatus = "loading" | "authenticated" | "anonymous" | "sessionExpired";

/** A UI surface that can require authentication. */
export type SurfaceId =
  | "traveler"
  | "business"
  | "admin"
  | "studio"
  | "crew"
  | "driver"
  | "photographer"
  | "moderator";

/** The `surface` value sent to the server (mirrors `CLIENT_SURFACES` in packages/domain). */
export type ClientSurface = "web" | "mobile" | "pwa";

/** Locales the auth copy ships in. Arabic is the product default (PRD I2). */
export type AuthLocale = "ar" | "en";

/** The identity claims every platform caches next to the tokens (PRD §7.1). */
export interface AuthActor {
  accountId: string;
  sessionId: string;
  activeRole: string;
  adminSubRole: string | null;
  activeTenantId: string | null;
  planTier: string | null;
  permissions: Record<string, string> | null;
  moderatorVehicleId: string | null;
  moderatorTripId: string | null;
}

/** What every platform persists — identical field names (PRD §7.1); both expiries are epoch ms. */
export interface SessionRecord {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  sessionMaxExpiresAt: number;
  actor: AuthActor;
}

/** The `session` object every auth procedure returns (`sessionMaxExpiresAt` is an ISO string). */
export interface SessionTokenPayload {
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSeconds: number;
  sessionMaxExpiresAt: string;
  activeRole: string;
  adminSubRole: string | null;
  activeTenantId: string | null;
  planTier: string | null;
  permissions: Record<string, string> | null;
  moderatorVehicleId: string | null;
  moderatorTripId: string | null;
  newDeviceAlertTriggered?: boolean;
}

/** What `auth/refreshSession` returns (R5: rotation replaces both tokens). */
export interface RefreshTokenPayload {
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSeconds: number;
  sessionMaxExpiresAt: string;
  draftsRetained?: boolean;
}

/** What a UI is allowed to do after an error is shown. */
export type AuthErrorRecovery =
  | "stay"
  | "focusPassword"
  | "focusField"
  | "countdown"
  | "clearCode"
  | "enableResend"
  | "routeMfa"
  | "routeOtp"
  | "noRetry"
  | "retry"
  | "refresh";

/** One field-level issue, ready to render under an input. */
export interface AuthErrorFieldView {
  field: string;
  key: string;
  params: Record<string, string | number>;
  message: string;
}

/**
 * The only shape a screen renders. `key` is always an i18n key from
 * `packages/i18n/src/auth/messages.json` — never a server string and never a stack trace (G4).
 *
 * `fieldErrors` is additive to the design's interface: it carries every field-level issue so a form
 * can render one message per input (AC-7) while `field` still points at the first offender.
 */
export interface AuthErrorView {
  key: string;
  params: Record<string, string | number>;
  field?: string;
  recovery: AuthErrorRecovery;
  requestId?: string;
  fieldErrors?: AuthErrorFieldView[];
}

/** A single server-side field error as it arrives in the `ApiErrorResponse` envelope. */
export interface AuthErrorFieldIssue {
  field: string;
  code: string;
  message: string;
}

/** Everything `mapAuthError` needs; built by each platform's transport layer. */
export interface AuthErrorInput {
  code: string;
  status?: number;
  details?: Record<string, unknown>;
  fieldErrors?: AuthErrorFieldIssue[];
  procedure?: string;
  locale: AuthLocale;
  requestId?: string;
  /** Server-localised message, used for field-level issues (`field.<name>` templates). */
  message?: string;
}

/** The typed rejection for a request that triggered a failed refresh (F3). */
export class SessionExpiredError extends Error {
  readonly code = "AUTH_SESSION_EXPIRED";
  readonly maxSessionReached: boolean;

  constructor(message = "The session has expired.", maxSessionReached = false) {
    super(message);
    this.name = "SessionExpiredError";
    this.maxSessionReached = maxSessionReached;
  }
}

/** A transport-level failure the auth layer has to reason about (status + code + details). */
export interface AuthTransportError {
  status: number;
  code: string;
  details?: Record<string, unknown>;
  procedure?: string;
  message?: string;
}
