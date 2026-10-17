// Validation copy: a coded input error must render from the catalog in the caller's language, and
// fall back to the server's sentence only when the code or its parameters are missing (AC-7, I1).
import { describe, expect, test } from "bun:test";

import { t } from "@trips-app/i18n";

import { fieldMessageFor, mapAuthError, VALIDATION_MESSAGE_KEYS } from "../src/index";
import type { AuthErrorFieldIssue, AuthLocale } from "../src/index";

const ARABIC = /[\u0600-\u06FF]/;

function fieldView(issue: AuthErrorFieldIssue, locale: AuthLocale = "en") {
  const view = mapAuthError({
    code: "VALIDATION_ERROR",
    locale,
    fieldErrors: [issue],
  });
  return view.fieldErrors![0]!;
}

function copy(issue: AuthErrorFieldIssue, locale: AuthLocale): string {
  return fieldMessageFor(fieldView(issue, locale), locale);
}

describe("Validation: codes render from the catalog", () => {
  test("a length rule carries its bound into both locales", () => {
    const issue = {
      field: "password",
      code: "TOO_SHORT",
      message: "Too short.",
      params: { min: 12 },
    };

    expect(fieldView(issue).key).toBe("validation.tooShort");
    expect(copy(issue, "en")).toBe("Use at least 12 characters.");

    const ar = copy(issue, "ar");
    expect(ar).toContain("12");
    expect(ARABIC.test(ar)).toBe(true);
  });

  test("a format rule needs no parameters", () => {
    const issue = { field: "email", code: "INVALID_EMAIL", message: "Bad email." };

    expect(fieldView(issue).key).toBe("validation.invalidEmail");
    expect(copy(issue, "en")).toBe("Enter a valid email address.");
    expect(ARABIC.test(copy(issue, "ar"))).toBe(true);
  });

  test("a fixed-length code names the length", () => {
    const issue = { field: "code", code: "INVALID_CODE", message: "Wrong.", params: { length: 6 } };

    expect(copy(issue, "en")).toBe("Enter the 6-digit code.");
    expect(copy(issue, "ar")).toContain("6");
  });

  test("a range rule uses both bounds", () => {
    const issue = {
      field: "role",
      code: "OUT_OF_RANGE",
      message: "Out of range.",
      params: { min: 1, max: 9 },
    };

    expect(copy(issue, "en")).toBe("Enter a value between 1 and 9.");
  });

  test("a required rule is locale-aware", () => {
    const issue = { field: "fullName", code: "REQUIRED", message: "Required." };

    expect(copy(issue, "en")).toBe("This field is required.");
    expect(copy(issue, "ar")).toBe("هذا الحقل مطلوب.");
  });

  test("BAD_REQUEST — what oRPC reports for a zod failure — is treated as validation", () => {
    const view = mapAuthError({
      code: "BAD_REQUEST",
      locale: "en",
      fieldErrors: [
        { field: "password", code: "TOO_SHORT", message: "Too short.", params: { min: 12 } },
      ],
    });

    expect(view.field).toBe("password");
    expect(view.recovery).toBe("focusField");
    expect(fieldMessageFor(view.fieldErrors![0]!, "en")).toBe("Use at least 12 characters.");
  });
});

describe("Validation: fallbacks never leak a placeholder", () => {
  test("a code without its parameters falls back to the server sentence", () => {
    const issue = { field: "password", code: "TOO_SHORT", message: "Password is too short." };
    const view = fieldView(issue);

    expect(view.key).toBe("field.password");
    expect(copy(issue, "en")).toBe("Password is too short.");
  });

  test("an unknown code falls back to the field template, then the generic key", () => {
    expect(fieldView({ field: "email", code: "SOMETHING_NEW", message: "Nope." }).key).toBe(
      "field.email",
    );
    expect(fieldView({ field: "other", code: "SOMETHING_NEW", message: "Nope." }).key).toBe(
      "auth.error.validation",
    );
  });

  test("every validation key renders without a leftover placeholder", () => {
    for (const locale of ["en", "ar"] as const) {
      for (const key of VALIDATION_MESSAGE_KEYS) {
        const rendered = t(key, locale, { min: 1, max: 2, length: 6 });
        expect(rendered).not.toContain("{");
        expect(rendered).not.toBe(key);
        expect(rendered.length).toBeGreaterThan(0);
      }
    }
  });
});
