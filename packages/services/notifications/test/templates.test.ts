import { describe, expect, test } from "bun:test";

import { maskContact, renderAuthMessage } from "../src/model";
import type { AuthNotificationEvent } from "../src/types";

const OTP: AuthNotificationEvent = {
  type: "otp",
  purpose: "sign_in",
  channel: "email",
  code: "123456",
  expiresInMinutes: 10,
};

describe("renderAuthMessage", () => {
  test("renders the OTP code in the subject, text and html for English", () => {
    // Act
    const message = renderAuthMessage(OTP, { locale: "en" });

    // Assert
    expect(message.subject).toContain("123456");
    expect(message.text).toContain("123456");
    expect(message.html).toContain("123456");
    expect(message.html).toContain('dir="ltr"');
    expect(message.sms).toContain("123456");
  });

  test("renders right-to-left Arabic html for the ar locale", () => {
    const message = renderAuthMessage(OTP, { locale: "ar" });

    expect(message.html).toContain('lang="ar" dir="rtl"');
    expect(message.subject).toContain("رمز التحقق");
  });

  test("falls back to English when the locale is missing", () => {
    const message = renderAuthMessage(OTP);

    expect(message.subject).toContain("verification code");
  });

  test("escapes html in values that come from users", () => {
    const message = renderAuthMessage(
      { type: "account_suspended", reason: '<script>alert("x")</script>' },
      { locale: "en" },
    );

    expect(message.html).not.toContain("<script>");
    expect(message.html).toContain("&lt;script&gt;");
  });

  test("greets an invitee by name and falls back when the name is blank", () => {
    const event: AuthNotificationEvent = {
      type: "employee_invite",
      organizationName: "Nile Horizon",
      roleTitle: "Coordinator",
      inviteUrl: "https://app.example.com/invite?token=abc",
      expiresInDays: 7,
    };

    expect(renderAuthMessage(event, { recipientName: "Ada" }).html).toContain("Hello Ada");
    expect(renderAuthMessage(event, { recipientName: "  " }).html).toContain("Hello there");
  });

  test("renders a button only for http(s) links", () => {
    const event = (inviteUrl: string): AuthNotificationEvent => ({
      type: "admin_invite",
      subRole: "operations",
      inviteUrl,
      expiresInHours: 48,
    });

    const safe = renderAuthMessage(event("https://app.example.com/accept?token=abc"));
    const unsafe = renderAuthMessage(event("javascript:alert(1)"));

    expect(safe.html).toContain('href="https://app.example.com/accept?token=abc"');
    expect(unsafe.html).not.toContain("href=");
  });

  test("returns no SMS body for email-only events", () => {
    expect(renderAuthMessage({ type: "totp_reset" }).sms).toBeNull();
    expect(
      renderAuthMessage({
        type: "admin_invite",
        subRole: "operations",
        inviteUrl: "https://x.test",
        expiresInHours: 1,
      }).sms,
    ).toBeNull();
  });

  test("keeps SMS bodies within 160 characters", () => {
    const events: AuthNotificationEvent[] = [
      OTP,
      { type: "password_changed" },
      { type: "account_locked", lockedUntil: "2026-10-18T10:15:00Z" },
      { type: "account_suspended", reason: "fraud" },
    ];
    for (const event of events) {
      for (const locale of ["en", "ar"] as const) {
        const sms = renderAuthMessage(event, { locale }).sms;
        expect(sms).not.toBeNull();
        expect((sms as string).length).toBeLessThanOrEqual(160);
      }
    }
  });
});

describe("maskContact", () => {
  test("masks an email address but keeps the domain", () => {
    expect(maskContact("ada@example.com")).toBe("a***@example.com");
  });

  test("keeps only the last four digits of a phone number", () => {
    expect(maskContact("+201000000000")).toBe("***0000");
  });

  test("hides very short values completely", () => {
    expect(maskContact("123")).toBe("***");
  });
});
