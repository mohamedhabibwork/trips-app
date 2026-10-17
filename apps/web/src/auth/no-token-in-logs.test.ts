// T4 / AC-5 on the web side: "Given a logger spy during a full flow, when logs are inspected, then no
// substring of either token appears."
//
// The auth layer has no logger of its own, so the risk is a stray `console.log` added later or a toast
// built straight from an error message. Both are asserted structurally here, and the redaction helper
// the toast path uses is asserted behaviourally.
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { REDACTED, redactMessage, redactToken, scrubPayload } from "@trips-app/auth";

const AUTH_DIR = import.meta.dir;
const ORPC_UTILS = join(AUTH_DIR, "..", "utils", "orpc.ts");

function authSources(): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(AUTH_DIR, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      files.push(...authSourcesIn(join(AUTH_DIR, entry.name)));
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      if (!entry.name.endsWith(".test.ts") && !entry.name.endsWith(".test.tsx")) {
        files.push(join(AUTH_DIR, entry.name));
      }
    }
  }
  return files;
}

function authSourcesIn(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...authSourcesIn(full));
    else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) files.push(full);
  }
  return files;
}

const JWT = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhY2N0LTEifQ.c2lnbmF0dXJl";
const REFRESH = "rt_9f8e7d6c5b4a39281706f5e4d3c2b1a0";

describe("Unit: the web auth layer never logs directly", () => {
  test("no file under apps/web/src/auth calls console", () => {
    const offenders = authSources().filter((file) =>
      /\bconsole\s*\.\s*(log|error|warn|info|debug|trace|table|dir)\s*\(/.test(
        readFileSync(file, "utf8"),
      ),
    );

    expect(offenders).toEqual([]);
  });

  test("no file under apps/web/src/auth interpolates a token into a string", () => {
    const offenders = authSources().filter((file) =>
      /\$\{[^}]*\.(accessToken|refreshToken)\b/.test(readFileSync(file, "utf8")),
    );

    expect(offenders).toEqual([]);
  });

  test("the query-error toast goes through redactMessage", () => {
    const source = readFileSync(ORPC_UTILS, "utf8");

    // The only user-visible error text outside the screens is this toast; it must be redacted and it
    // must never render a 401 (F3: the dialog is already up).
    expect(source).toContain("redactMessage(error.message)");
    expect(source).toContain("if (failure.status === 401) return;");
    expect(source).not.toMatch(/toast\.error\(error\.message/);
  });
});

describe("Unit: redaction on a realistic log line", () => {
  test("a bearer header and a bare JWT are both removed", () => {
    const line = redactMessage(
      `POST /rpc/auth/refreshSession 401 authorization: Bearer ${JWT} accessToken=${JWT}`,
    );

    expect(line).not.toContain(JWT);
    expect(line).toContain("/rpc/auth/refreshSession");
    expect(line).toContain(REDACTED);
  });

  test("the shape-based scrubber cannot see an opaque token — the key-based one must", () => {
    // Documented limitation, asserted so nobody relies on the wrong helper: `redactMessage` matches
    // `Bearer …` and JWT shapes only, so an opaque refresh token embedded in prose survives it.
    expect(redactMessage(`refreshToken=${REFRESH}`)).toContain(REFRESH);

    // The guarantee that does hold: `scrubPayload` redacts by key, so a token is safe as long as it
    // is passed as structured context (which is what `createAuthLogger` forces).
    const scrubbed = JSON.stringify(scrubPayload({ refreshToken: REFRESH, accessToken: JWT }));
    expect(scrubbed).not.toContain(REFRESH);
    expect(scrubbed).not.toContain(JWT);
  });

  test("redactToken never returns any part of the value", () => {
    expect(redactToken(JWT)).toBe(REDACTED);
    expect(redactToken(JWT)).not.toContain(JWT.slice(0, 8));
  });
});
