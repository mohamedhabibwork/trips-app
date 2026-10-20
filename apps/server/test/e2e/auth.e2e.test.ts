// E2E: the full authentication lifecycle over real HTTP against the real database
// (ARCHITECTURE-auth.md §7.3). Drives `app.handle(new Request(...))`, the same seam as
// endpoints.e2e.test.ts.
//
// Every row uses a `qa+<uuid>` email and a `+2015…` phone derived from the same UUID, so runs never
// collide and the assertions are idempotent. `afterAll` removes them again.
import { afterAll, describe, expect, test } from "bun:test";
import { createHmac, randomUUID } from "node:crypto";

import { schema, sql } from "@trips-app/db";

import { app } from "../../src/index";
import { db } from "../../src/services";

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_TOO_MANY_REQUESTS = 429;

const DEMO_PASSWORD = "DemoPassword123!";
const DEMO_ADMIN_EMAIL = "superadmin@trips-enjoy.com";
const DEMO_MODERATOR_EMAIL = "moderator.bus1@nilehorizon.eg";
const DEMO_MODERATOR_STAFF_CODE = "849201";

/**
 * Mirrors `DEMO_SHARED_TOTP_SECRET` from packages/db/src/seed/demo.ts.
 *
 * The code is computed here (RFC 6238, SHA-1, 30 s, 6 digits) instead of importing
 * `computeTotpCode` from `@trips-app/service-auth`, because `apps/server` does not depend on that
 * package and this test file must stay the only server-side change.
 */
const DEMO_TOTP_SECRET = "JBSWY3DPEHPK3PXP";

interface RpcBody {
  json?: Record<string, unknown> | null;
}

function send(path: string, init: RequestInit = {}): Promise<Response> {
  return app.handle(new Request(`http://localhost${path}`, init));
}

