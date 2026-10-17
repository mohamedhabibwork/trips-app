import { describe, expect, test } from "bun:test";

import {
  MAX_SESSION_REASON,
  NO_REFRESH_PROCEDURES,
  isMaxSessionReason,
  isNoRefreshProcedure,
  isRefreshableCode,
  lockoutSecondsRemaining,
  needsRefreshOnError,
  remainingOtpAttempts,
} from "../src/index";

describe("Unit: reactive refresh decision (R2)", () => {
  test("true for AUTH_TOKEN_EXPIRED and AUTH_SESSION_EXPIRED", () => {
    expect(
      needsRefreshOnError({ status: 401, code: "AUTH_TOKEN_EXPIRED", procedure: "booking/list" }),
    ).toBe(true);
    expect(
      needsRefreshOnError({ status: 401, code: "AUTH_SESSION_EXPIRED", procedure: "booking/list" }),
    ).toBe(true);
  });

  test("true for the UNAUTHORIZED a missing or expired bearer produces", () => {
    // apps/server/src/context.ts verifies the JWT only, so an expired bearer surfaces as UNAUTHORIZED.
    expect(
      needsRefreshOnError({ status: 401, code: "UNAUTHORIZED", procedure: "auth/getSession" }),
    ).toBe(true);
  });

  test("false for any non-401 status", () => {
    expect(
      needsRefreshOnError({ status: 403, code: "AUTH_TOKEN_EXPIRED", procedure: "booking/list" }),
    ).toBe(false);
    expect(
      needsRefreshOnError({ status: 500, code: "INTERNAL_ERROR", procedure: "booking/list" }),
    ).toBe(false);
  });

  test("false for a 401 whose code is not refreshable", () => {
    expect(needsRefreshOnError({ status: 401, code: "FORBIDDEN", procedure: "booking/list" })).toBe(
      false,
    );
  });
});

describe("Unit: no-refresh procedures (R4)", () => {
  test("every listed procedure never refreshes, even on a refreshable 401", () => {
    expect(NO_REFRESH_PROCEDURES.length).toBeGreaterThanOrEqual(5);
    for (const procedure of NO_REFRESH_PROCEDURES) {
      expect(isNoRefreshProcedure(procedure)).toBe(true);
      expect(needsRefreshOnError({ status: 401, code: "AUTH_TOKEN_EXPIRED", procedure })).toBe(
        false,
      );
      expect(needsRefreshOnError({ status: 401, code: "UNAUTHORIZED", procedure })).toBe(false);
    }
  });

  test("the five procedures R4 names are all covered", () => {
    for (const procedure of [
      "auth/refreshSession",
      "auth/signIn",
      "auth/adminSignIn",
      "auth/staffSignIn",
      "auth/moderatorSignIn",
    ]) {
      expect(isNoRefreshProcedure(procedure)).toBe(true);
    }
  });

  test("an ordinary procedure is not in the set", () => {
    expect(isNoRefreshProcedure("booking/create")).toBe(false);
  });
});

describe("Unit: refreshable codes", () => {
  test("only the documented codes qualify", () => {
    expect(isRefreshableCode("AUTH_TOKEN_EXPIRED")).toBe(true);
    expect(isRefreshableCode("AUTH_SESSION_EXPIRED")).toBe(true);
    expect(isRefreshableCode("UNAUTHORIZED")).toBe(true);
    expect(isRefreshableCode("VALIDATION_ERROR")).toBe(false);
    expect(isRefreshableCode("AUTH_OTP_INVALID")).toBe(false);
  });
});

describe("Unit: max session reason (F2)", () => {
  test("detects the detail, not a code", () => {
    expect(isMaxSessionReason({ reason: MAX_SESSION_REASON })).toBe(true);
    expect(
      isMaxSessionReason({ reason: "MAX_SESSION_DURATION_REACHED", draftsRetained: true }),
    ).toBe(true);
    expect(isMaxSessionReason({ reason: "something_else" })).toBe(false);
    expect(isMaxSessionReason(undefined)).toBe(false);
  });
});

describe("Unit: lockout countdown (AC-2)", () => {
  const now = Date.parse("2026-10-17T12:00:00.000Z");

  test("prefers remainingLockoutSeconds", () => {
    expect(lockoutSecondsRemaining({ remainingLockoutSeconds: 900 }, now)).toBe(900);
    expect(lockoutSecondsRemaining({ remainingLockoutSeconds: 12.2 }, now)).toBe(13);
  });

  test("derives from lockedUntil when only the timestamp is sent", () => {
    expect(lockoutSecondsRemaining({ lockedUntil: "2026-10-17T12:05:00.000Z" }, now)).toBe(300);
  });

  test("derives from pausedUntil for an OTP pause", () => {
    expect(lockoutSecondsRemaining({ pausedUntil: "2026-10-17T12:10:00.000Z" }, now)).toBe(600);
  });

  test("falls back to retryAfterSeconds for an OTP cooldown", () => {
    expect(lockoutSecondsRemaining({ retryAfterSeconds: 45 }, now)).toBe(45);
  });

  test("never returns a negative number", () => {
    expect(lockoutSecondsRemaining({ lockedUntil: "2026-10-17T11:00:00.000Z" }, now)).toBe(0);
    expect(lockoutSecondsRemaining({ remainingLockoutSeconds: -5 }, now)).toBe(0);
  });

  test("returns zero when there is nothing to count", () => {
    expect(lockoutSecondsRemaining(undefined, now)).toBe(0);
    expect(lockoutSecondsRemaining({}, now)).toBe(0);
  });
});

describe("Unit: remaining OTP attempts", () => {
  test("subtracts the wrong-attempt counter from the maximum", () => {
    expect(remainingOtpAttempts({ wrongAttempts: 1 }, 5)).toBe(4);
    expect(remainingOtpAttempts({ wrongAttempts: 5 }, 5)).toBe(0);
    expect(remainingOtpAttempts(undefined, 5)).toBe(5);
    expect(remainingOtpAttempts({ wrongAttempts: 9 }, 5)).toBe(0);
  });
});
