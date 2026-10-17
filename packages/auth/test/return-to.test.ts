import { describe, expect, test } from "bun:test";

import { isSafePath, sanitizeReturnTo } from "../src/index";

describe("Unit: returnTo (E3)", () => {
  test("keeps same-origin relative paths", () => {
    expect(sanitizeReturnTo("/business")).toBe("/business");
    expect(sanitizeReturnTo("/business?x=1")).toBe("/business?x=1");
    expect(sanitizeReturnTo("/trip/42#seat")).toBe("/trip/42#seat");
  });

  test("rejects protocol-relative and absolute URLs", () => {
    expect(sanitizeReturnTo("//evil.com")).toBe("/");
    expect(sanitizeReturnTo("//evil.com/path")).toBe("/");
    expect(sanitizeReturnTo("https://evil.com")).toBe("/");
    expect(sanitizeReturnTo("http://evil.com/business")).toBe("/");
  });

  test("rejects script and data URLs", () => {
    expect(sanitizeReturnTo("javascript:alert(1)")).toBe("/");
    expect(sanitizeReturnTo("data:text/html,<script>alert(1)</script>")).toBe("/");
    expect(sanitizeReturnTo("JavaScript:alert(1)")).toBe("/");
  });

  test("rejects empty and missing values", () => {
    expect(sanitizeReturnTo("")).toBe("/");
    expect(sanitizeReturnTo("   ")).toBe("/");
    expect(sanitizeReturnTo(null)).toBe("/");
    expect(sanitizeReturnTo(undefined)).toBe("/");
  });

  test("rejects backslash smuggling and control characters", () => {
    expect(sanitizeReturnTo("/\\evil.com")).toBe("/");
    expect(sanitizeReturnTo("/business\\..\\..")).toBe("/");
    expect(sanitizeReturnTo("/business\nSet-Cookie: x=1")).toBe("/");
  });

  test("rejects a value containing a scheme", () => {
    expect(sanitizeReturnTo("/redirect?to=https://evil.com")).toBe("/");
  });

  test("honours a custom fallback", () => {
    expect(sanitizeReturnTo(null, "/sign-in")).toBe("/sign-in");
    expect(sanitizeReturnTo("//evil.com", "/sign-in")).toBe("/sign-in");
  });

  test("an unsafe fallback degrades to the root", () => {
    expect(sanitizeReturnTo(null, "//evil.com")).toBe("/");
  });

  test("isSafePath is the single predicate the guard and the forms share", () => {
    expect(isSafePath("/admin")).toBe(true);
    expect(isSafePath("admin")).toBe(false);
    expect(isSafePath("//admin")).toBe(false);
  });
});
