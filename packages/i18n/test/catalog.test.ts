// Catalog integrity for the non-auth surfaces (UI-01).
//
// The Arabic table is typed as `AppMessages`, so a missing key already fails the build. These tests
// guard the two things the type system cannot see: an empty translation that type-checks, and a
// placeholder that survives in English but disappears from the Arabic sentence (or vice versa),
// which would render `{count}` to a user.
import { describe, expect, test } from "bun:test";

import { AUTH_MESSAGES } from "@trips-app/i18n";

import { ar } from "../src/app/ar";
import { en } from "../src/app/en";

const PLACEHOLDER = /\{(\w+)\}/g;

function placeholders(value: string): string[] {
  return [...value.matchAll(PLACEHOLDER)].map((match) => match[1]).sort();
}

describe("Unit: screen catalog", () => {
  test("both locales define exactly the same keys", () => {
    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort());
  });

  test("no key is blank in either locale", () => {
    for (const [key, value] of Object.entries(en)) expect(value.trim(), key).not.toBe("");
    for (const [key, value] of Object.entries(ar)) expect(value.trim(), key).not.toBe("");
  });

  test("every placeholder in the English string is present in the Arabic string", () => {
    const mismatched = Object.keys(en).filter((key) => {
      const source = placeholders(en[key as keyof typeof en]);
      const target = placeholders(ar[key as keyof typeof ar]);
      return source.join(",") !== target.join(",");
    });
    expect(mismatched).toEqual([]);
  });

  test("screen keys never collide with the auth table", () => {
    const auth = new Set(Object.keys(AUTH_MESSAGES.en));
    expect(Object.keys(en).filter((key) => auth.has(key))).toEqual([]);
  });

  test("keys are namespaced by surface", () => {
    const allowed = ["screen.", "component.", "ui.", "route."];
    expect(
      Object.keys(en).filter((key) => !allowed.some((prefix) => key.startsWith(prefix))),
    ).toEqual([]);
  });
});