function rpcCall(
  procedurePath: readonly string[],
  body: unknown,
  token?: string,
): Promise<Response> {
  return send(`/rpc/${procedurePath.join("/")}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ json: body ?? null }),
  });
}

async function readRpcBody(response: Response): Promise<RpcBody> {
  return (await response.json()) as RpcBody;
}

/** The `json` payload of a successful call, as a plain object. */
async function payload(response: Response): Promise<Record<string, unknown>> {
  const body = await readRpcBody(response);
  return (body.json ?? {}) as Record<string, unknown>;
}

/** The `ApiErrorResponse` envelope nested in a failed call. */
async function errorEnvelope(response: Response): Promise<{
  code?: string;
  requestId?: string;
  field?: string;
  details?: Record<string, unknown>;
}> {
  const body = await readRpcBody(response);
  const json = (body.json ?? {}) as Record<string, unknown>;
  const data = (json.data ?? {}) as Record<string, unknown>;
  const error = (data.error ?? {}) as Record<string, unknown>;
  return {
    code: (json.code as string | undefined) ?? (error.code as string | undefined),
    requestId: (data.requestId as string | undefined) ?? undefined,
    field: data.field as string | undefined,
    details: (error.details as Record<string, unknown> | undefined) ?? undefined,
  };
}

/** A unique identity pair derived from one UUID. */
function identity(): { email: string; phone: string } {
  const compact = randomUUID().replace(/-/g, "");
  return {
    email: `qa+${compact.slice(0, 12)}@trips-enjoy.com`,
    phone: `+2015${compact.slice(12, 21)}`,
  };
}

function base32Decode(secret: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of secret.replace(/=+$/, "").toUpperCase()) {
    const index = alphabet.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** RFC 6238 TOTP: HMAC-SHA1 over the 30-second counter, truncated to 6 digits. */
function totpCode(secret: string, nowMs: number = Date.now()): string {
  const counter = Math.floor(nowMs / 1000 / 30);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", base32Decode(secret)).update(buffer).digest();
  const offset = hmac[hmac.length - 1]! & 0x0f;
  const binary =
    ((hmac[offset]! & 0x7f) << 24) |
    (hmac[offset + 1]! << 16) |
    (hmac[offset + 2]! << 8) |
    hmac[offset + 3]!;
  return String(binary % 1_000_000).padStart(6, "0");
}

interface OtpDispatch {
  channel: string;
  targetIdentifier: string;
  resendAvailableInSeconds: number;
  devCodePreview?: string;
}

/** Registers and verifies a throwaway traveler, returning its first session. */
async function createVerifiedTraveler(): Promise<{
  email: string;
  phone: string;
  session: Record<string, unknown>;
}> {
  const { email, phone } = identity();
  const registration = await rpcCall(["auth", "registerTraveler"], {
    fullName: "QA Traveler",
    email,
    phone,
    password: DEMO_PASSWORD,
    preferredLanguage: "en",
    surface: "web",
  });
  expect(registration.status).toBe(HTTP_OK);

  const registered = await payload(registration);
  const dispatches = (registered.otpDispatches ?? []) as OtpDispatch[];
  const dispatch = dispatches[0];
  if (!dispatch) throw new Error("registerTraveler returned no OTP dispatch");
  if (!dispatch.devCodePreview) {
    throw new Error("devCodePreview missing — check NODE_ENV (it is only omitted in production)");
  }

  const verification = await rpcCall(["auth", "verifyOtp"], {
    targetIdentifier: dispatch.targetIdentifier,
    purpose: "registration",
    code: dispatch.devCodePreview,
    surface: "web",
  });
  expect(verification.status).toBe(HTTP_OK);

  const verified = await payload(verification);
  const session = verified.session as Record<string, unknown> | null;
  expect(session).not.toBeNull();

  return { email, phone, session: session! };
}

describe("E2E auth: register → verify → session → refresh → sign out", () => {
  test("the full traveler lifecycle works over HTTP", async () => {
    const { email, phone, session } = await createVerifiedTraveler();

    expect(typeof session.accessToken).toBe("string");
    expect(typeof session.refreshToken).toBe("string");
    expect(session.accessTokenExpiresInSeconds).toBe(900);
    expect(typeof session.sessionMaxExpiresAt).toBe("string");

    const accessToken = session.accessToken as string;
    const firstRefreshToken = session.refreshToken as string;

    // getSession with the bearer returns the actor.
    const getSession = await rpcCall(["auth", "getSession"], undefined, accessToken);
    expect(getSession.status).toBe(HTTP_OK);
    const actor = (await payload(getSession)) as {
      authenticated?: boolean;
      actor?: { activeRole?: string };
    };
    expect(actor.authenticated).toBe(true);
    expect(actor.actor?.activeRole).toBe("traveler");

    // R5: refresh rotates both tokens.
    const refreshed = await rpcCall(["auth", "refreshSession"], {
      refreshToken: firstRefreshToken,
    });
    expect(refreshed.status).toBe(HTTP_OK);
    const rotation = await payload(refreshed);
    expect(rotation.refreshToken).not.toBe(firstRefreshToken);
    expect(typeof rotation.refreshToken).toBe("string");
    expect(rotation.accessTokenExpiresInSeconds).toBe(900);

    const rotatedAccessToken = rotation.accessToken as string;
    const rotatedRefreshToken = rotation.refreshToken as string;

    const signOut = await rpcCall(
      ["auth", "signOut"],
      { refreshToken: rotatedRefreshToken, allDevices: false },
      rotatedAccessToken,
    );
    expect(signOut.status).toBe(HTTP_OK);
    expect((await payload(signOut)).signedOut).toBe(true);

    // The refresh token is revoked server-side, so the session cannot be revived. This is the real
    // sign-out assertion: the client's next silent refresh fails and the tab is signed out.
    const refreshAfterSignOut = await rpcCall(["auth", "refreshSession"], {
      refreshToken: rotatedRefreshToken,
    });
    expect(refreshAfterSignOut.status).toBe(HTTP_UNAUTHORIZED);
    expect((await errorEnvelope(refreshAfterSignOut)).code).toBe("UNAUTHORIZED");

    expect(email).toContain("qa+");
    expect(phone.startsWith("+2015")).toBe(true);
  });
});

/**
 * KNOWN LIMITATION (R-5) — not a specification, and deliberately the opposite of the assertion this
 * suite must never make.
 *
 * `apps/server/src/context.ts` verifies the JWT signature and `exp` only; it never loads
 * `auth_sessions`. So a bearer minted before `signOut` keeps authenticating until its own 900 s TTL
 * expires. The fix does **not** belong in `context.ts`: a revocation lookup there would flip every
 * existing guard test to 401, because those tests forge `sid`s with no session row.
 *
 * The client never depends on this — sign-out clears the local store, so the tab is signed out
 * immediately, and the next refresh fails (asserted above). This test exists so that the day
 * revocation is added server-side, it fails loudly and the TTL window is re-documented rather than
 * silently changed.
 */
describe("E2E auth: KNOWN LIMITATION (R-5) — a signed-out bearer still authenticates", () => {
  test("getSession with the pre-sign-out access token returns 200 until its TTL expires", async () => {
    const { session } = await createVerifiedTraveler();
    const accessToken = session.accessToken as string;
    const refreshToken = session.refreshToken as string;

    const signOut = await rpcCall(
      ["auth", "signOut"],
      { refreshToken, allDevices: false },
      accessToken,
    );
    expect(signOut.status).toBe(HTTP_OK);

    const stale = await rpcCall(["auth", "getSession"], undefined, accessToken);
    expect(stale.status).toBe(HTTP_OK);
    expect((await payload(stale)).authenticated).toBe(true);

    // The refresh token, by contrast, is dead immediately.
    const refresh = await rpcCall(["auth", "refreshSession"], { refreshToken });
    expect(refresh.status).toBe(HTTP_UNAUTHORIZED);
  });
});

describe("E2E auth: admin TOTP (AC-2, WF-ID-04)", () => {
  test("password issues no session; the TOTP code does", async () => {
    const stepOne = await rpcCall(["auth", "adminSignIn"], {
      email: DEMO_ADMIN_EMAIL,
      password: DEMO_PASSWORD,
    });
    expect(stepOne.status).toBe(HTTP_OK);

    const challenge = await payload(stepOne);
    expect(challenge.step).toBe("totp_verification_required");
    expect(typeof challenge.challengeToken).toBe("string");
    // AC-2: no access token is handed out before the second factor.
    expect(challenge.session).toBeUndefined();

    const stepTwo = await rpcCall(["auth", "adminVerifyTotp"], {
      challengeToken: challenge.challengeToken,
      totpCode: totpCode(DEMO_TOTP_SECRET),
    });
    expect(stepTwo.status).toBe(HTTP_OK);

    const authenticated = await payload(stepTwo);
    expect(authenticated.step).toBe("authenticated");
    const session = authenticated.session as Record<string, unknown>;
    expect(session.activeRole).toBe("admin");
    expect(session.adminSubRole).toBe("super_admin");

    const signOut = await rpcCall(
      ["auth", "signOut"],
      { refreshToken: session.refreshToken, allDevices: true },
      session.accessToken as string,
    );
    expect(signOut.status).toBe(HTTP_OK);
  });

  test("a wrong TOTP code is rejected without a session", async () => {
    const stepOne = await rpcCall(["auth", "adminSignIn"], {
      email: DEMO_ADMIN_EMAIL,
      password: DEMO_PASSWORD,
    });
    const challenge = await payload(stepOne);

    const wrong = await rpcCall(["auth", "adminVerifyTotp"], {
      challengeToken: challenge.challengeToken,
      totpCode: "000000",
    });

    expect(wrong.status).toBe(HTTP_BAD_REQUEST);
    const envelope = await errorEnvelope(wrong);
    expect(envelope.code).toBe("VALIDATION_ERROR");
  });
});

describe("E2E auth: moderator staff code (SCR-PUB-19)", () => {
  test("the 6-digit staff code authenticates on the PWA surface", async () => {
    const response = await rpcCall(["auth", "moderatorSignIn"], {
      identifier: DEMO_MODERATOR_EMAIL,
      staffCode: DEMO_MODERATOR_STAFF_CODE,
      surface: "pwa",
    });
    expect(response.status).toBe(HTTP_OK);

    const result = await payload(response);
    expect(result.step).toBe("authenticated");
    const session = result.session as Record<string, unknown>;
    expect(session.activeRole).toBe("moderator");
    expect(typeof session.moderatorVehicleId).toBe("string");

    const assignment = result.assignment as Record<string, unknown>;
    expect(typeof assignment.tripId).toBe("string");
    expect(typeof assignment.vehicleId).toBe("string");

    const signOut = await rpcCall(
      ["auth", "signOut"],
      { refreshToken: session.refreshToken, allDevices: false },
      session.accessToken as string,
    );
    expect(signOut.status).toBe(HTTP_OK);
  });

  test("a wrong staff code is UNAUTHORIZED", async () => {
    const response = await rpcCall(["auth", "moderatorSignIn"], {
      identifier: DEMO_MODERATOR_EMAIL,
      staffCode: "000000",
      surface: "pwa",
    });

    expect(response.status).toBe(HTTP_UNAUTHORIZED);
    expect((await errorEnvelope(response)).code).toBe("UNAUTHORIZED");
  });
});

describe("E2E auth: sign-in lockout (AC-2)", () => {
  test("five wrong passwords lock the account and the sixth call reports the countdown", async () => {
    // A throwaway account: the seeded `locked@trips-enjoy.com` is never mutated.
    const { email } = identity();
    const registration = await rpcCall(["auth", "registerTraveler"], {
      fullName: "QA Lockout",
      email,
      password: DEMO_PASSWORD,
      preferredLanguage: "en",
      surface: "web",
    });
    expect(registration.status).toBe(HTTP_OK);

    let lastStatus = 0;
    let lastBody: { json?: { code?: string; data?: Record<string, unknown> } } = {};
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const response = await rpcCall(["auth", "signIn"], {
        identifier: email,
        method: "password",
        password: `WrongPassword${attempt}!`,
        surface: "web",
      });
      lastStatus = response.status;
      lastBody = (await readRpcBody(response)) as typeof lastBody;
    }

    // The 5th attempt crosses the threshold and reports when the lock ends.
    expect(lastStatus).toBe(HTTP_TOO_MANY_REQUESTS);
    expect(lastBody.json?.code).toBe("RATE_LIMITED");
    expect(typeof lastBody.json?.data?.lockedUntil).toBe("string");

    // The 6th call hits the "already locked" branch, which also sends remainingLockoutSeconds.
    const sixth = await rpcCall(["auth", "signIn"], {
      identifier: email,
      method: "password",
      password: "AnotherWrongPassword!",
      surface: "web",
    });
    expect(sixth.status).toBe(HTTP_TOO_MANY_REQUESTS);

    const sixthBody = (await readRpcBody(sixth)) as typeof lastBody;
    expect(sixthBody.json?.code).toBe("RATE_LIMITED");
    const remaining = sixthBody.json?.data?.remainingLockoutSeconds;
    expect(typeof remaining).toBe("number");
    expect(Number(remaining)).toBeGreaterThan(0);
  });
});

describe("E2E auth: error envelope shape (§3.5 dependency)", () => {
  test("a 401 carries error.data.error.code and error.data.requestId", async () => {
    const response = await rpcCall(["auth", "refreshSession"], {
      refreshToken: "not-a-real-refresh-token",
    });

    expect(response.status).toBe(HTTP_UNAUTHORIZED);

    const body = (await readRpcBody(response)) as {
      json?: {
        code?: string;
        data?: { error?: { code?: string }; requestId?: string };
      };
    };

    // These are exactly the two fields the shared mapper reads without any CORS change.
    expect(body.json?.code).toBe("UNAUTHORIZED");
    expect(body.json?.data?.error?.code).toBe("UNAUTHORIZED");
    expect(typeof body.json?.data?.requestId).toBe("string");
    expect((body.json?.data?.requestId ?? "").length).toBeGreaterThan(0);
  });

  test("an unauthenticated protected call is 401 UNAUTHORIZED", async () => {
    const response = await rpcCall(["auth", "getSession"], undefined);

    expect(response.status).toBe(HTTP_UNAUTHORIZED);
    expect((await errorEnvelope(response)).code).toBe("UNAUTHORIZED");
  });
});

describe("E2E auth: web-only organization registration (FR-AUTH-11, G5)", () => {
  test("organization_owner from a mobile surface is FORBIDDEN on the surface field", async () => {
    const { email, phone } = identity();
    const response = await rpcCall(["auth", "registerSupplierAccount"], {
      role: "organization_owner",
      fullName: "QA Organization",
      email,
      phone,
      password: DEMO_PASSWORD,
      preferredLanguage: "en",
      surface: "mobile",
    });

    expect(response.status).toBe(HTTP_FORBIDDEN);
    const envelope = await errorEnvelope(response);
    expect(envelope.code).toBe("FORBIDDEN");
    // `details` is spread into `error.data`, which is how the mapper recognises the R-ORG branch.
    expect(envelope.field).toBe("surface");
  });

  test("the same payload from the web surface is accepted", async () => {
    const { email, phone } = identity();
    const response = await rpcCall(["auth", "registerSupplierAccount"], {
      role: "organization_owner",
      fullName: "QA Organization",
      email,
      phone,
      password: DEMO_PASSWORD,
      preferredLanguage: "en",
      surface: "web",
    });

    expect(response.status).toBe(HTTP_OK);
    const result = await payload(response);
    expect(result.verificationRequired).toBe("both_email_and_phone");
    expect((result.otpDispatches as unknown[]).length).toBe(2);
  });
});

describe("E2E auth: rotation invalidates the token it replaced (R5)", () => {
  test("the previous refresh token is dead as soon as it has been rotated", async () => {
    const { session } = await createVerifiedTraveler();
    const firstRefreshToken = session.refreshToken as string;

    const rotated = await rpcCall(["auth", "refreshSession"], { refreshToken: firstRefreshToken });
    expect(rotated.status).toBe(HTTP_OK);
    const firstRotation = await payload(rotated);
    const secondRefreshToken = firstRotation.refreshToken as string;
    expect(secondRefreshToken).not.toBe(firstRefreshToken);

    // Rotation replaces the stored hash, so replaying the rotated-away token finds no session. This
    // is what bounds the blast radius of a stolen refresh token (PRD §7.2 R5).
    const reuse = await rpcCall(["auth", "refreshSession"], { refreshToken: firstRefreshToken });
    expect(reuse.status).toBe(HTTP_UNAUTHORIZED);
    expect((await errorEnvelope(reuse)).code).toBe("UNAUTHORIZED");

    // The new token is the live one.
    const second = await rpcCall(["auth", "refreshSession"], { refreshToken: secondRefreshToken });
    expect(second.status).toBe(HTTP_OK);
    const secondRotation = await payload(second);
    const thirdRefreshToken = secondRotation.refreshToken as string;
    expect(thirdRefreshToken).not.toBe(secondRefreshToken);

    const signOut = await rpcCall(
      ["auth", "signOut"],
      { refreshToken: thirdRefreshToken, allDevices: false },
      secondRotation.accessToken as string,
    );
    expect(signOut.status).toBe(HTTP_OK);

    const afterSignOut = await rpcCall(["auth", "refreshSession"], {
      refreshToken: thirdRefreshToken,
    });
    expect(afterSignOut.status).toBe(HTTP_UNAUTHORIZED);
    expect((await errorEnvelope(afterSignOut)).code).toBe("UNAUTHORIZED");
  });
});

describe("E2E auth: the server re-checks the role the token carries (A2, A3)", () => {
  test("a traveler bearer on an admin procedure is 403 ADMIN_SUBROLE_FORBIDDEN", async () => {
    const { session } = await createVerifiedTraveler();

    const response = await rpcCall(
      ["admin", "getSystemSettings"],
      undefined,
      session.accessToken as string,
    );

    expect(response.status).toBe(HTTP_FORBIDDEN);
    expect((await errorEnvelope(response)).code).toBe("ADMIN_SUBROLE_FORBIDDEN");

    // A3: a 403 never ends the session — the same bearer still answers an authenticated call.
    const stillSignedIn = await rpcCall(
      ["auth", "getSession"],
      undefined,
      session.accessToken as string,
    );
    expect(stillSignedIn.status).toBe(HTTP_OK);
  });

  test("no bearer on the same procedure is 401", async () => {
    const response = await rpcCall(["admin", "getSystemSettings"], undefined);

    expect(response.status).toBe(HTTP_UNAUTHORIZED);
    expect((await errorEnvelope(response)).code).toBe("UNAUTHORIZED");
  });
});

afterAll(async () => {
  // Remove the throwaway accounts and everything that cascades from them. Organizations restrict
  // deletion, so any organization owned by a QA account goes first. If the cleanup fails the suite
  // still passes: no assertion depends on row counts.
  try {
    const pattern = "qa+%";
    await db
      .delete(schema.organizations)
      .where(
        sql`${schema.organizations.ownerAccountId} in (select id from accounts where email_normalized like ${pattern})`,
      );
    await db.delete(schema.accounts).where(sql`${schema.accounts.emailNormalized} like ${pattern}`);
  } catch {
    // Intentionally ignored: cleanup is best-effort.
  }
});
