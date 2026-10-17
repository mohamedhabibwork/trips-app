// The i18n contract the auth package relies on: current-locale resolution and key fallback.
//
// These live in packages/auth/test so the standard `bun test packages/auth` run covers them; the
// subject is `@trips-app/i18n`, which ships no test runner of its own.
import { afterEach, describe, expect, test } from "bun:test";

import {
  AUTH_MESSAGE_KEYS,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  directionOf,
  getLocale,
  hasTranslation,
  normalizeLocale,
  resetLocale,
  setLocale,
  subscribeLocale,
  t,
} from "@trips-app/i18n";

afterEach(() => {
  resetLocale();
});

describe("Current locale: getLocale / setLocale (UI-01)", () => {
  test("a host with no preference gets the product default, Arabic", () => {
    expect(DEFAULT_LOCALE).toBe("ar");
    expect(getLocale()).toBe("ar");
  });

  test("a BCP 47 tag is narrowed to a shipped locale", () => {
    expect(normalizeLocale("ar-EG")).toBe("ar");
    expect(normalizeLocale("AR_eg")).toBe("ar");
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("fr-FR")).toBeNull();
    expect(normalizeLocale("")).toBeNull();
    expect(normalizeLocale(null)).toBeNull();
  });

  test("setLocale switches the locale that t() reads", () => {
    setLocale("en");
    expect(getLocale()).toBe("en");
    expect(t("auth.signIn.title")).toBe("Sign in");

    setLocale("ar");
    expect(getLocale()).toBe("ar");
    expect(t("auth.signIn.title")).toBe("تسجيل الدخول");
  });

  test("subscribers hear the new locale and stop after unsubscribing", () => {
    const heard: string[] = [];
    const unsubscribe = subscribeLocale((locale) => heard.push(locale));

    setLocale("en");
    setLocale("ar");
    unsubscribe();
    setLocale("en");

    expect(heard).toEqual(["en", "ar"]);
  });

  test("every supported locale has a reading direction", () => {
    expect(SUPPORTED_LOCALES).toEqual(["ar", "en"]);
    expect(directionOf("ar")).toBe("rtl");
    expect(directionOf("en")).toBe("ltr");
  });
});

describe("Copy lookup: t() (I1)", () => {
  test("an untranslated key renders as the key, never as English or an empty string", () => {
    expect(t("auth.does.not.exist")).toBe("auth.does.not.exist");
    expect(t("auth.does.not.exist", "ar")).toBe("auth.does.not.exist");
    expect(t("auth.does.not.exist", "en")).toBe("auth.does.not.exist");
    expect(t("")).toBe("");
  });

  test("placeholders are interpolated in both locales", () => {
    const en = t("auth.error.accountLocked", "en", { seconds: 30 });
    const ar = t("auth.error.accountLocked", "ar", { seconds: 30 });

    expect(en).toContain("30");
    expect(ar).toContain("30");
    expect(/[\u0600-\u06FF]/.test(ar)).toBe(true);
  });

  test("params can be passed without naming a locale", () => {
    setLocale("ar");
    const ar = t("auth.error.accountLocked", { seconds: 45 });
    expect(ar).toContain("45");
    expect(/[\u0600-\u06FF]/.test(ar)).toBe(true);

    setLocale("en");
    expect(t("auth.error.accountLocked", { seconds: 45 })).toContain("45");
  });

  test("an unknown placeholder is left untouched", () => {
    expect(t("auth.error.unexpected", "en", {})).toContain("{requestId}");
  });

  test("every key is translated in both locales", () => {
    expect(AUTH_MESSAGE_KEYS.length).toBeGreaterThan(0);

    for (const key of AUTH_MESSAGE_KEYS) {
      expect(hasTranslation("ar", key)).toBe(true);
      expect(hasTranslation("en", key)).toBe(true);
      expect(t(key, "ar").length).toBeGreaterThan(0);
      expect(t(key, "en").length).toBeGreaterThan(0);
    }

    expect(hasTranslation("ar", "auth.does.not.exist")).toBe(false);
  });
});
