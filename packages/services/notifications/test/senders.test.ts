import { describe, expect, test } from "bun:test";

import { createEmailSender, createTwilioSmsSender } from "../src/services";

const MESSAGE = {
  to: "ada@trips-enjoy.com",
  subject: "Subject",
  text: "Plain body",
  html: "<p>Html body</p>",
};

describe("createEmailSender", () => {
  test("returns undefined when the email provider is not configured", () => {
    const source = { provider: async () => ({}) };

    expect(createEmailSender(source, ["fcm"])).toBeUndefined();
    expect(createEmailSender(undefined, ["email"])).toBeUndefined();
  });

  test("maps the message onto notifykit's subject, text and html fields", async () => {
    // Arrange
    const sent: unknown[] = [];
    const source = {
      provider: async (name: string) => {
        expect(name).toBe("email");
        return {
          send: async (message: unknown) => {
            sent.push(message);
            return { ok: true, status: "accepted" };
          },
        };
      },
    };
    const sender = createEmailSender(source, ["email"]);

    // Act
    const result = await sender?.(MESSAGE);

    // Assert
    expect(result).toMatchObject({ ok: true, provider: "email" });
    expect(sent[0]).toEqual({
      to: "ada@trips-enjoy.com",
      notification: { title: "Subject", body: "Plain body" },
      native: { html: "<p>Html body</p>", text: "Plain body" },
    });
  });

  test("reports a thrown provider error as a retryable failure instead of rejecting", async () => {
    const source = {
      provider: async () => {
        throw new Error("smtp down");
      },
    };

    const result = await createEmailSender(source, ["email"])?.(MESSAGE);

    expect(result).toMatchObject({ ok: false, retryable: true, reason: "smtp down" });
  });

  test("does not retry when the provider marks the error as permanent", async () => {
    const source = {
      provider: async () => ({
        send: async () => {
          throw Object.assign(new Error("bad recipient"), { retryable: false });
        },
      }),
    };

    const result = await createEmailSender(source, ["email"])?.(MESSAGE);

    expect(result).toMatchObject({ ok: false, retryable: false });
  });
});

describe("createTwilioSmsSender", () => {
  const SETTINGS = { accountSid: "AC123", authToken: "secret", from: "+15005550006" };

  test("returns undefined without credentials", () => {
    expect(createTwilioSmsSender(undefined)).toBeUndefined();
  });

  test("posts a form-encoded message with basic auth to the Messages endpoint", async () => {
    // Arrange
    let captured: { url: string; init: RequestInit } | undefined;
    const sender = createTwilioSmsSender(SETTINGS, async (url, init) => {
      captured = { url, init };
      return new Response("{}", { status: 201 });
    });

    // Act
    const result = await sender?.({ to: "+201000000000", body: "Trips: 123456" });

    // Assert
    expect(result).toMatchObject({ ok: true, provider: "sms" });
    expect(captured?.url).toBe("https://api.twilio.com/2010-04-01/Accounts/AC123/Messages.json");
    const headers = captured?.init.headers as Record<string, string>;
    expect(headers.authorization).toBe(`Basic ${btoa("AC123:secret")}`);
    const body = captured?.init.body as URLSearchParams;
    expect(body.get("To")).toBe("+201000000000");
    expect(body.get("From")).toBe("+15005550006");
    expect(body.get("Body")).toBe("Trips: 123456");
  });

  test("honours a custom base url without a trailing slash", async () => {
    let url = "";
    const sender = createTwilioSmsSender(
      { ...SETTINGS, baseUrl: "https://sms.local/" },
      async (target) => {
        url = target;
        return new Response("{}", { status: 201 });
      },
    );

    await sender?.({ to: "+201000000000", body: "x" });

    expect(url).toBe("https://sms.local/2010-04-01/Accounts/AC123/Messages.json");
  });

  test("treats 5xx and 429 as retryable and 4xx as permanent", async () => {
    const respond = (status: number) =>
      createTwilioSmsSender(
        SETTINGS,
        async () => new Response("{}", { status }),
      )?.({
        to: "+201000000000",
        body: "x",
      });

    expect(await respond(503)).toMatchObject({ ok: false, retryable: true });
    expect(await respond(429)).toMatchObject({ ok: false, retryable: true });
    expect(await respond(400)).toMatchObject({ ok: false, retryable: false });
  });

  test("reports a network error as a retryable failure", async () => {
    const sender = createTwilioSmsSender(SETTINGS, async () => {
      throw new Error("ECONNRESET");
    });

    const result = await sender?.({ to: "+201000000000", body: "x" });

    expect(result).toMatchObject({ ok: false, retryable: true, reason: "ECONNRESET" });
  });
});
