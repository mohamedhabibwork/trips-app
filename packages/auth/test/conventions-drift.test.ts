import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { SHARED_ERROR_CODES } from "@trips-app/domain";
import { authMessageKeys, hasAuthMessage, t } from "@trips-app/i18n";

import {
  AUTH_CONVENTIONS,
  AUTH_ERROR_MESSAGE_KEYS,
  AUTH_ERROR_ROWS,
  AUTH_FIELD_NAMES,
  AUTH_STORAGE_KEY,
  NO_REFRESH_PROCEDURES,
  REFRESH_LEAD_MS,
  SURFACE_IDS,
} from "../src/index";

const SRC = join(import.meta.dir, "..", "src");

function sourceFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...sourceFiles(full));
    else if (entry.name.endsWith(".ts")) files.push(full);
  }
  return files;
}

describe("Drift: conventions.json ↔ the code that consumes it (§6 rule 2)", () => {
  test("every code in the error table is a real SharedErrorCode", () => {
    for (const row of AUTH_ERROR_ROWS) {
      expect(row.codes.length).toBeGreaterThan(0);
      for (const code of row.codes) {
        expect(SHARED_ERROR_CODES as readonly string[]).toContain(code);
      }
    }
  });

  test("no server code appears in two rows", () => {
    const seen = new Set<string>();
    for (const row of AUTH_ERROR_ROWS) {
      for (const code of row.codes) {
        expect(seen.has(code)).toBe(false);
        seen.add(code);
      }
    }
  });

  test("the documented constants are the documented values", () => {
    expect(AUTH_STORAGE_KEY).toBe("trips.auth.v1");
    expect(REFRESH_LEAD_MS).toBe(60_000);
    expect(AUTH_CONVENTIONS.statuses).toEqual([
      "loading",
      "authenticated",
      "anonymous",
      "sessionExpired",
    ]);
    expect(AUTH_CONVENTIONS.webSessionMaxSeconds).toBe(43_200);
    expect(AUTH_CONVENTIONS.accessTokenTtlSeconds).toBe(900);
    expect(SURFACE_IDS.length).toBe(8);
  });

  test("R4 lists at least the five procedures the PRD names", () => {
    for (const procedure of [
      "auth/refreshSession",
      "auth/signIn",
      "auth/adminSignIn",
      "auth/staffSignIn",
      "auth/moderatorSignIn",
    ]) {
      expect(NO_REFRESH_PROCEDURES).toContain(procedure);
    }
  });
});

describe("Drift: error keys ↔ messages.json (§6 rule 2)", () => {
  test("every key the mapper can emit exists in both locales", () => {
    for (const key of AUTH_ERROR_MESSAGE_KEYS) {
      expect(hasAuthMessage(key)).toBe(true);
    }
  });

  test("every error/field key in the catalog is emitted by the mapper", () => {
    const emitted = new Set(AUTH_ERROR_MESSAGE_KEYS);
    const catalogErrorKeys = authMessageKeys("en").filter(
      (key) => key.startsWith("auth.error.") || key.startsWith("field."),
    );

    expect(catalogErrorKeys.length).toBeGreaterThan(0);
    for (const key of catalogErrorKeys) {
      expect(emitted.has(key)).toBe(true);
    }
  });

  test("both locales carry exactly the same keys", () => {
    expect(authMessageKeys("en")).toEqual(authMessageKeys("ar"));
  });

  test("every field name has a field.<name> message", () => {
    for (const field of AUTH_FIELD_NAMES) {
      expect(hasAuthMessage(`field.${field}`)).toBe(true);
    }
  });

  test("no message value is empty, and Arabic is real Arabic", () => {
    const arabicKeys = authMessageKeys("ar");
    for (const key of arabicKeys) {
      expect(key.length).toBeGreaterThan(0);
    }

    // Spot-check the user-visible auth copy: the Arabic must contain Arabic letters, not
    // transliteration.
    for (const key of [
      "auth.signIn.title",
      "auth.signUp.title",
      "auth.otp.submit",
      "auth.crew.title",
    ]) {
      expect(/[\u0600-\u06FF]/.test(t(key, "ar"))).toBe(true);
    }
  });
});

describe("Drift: the package stays buildable for Workers (R-1)", () => {
  test("no source file imports @trips-app/domain or node:crypto", () => {
    const files = sourceFiles(SRC);
    expect(files.length).toBeGreaterThan(5);

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain('from "@trips-app/domain"');
      expect(source).not.toContain('from "node:crypto"');
      expect(source).not.toContain("require(");
    }
  });

  test("the only runtime dependency is the dependency-free i18n package", () => {
    const pkg = JSON.parse(readFileSync(join(SRC, "..", "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
    };

    expect(Object.keys(pkg.dependencies ?? {})).toEqual(["@trips-app/i18n"]);
  });
});
