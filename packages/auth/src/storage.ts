// Session-record persistence rules (PRD §7.1, T1–T2). Pure functions: no DOM, no storage object.
import { AUTH_STORAGE_KEY } from "./conventions/index";
import type { SessionRecord, SessionTokenPayload } from "./types";

/** Thrown when a payload cannot become a record — a hard failure, never a silent empty session. */
export class InvalidSessionPayloadError extends Error {
  constructor(reason: string) {
    super(`Invalid session payload: ${reason}`);
    this.name = "InvalidSessionPayloadError";
  }
}

/** T2: `accessTokenExpiresAt = now + ttl * 1000`; `sessionMaxExpiresAt` verbatim from the response. */
export function toSessionRecord(
  payload: SessionTokenPayload,
  nowMs: number = Date.now(),
): SessionRecord {
  if (!payload || typeof payload !== "object") {
    throw new InvalidSessionPayloadError("payload is not an object");
  }
  if (!isNonEmptyString(payload.accessToken)) {
    throw new InvalidSessionPayloadError("accessToken is missing");
  }
  if (!isNonEmptyString(payload.refreshToken)) {
    throw new InvalidSessionPayloadError(
      "refreshToken is missing (R5 rotation requires both tokens)",
    );
  }
  if (!Number.isFinite(payload.accessTokenExpiresInSeconds)) {
    throw new InvalidSessionPayloadError("accessTokenExpiresInSeconds is not a number");
  }
  const sessionMaxExpiresAt = Date.parse(payload.sessionMaxExpiresAt);
  if (!Number.isFinite(sessionMaxExpiresAt)) {
    throw new InvalidSessionPayloadError("sessionMaxExpiresAt is not an ISO timestamp");
  }
  if (!isNonEmptyString(payload.sessionId)) {
    throw new InvalidSessionPayloadError("sessionId is missing");
  }
  if (!isNonEmptyString(payload.activeRole)) {
    throw new InvalidSessionPayloadError("activeRole is missing");
  }

  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    accessTokenExpiresAt: nowMs + payload.accessTokenExpiresInSeconds * 1000,
    sessionMaxExpiresAt,
    actor: {
      accountId: accountIdFromToken(payload),
      sessionId: payload.sessionId,
      activeRole: payload.activeRole,
      adminSubRole: payload.adminSubRole ?? null,
      activeTenantId: payload.activeTenantId ?? null,
      planTier: payload.planTier ?? null,
      permissions: payload.permissions ?? null,
      moderatorVehicleId: payload.moderatorVehicleId ?? null,
      moderatorTripId: payload.moderatorTripId ?? null,
    },
  };
}

/**
 * The session payload carries `sessionId` but not `accountId`, so the account id is read from the
 * access-token `sub` claim. Decoding is local and never validated here — the server is the authority
 * (A1/A2); this value is only used to render the account menu.
 */
function accountIdFromToken(payload: SessionTokenPayload): string {
  const fromPayload = (payload as SessionTokenPayload & { accountId?: unknown }).accountId;
  if (isNonEmptyString(fromPayload)) return fromPayload;

  const claims = decodeJwtClaims(payload.accessToken);
  const sub = claims?.sub;
  if (isNonEmptyString(sub)) return sub;

  // Never fall back to the session id: two different concepts must not share a value.
  throw new InvalidSessionPayloadError("accessToken does not carry a subject claim");
}

/** Decodes a JWT payload without verifying it. Returns null for anything malformed. */
export function decodeJwtClaims(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const encoded = parts[1];
  if (!encoded) return null;
  try {
    const json = base64UrlDecode(encoded);
    const parsed: unknown = JSON.parse(json);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  if (typeof atob === "function") {
    // Decode as UTF-8: `atob` yields a binary string, so re-interpret the bytes.
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new TextDecoder().decode(bytes);
  }
  // Bun / Node fallback (used by the unit tests and by SSR).
  return Buffer.from(padded, "base64").toString("utf8");
}

/** The exact string written to storage: one JSON record, no wrapper. */
export function serializeSessionRecord(record: SessionRecord): string {
  return JSON.stringify({
    accessToken: record.accessToken,
    refreshToken: record.refreshToken,
    accessTokenExpiresAt: record.accessTokenExpiresAt,
    sessionMaxExpiresAt: record.sessionMaxExpiresAt,
    actor: {
      accountId: record.actor.accountId,
      sessionId: record.actor.sessionId,
      activeRole: record.actor.activeRole,
      adminSubRole: record.actor.adminSubRole,
      activeTenantId: record.actor.activeTenantId,
      planTier: record.actor.planTier,
      permissions: record.actor.permissions,
      moderatorVehicleId: record.actor.moderatorVehicleId,
      moderatorTripId: record.actor.moderatorTripId,
    },
  });
}

/**
 * Shape-validated read. Anything that is not a complete record is treated as absent (T1: a partial
 * record must never be used to make requests), so a corrupted entry degrades to "signed out".
 */
export function parseSessionRecord(raw: string | null): SessionRecord | null {
  if (raw === null || raw === undefined || raw.trim() === "") return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isPlainObject(parsed)) return null;

  const accessToken = parsed.accessToken;
  const refreshToken = parsed.refreshToken;
  const accessTokenExpiresAt = parsed.accessTokenExpiresAt;
  const sessionMaxExpiresAt = parsed.sessionMaxExpiresAt;
  const actor = parsed.actor;

  if (!isNonEmptyString(accessToken)) return null;
  if (!isNonEmptyString(refreshToken)) return null;
  if (!isFiniteNumber(accessTokenExpiresAt)) return null;
  if (!isFiniteNumber(sessionMaxExpiresAt)) return null;
  if (!isPlainObject(actor)) return null;

  const accountId = actor.accountId;
  const sessionId = actor.sessionId;
  const activeRole = actor.activeRole;
  if (!isNonEmptyString(accountId)) return null;
  if (!isNonEmptyString(sessionId)) return null;
  if (!isNonEmptyString(activeRole)) return null;

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    sessionMaxExpiresAt,
    actor: {
      accountId,
      sessionId,
      activeRole,
      adminSubRole: optionalString(actor.adminSubRole),
      activeTenantId: optionalString(actor.activeTenantId),
      planTier: optionalString(actor.planTier),
      permissions: optionalStringRecord(actor.permissions),
      moderatorVehicleId: optionalString(actor.moderatorVehicleId),
      moderatorTripId: optionalString(actor.moderatorTripId),
    },
  };
}

/** The storage key, re-exported where the stores need it without importing conventions twice. */
export { AUTH_STORAGE_KEY };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function optionalStringRecord(value: unknown): Record<string, string> | null {
  if (!isPlainObject(value)) return null;
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") result[key] = entry;
  }
  return result;
}
