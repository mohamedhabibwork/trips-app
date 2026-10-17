// Completeness of the refresh policy (PRD §7.2 R2–R4, ARCHITECTURE §3.1). The existing suite asserts
// the five procedures the PRD sentence names; the backend also emits the three second-factor
// procedures, and a refresh on any of them would loop the user back into the challenge they just
// failed. This file pins the whole set and the `details` shapes the mapper has to read.
import { describe, expect, test } from "bun:test";

import {
  NO_REFRESH_PROCEDURES,
  REFRESHABLE_CODES,
  isMaxSessionReason,
  isNoRefreshProcedure,
  lockoutSecondsRemaining,
  needsRefreshOnError,
  remainingOtpAttempts,
} from "../src/index";

/** The eight procedures R4 must cover: the five in the PRD sentence plus the three 2FA steps. */
const EXPECTED_NO_REFRESH = [
  "auth/refreshSession",
  "auth/signIn",
  "auth/verifyOtp",
  "auth/adminSignIn",
  "auth/adminVerifyTotp",
  "auth/staffSignIn",
  "auth/staffVerifySecondFactor",
  "auth/moderatorSignIn",
];

describe("Unit: R4 covers exactly the eight auth procedures", () => {
  test("the set is exactly the expected eight, with no extras", () => {
    expect([...NO_REFRESH_PROCEDURES].sort()).toEqual([...EXPECTED_NO_REFRESH].sort());
    expect(NO_REFRESH_PROCEDURES.length).toBe(8);
  });

  test("none of them refreshes on any refreshable 401 code", () => {
    for (const procedure of EXPECTED_NO_REFRESH) {
      expect(isNoRefreshProcedure(procedure)).toBe(true);
      for (const code of REFRESHABLE_CODES) {
        expect(needsRefreshOnError({ status: 401, code, procedure })).toBe(false);
      }
    }
  });

  test("a non-auth procedure refreshes on every refreshable 401 code", () => {
    for (const code of REFRESHABLE_CODES) {
      expect(needsRefreshOnError({ status: 401, code, procedure: "booking/list" })).toBe(true);
    }
    expect(REFRESHABLE_CODES).toEqual([
      "AUTH_TOKEN_EXPIRED",
      "AUTH_SESSION_EXPIRED",
      "UNAUTHORIZED",
    ]);
  });

  test("a 401 with no code at all is not refreshed", () => {
    expect(needsRefreshOnError({ status: 401, code: "", procedure: "booking/list" })).toBe(false);
  });

  test("a 403 that carries a refreshable code is never refreshed (A3)", () => {
    expect(
      needsRefreshOnError({ status: 403, code: "AUTH_TOKEN_EXPIRED", procedure: "booking/list" }),
    ).toBe(false);
  });
});

describe("Unit: F2 max-session detection", () => {
  test("only details.reason triggers it", () => {
    expect(isMaxSessionReason({ reason: "MAX_SESSION_DURATION_REACHED" })).toBe(true);
    expect(isMaxSessionReason({ draftsRetained: true })).toBe(false);
    expect(isMaxSessionReason({ reason: "max_session_duration_reached" })).toBe(false);
    expect(isMaxSessionReason(null as unknown as undefined)).toBe(false);
    expect(isMaxSessionReason([] as unknown as Record<string, unknown>)).toBe(false);
  });
});

describe("Unit: lockout countdown shapes (§1.2)", () => {
  const now = Date.parse("2026-10-17T12:00:00.000Z");

  test("remainingLockoutSeconds wins over a lockedUntil that disagrees", () => {
    const details = {
      remainingLockoutSeconds: 30,
      lockedUntil: "2026-10-17T13:00:00.000Z",
    };

    expect(lockoutSecondsRemaining(details, now)).toBe(30);
  });

  test("a non-numeric remainingLockoutSeconds falls back to lockedUntil", () => {
    expect(
      lockoutSecondsRemaining(
        { remainingLockoutSeconds: "900", lockedUntil: "2026-10-17T12:02:00.000Z" },
        now,
      ),
    ).toBe(120);
  });

  test("remainingLockoutSeconds of zero falls back to lockedUntil", () => {
    expect(
      lockoutSecondsRemaining(
        { remainingLockoutSeconds: 0, lockedUntil: "2026-10-17T12:01:00.000Z" },
        now,
      ),
    ).toBe(60);
  });

  test("NaN is ignored rather than propagated", () => {
    expect(lockoutSecondsRemaining({ remainingLockoutSeconds: Number.NaN }, now)).toBe(0);
  });

  test("pausedUntil is preferred over retryAfterSeconds", () => {
    const details = { pausedUntil: "2026-10-17T12:05:00.000Z", retryAfterSeconds: 5 };

    expect(lockoutSecondsRemaining(details, now)).toBe(300);
  });

  test("the result is always a non-negative integer", () => {
    const cases: Array<Record<string, unknown>> = [
      { remainingLockoutSeconds: 0.4 },
      { lockedUntil: "2026-10-17T12:00:00.500Z" },
      { retryAfterSeconds: 0.2 },
      { retryAfterSeconds: -10 },
      { lockedUntil: "not-a-date" },
      {},
    ];

    for (const details of cases) {
      const seconds = lockoutSecondsRemaining(details, now);
      expect(Number.isInteger(seconds)).toBe(true);
      expect(seconds).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("Unit: remaining OTP attempts", () => {
  test("the counter is subtracted from the maximum and clamped at zero", () => {
    expect(remainingOtpAttempts({ wrongAttempts: 0 }, 5)).toBe(5);
    expect(remainingOtpAttempts({ wrongAttempts: 2 }, 5)).toBe(3);
    expect(remainingOtpAttempts({ wrongAttempts: 5 }, 5)).toBe(0);
    expect(remainingOtpAttempts({ wrongAttempts: 7 }, 5)).toBe(0);
  });

  test("a non-numeric counter counts as zero wrong attempts", () => {
    expect(remainingOtpAttempts({ wrongAttempts: "2" }, 5)).toBe(5);
  });
});
