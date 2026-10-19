import { describe, expect, test } from "bun:test";

import { createAuthNotifier } from "../src/services";
import type { EmailMessage, SendResult, SmsMessage } from "../src/services";
import type { AuthNotificationEvent } from "../src/types";

const OK: SendResult = { ok: true, provider: "test", retryable: false };
const RETRYABLE_FAILURE: SendResult = {
  ok: false,
  provider: "test",
  retryable: true,
  reason: "timeout",
};
const PERMANENT_FAILURE: SendResult = {
  ok: false,
  provider: "test",
  retryable: false,
  reason: "rejected",
};

const RECIPIENT = {
  email: "ada@example.com",
  phone: "+201000000000",
  name: "Ada",
  locale: "en" as const,
};

const OTP_EMAIL: AuthNotificationEvent = {
  type: "otp",
  purpose: "registration",
  channel: "email",
  code: "123456",
  expiresInMinutes: 10,
};

function recorder(results: SendResult[] = [OK]) {
  const emails: EmailMessage[] = [];
  const smses: SmsMessage[] = [];
  const queue = [...results];
  const next = () => queue.shift() ?? results[results.length - 1] ?? OK;
  return {
    emails,
    smses,
    email: async (message: EmailMessage) => {
      emails.push(message);
      return next();
    },
    sms: async (message: SmsMessage) => {
      smses.push(message);
      return next();
    },
  };
}

const noSleep = async () => {};

describe("createAuthNotifier", () => {
  test("sends an OTP only on the channel the event names", async () => {
    // Arrange
    const sink = recorder();
    const notifier = createAuthNotifier({ email: sink.email, sms: sink.sms, sleep: noSleep });

    // Act
    const outcomes = await notifier.notify(RECIPIENT, OTP_EMAIL);

    // Assert
    expect(outcomes).toEqual([{ channel: "email", status: "sent", provider: "test", attempts: 1 }]);
    expect(sink.emails).toHaveLength(1);
    expect(sink.emails[0]?.to).toBe("ada@example.com");
    expect(sink.emails[0]?.text).toContain("123456");
    expect(sink.smses).toHaveLength(0);
  });

  test("renders in the recipient's language", async () => {
    const sink = recorder();
    const notifier = createAuthNotifier({ email: sink.email, sleep: noSleep });

    await notifier.notify({ ...RECIPIENT, locale: "ar" }, OTP_EMAIL);

    expect(sink.emails[0]?.html).toContain('dir="rtl"');
  });

  test("sends a security alert to email and SMS when both exist", async () => {
    const sink = recorder();
    const notifier = createAuthNotifier({ email: sink.email, sms: sink.sms, sleep: noSleep });

    const outcomes = await notifier.notify(RECIPIENT, { type: "password_changed" });

    expect(outcomes.map((o) => o.channel).sort()).toEqual(["email", "sms"]);
    expect(sink.smses).toHaveLength(1);
  });

  test("sends a non-security notice to email only when an email exists", async () => {
    const sink = recorder();
    const notifier = createAuthNotifier({ email: sink.email, sms: sink.sms, sleep: noSleep });

    await notifier.notify(RECIPIENT, { type: "account_reinstated" });

    expect(sink.emails).toHaveLength(1);
    expect(sink.smses).toHaveLength(0);
  });

  test("falls back to SMS for a non-security notice when there is no email", async () => {
    const sink = recorder();
    const notifier = createAuthNotifier({ email: sink.email, sms: sink.sms, sleep: noSleep });

    await notifier.notify({ phone: "+201000000000" }, { type: "account_reinstated" });

    expect(sink.emails).toHaveLength(0);
    expect(sink.smses).toHaveLength(1);
  });

  test("skips with provider_not_configured when no sender is wired", async () => {
    const notifier = createAuthNotifier({ sleep: noSleep });

    const outcomes = await notifier.notify(RECIPIENT, OTP_EMAIL);

    expect(outcomes).toEqual([
      { channel: "email", status: "skipped", attempts: 0, reason: "provider_not_configured" },
    ]);
  });

  test("skips with no_address when the OTP channel has no address", async () => {
    const sink = recorder();
    const notifier = createAuthNotifier({ email: sink.email, sleep: noSleep });

    const outcomes = await notifier.notify({ phone: "+201000000000" }, OTP_EMAIL);

    expect(outcomes[0]).toMatchObject({ status: "skipped", reason: "no_address" });
    expect(sink.emails).toHaveLength(0);
  });

  test("skips an email-only event on the SMS channel", async () => {
    const sink = recorder();
    const notifier = createAuthNotifier({ sms: sink.sms, sleep: noSleep });

    const outcomes = await notifier.notify({ phone: "+201000000000" }, { type: "totp_reset" });

    expect(outcomes[0]).toMatchObject({ channel: "sms", status: "skipped", reason: "email_only" });
  });

  test("retries a retryable failure with exponential backoff and then succeeds", async () => {
    const sink = recorder([RETRYABLE_FAILURE, RETRYABLE_FAILURE, OK]);
    const delays: number[] = [];
    const notifier = createAuthNotifier({
      email: sink.email,
      backoffBaseMs: 100,
      sleep: async (ms) => {
        delays.push(ms);
      },
    });

    const outcomes = await notifier.notify(RECIPIENT, OTP_EMAIL);

    expect(outcomes[0]).toMatchObject({ status: "sent", attempts: 3 });
    expect(delays).toEqual([100, 200]);
  });

  test("stops after maxRetries and reports failed", async () => {
    const sink = recorder([RETRYABLE_FAILURE]);
    const notifier = createAuthNotifier({ email: sink.email, sleep: noSleep });

    const outcomes = await notifier.notify(RECIPIENT, OTP_EMAIL, { maxRetries: 2 });

    expect(outcomes[0]).toMatchObject({ status: "failed", attempts: 3, reason: "timeout" });
    expect(sink.emails).toHaveLength(3);
  });

  test("does not retry a permanent failure", async () => {
    const sink = recorder([PERMANENT_FAILURE]);
    const notifier = createAuthNotifier({ email: sink.email, sleep: noSleep });

    const outcomes = await notifier.notify(RECIPIENT, OTP_EMAIL);

    expect(outcomes[0]).toMatchObject({ status: "failed", attempts: 1 });
  });

  test("never rejects when a sender throws", async () => {
    const notifier = createAuthNotifier({
      email: async () => {
        throw new Error("boom");
      },
      sleep: noSleep,
    });

    const outcomes = await notifier.notify(RECIPIENT, OTP_EMAIL);

    expect(outcomes[0]).toMatchObject({ status: "failed", reason: "dispatch_error" });
  });

  test("never writes the code or the full address to the log", async () => {
    const logged: string[] = [];
    const sink = recorder([PERMANENT_FAILURE]);
    const notifier = createAuthNotifier({
      email: sink.email,
      sleep: noSleep,
      logger: { warn: (message, meta) => logged.push(JSON.stringify({ message, meta })) },
    });

    await notifier.notify(RECIPIENT, OTP_EMAIL);

    const output = logged.join("\n");
    expect(output).toContain("Notification delivery failed");
    expect(output).not.toContain("123456");
    expect(output).not.toContain("ada@example.com");
    expect(output).toContain("a***@example.com");
  });
});
