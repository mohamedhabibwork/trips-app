// T4 / AC-5: no token ever reaches a log line, an error report or an analytics payload.
//
// Two halves: the redaction primitives behave (behavioural), and the auth layer has no other way to
// log (structural). The structural half is what keeps this true next month — a `console.log(record)`
// added anywhere under `apps/web/src/auth` or `packages/auth/src` fails a test.
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  NOOP_AUTH_LOGGER,
  REDACTED,
  createAuthLogger,
  redactMessage,
  redactToken,
  scrubPayload,
} from "../src/index";

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhY2N0LTEifQ.c2lnbmF0dXJl";
const REFRESH_TOKEN = "rt_9f8e7d6c5b4a39281706f5e4d3c2b1a0";

describe("Unit: redactToken", () => {
  test("returns an empty string for nothing", () => {
    expect(redactToken(null)).toBe("");
    expect(redactToken(undefined)).toBe("");
    expect(redactToken("")).toBe("");
  });

  test("returns only the marker for any token", () => {
    expect(redactToken(ACCESS_TOKEN)).toBe(REDACTED);
    expect(redactToken(REFRESH_TOKEN)).toBe(REDACTED);
    expect(redactToken("x")).toBe(REDACTED);
  });

  test("leaks neither a prefix, a suffix nor the length", () => {
    const redacted = redactToken(ACCESS_TOKEN);

    expect(redacted).not.toContain(ACCESS_TOKEN.slice(0, 6));
    expect(redacted).not.toContain(ACCESS_TOKEN.slice(-6));
    expect(redacted.length).not.toBe(ACCESS_TOKEN.length);
  });
});

describe("Unit: redactMessage", () => {
  test("strips a bearer header value", () => {
    const message = redactMessage(
      `GET /rpc/auth/getSession authorization: Bearer ${REFRESH_TOKEN}`,
    );

    expect(message).not.toContain(REFRESH_TOKEN);
    expect(message).toContain("Bearer [redacted]");
  });

  test("strips a bare JWT anywhere in the line", () => {
    const message = redactMessage(`failed with token ${ACCESS_TOKEN} in the body`);

    expect(message).not.toContain(ACCESS_TOKEN);
    expect(message).toContain(REDACTED);
  });

  test("strips every occurrence, not just the first", () => {
    const message = redactMessage(`a Bearer ${ACCESS_TOKEN} b Bearer ${ACCESS_TOKEN} c`);

    expect(message).not.toContain(ACCESS_TOKEN);
  });

  test("leaves an ordinary message untouched", () => {
    expect(redactMessage("session refreshed for acct_1")).toBe("session refreshed for acct_1");
    expect(redactMessage("")).toBe("");
  });
});

describe("Unit: scrubPayload", () => {
  test("replaces every sensitive key, at any depth", () => {
    const scrubbed = scrubPayload({
      accessToken: ACCESS_TOKEN,
      refreshToken: REFRESH_TOKEN,
      authorization: `Bearer ${ACCESS_TOKEN}`,
      password: "DemoPassword123!",
      otpCode: "123456",
      totpSecret: "JBSWY3DPEHPK3PXP",
      cookie: "session=abc",
      nested: {
        credentials: { refreshToken: REFRESH_TOKEN },
        meta: { refreshToken: REFRESH_TOKEN },
      },
      list: [{ accessToken: ACCESS_TOKEN }],
      safe: "booking_1",
      count: 3,
    }) as Record<string, unknown>;

    const serialized = JSON.stringify(scrubbed);
    expect(serialized).not.toContain(ACCESS_TOKEN);
    expect(serialized).not.toContain(REFRESH_TOKEN);
    expect(serialized).not.toContain("DemoPassword123!");
    expect(serialized).not.toContain("123456");
    expect(serialized).not.toContain("JBSWY3DPEHPK3PXP");

    expect(scrubbed.safe).toBe("booking_1");
    expect(scrubbed.count).toBe(3);
    const nested = scrubbed.nested as Record<string, unknown>;
    // A sensitive key is replaced wholesale: its children are never walked.
    expect(nested.credentials).toBe(REDACTED);
    // A neutral key is walked, so a token one level down is still caught.
    expect(nested.meta).toEqual({ refreshToken: REDACTED });
  });

  test("keeps an Error's name and message but redacts a token inside them", () => {
    const error = new Error(`refresh rejected for Bearer ${REFRESH_TOKEN}`);
    error.name = "SessionExpiredError";

    const scrubbed = scrubPayload(error) as Record<string, unknown>;

    expect(scrubbed.name).toBe("SessionExpiredError");
    expect(String(scrubbed.message)).not.toContain(REFRESH_TOKEN);
  });

  test("survives a cycle instead of throwing", () => {
    const value: Record<string, unknown> = { name: "loop" };
    value.self = value;

    expect(() => scrubPayload(value)).not.toThrow();
    expect(JSON.stringify(scrubPayload(value))).toContain("[circular]");
  });

  test("preserves primitives and stringifies what JSON cannot carry", () => {
    expect(scrubPayload("plain")).toBe("plain");
    expect(scrubPayload(1.5)).toBe(1.5);
    expect(scrubPayload(true)).toBe(true);
    expect(scrubPayload(null)).toBeNull();
    expect(scrubPayload(undefined)).toBeUndefined();
    expect(scrubPayload(10n)).toBe("10");
    expect(scrubPayload(() => 1)).toBe("[unsupported]");
  });
});

describe("Unit: createAuthLogger", () => {
  test("the sink never sees a token, in the message or the context", () => {
    const lines: Array<{ message: string; context: unknown }> = [];
    const logger = createAuthLogger((message, context) => lines.push({ message, context }));

    logger.warn(`refresh failed for Bearer ${REFRESH_TOKEN}`, {
      accessToken: ACCESS_TOKEN,
      refreshToken: REFRESH_TOKEN,
    });

    const line = lines[0]!;
    expect(JSON.stringify(line)).not.toContain(REFRESH_TOKEN);
    expect(JSON.stringify(line)).not.toContain(ACCESS_TOKEN);
    expect(line.message).toContain(REDACTED);
  });

  test("every level goes through the same scrubbing", () => {
    const messages: string[] = [];
    const logger = createAuthLogger((message) => messages.push(message));

    logger.debug(`debug ${ACCESS_TOKEN}`);
    logger.info(`info ${ACCESS_TOKEN}`);
    logger.warn(`warn ${ACCESS_TOKEN}`);
    logger.error(`error ${ACCESS_TOKEN}`);

    expect(messages.length).toBe(4);
    for (const message of messages) {
      expect(message).not.toContain(ACCESS_TOKEN);
    }
  });

  test("a context of undefined stays undefined", () => {
    const contexts: unknown[] = [];
    const logger = createAuthLogger((_message, context) => contexts.push(context));

    logger.info("no context");

    expect(contexts).toEqual([undefined]);
  });

  test("the no-op logger is safe to call", () => {
    expect(() => {
      NOOP_AUTH_LOGGER.debug("x");
      NOOP_AUTH_LOGGER.info("x");
      NOOP_AUTH_LOGGER.warn("x");
      NOOP_AUTH_LOGGER.error("x");
    }).not.toThrow();
  });
});

/** Every `.ts` file under `directory`, recursively. */
function sourceFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...sourceFiles(full));
    else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) files.push(full);
  }
  return files;
}

describe("Unit: the auth layer has no unredacted log path (AC-5)", () => {
  const AUTH_SOURCES = [
    join(import.meta.dir, "..", "src"),
    join(import.meta.dir, "..", "..", "..", "apps", "web", "src", "auth"),
  ];

  test("no auth source calls console directly", () => {
    const offenders: string[] = [];

    for (const directory of AUTH_SOURCES) {
      for (const file of sourceFiles(directory)) {
        const source = readFileSync(file, "utf8");
        // `console.*` is the one sink that cannot be scrubbed; the logger exists so nobody needs it.
        if (/\bconsole\s*\.\s*(log|error|warn|info|debug|trace)\s*\(/.test(source)) {
          offenders.push(file);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  test("no auth source builds a message from a token field", () => {
    const offenders: string[] = [];

    for (const directory of AUTH_SOURCES) {
      for (const file of sourceFiles(directory)) {
        const source = readFileSync(file, "utf8");
        // A template literal that interpolates a token directly is a leak even without a console:
        // it ends up in an Error message, a toast, or a crash report.
        if (/\$\{[^}]*\.(accessToken|refreshToken)\b/.test(source)) {
          offenders.push(file);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
