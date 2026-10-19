// Channel senders: email through notifykit's SMTP provider, SMS through a Twilio-compatible gateway.
// Each sender reports a result and never throws for a provider fault.
import type { SmsGatewaySettings } from "../types";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface SmsMessage {
  to: string;
  body: string;
}

export interface SendResult {
  ok: boolean;
  provider: string;
  /** True when trying again can help (timeouts, 5xx, rate limits). */
  retryable: boolean;
  reason?: string;
}

export type EmailSender = (message: EmailMessage) => Promise<SendResult>;
export type SmsSender = (message: SmsMessage) => Promise<SendResult>;

const SEND_TIMEOUT_MS = 10_000;
const HTTP_SERVER_ERROR = 500;
const HTTP_TOO_MANY_REQUESTS = 429;
const DEFAULT_SMS_BASE_URL = "https://api.twilio.com";

/** The slice of a notifykit email notifier this module uses. */
interface EmailTransport {
  send(
    message: {
      to: string;
      notification: { title: string; body: string };
      native: { html: string; text: string };
    },
    options?: { timeout?: number },
  ): Promise<{ ok: boolean; retryable?: boolean; status: string }>;
}

/** The slice of the notifykit manager this module uses. */
export interface EmailTransportSource {
  provider(name: string): Promise<unknown>;
}

function describeError(error: unknown): { retryable: boolean; reason: string } {
  const reason = error instanceof Error ? error.message : "unknown error";
  const retryable = (error as { retryable?: unknown } | null)?.retryable;
  return { retryable: retryable !== false, reason };
}

/** Returns undefined when no `email` provider is configured, so callers can report `skipped`. */
export function createEmailSender(
  source: EmailTransportSource | undefined,
  providers: readonly string[],
): EmailSender | undefined {
  if (!source || !providers.includes("email")) return undefined;
  return async (message) => {
    try {
      const transport = (await source.provider("email")) as EmailTransport;
      const result = await transport.send(
        {
          to: message.to,
          notification: { title: message.subject, body: message.text },
          native: { html: message.html, text: message.text },
        },
        { timeout: SEND_TIMEOUT_MS },
      );
      return {
        ok: result.ok,
        provider: "email",
        retryable: result.retryable ?? !result.ok,
        reason: result.ok ? undefined : result.status,
      };
    } catch (error) {
      return { ok: false, provider: "email", ...describeError(error) };
    }
  };
}

export interface HttpFetch {
  (input: string, init: RequestInit): Promise<Response>;
}

/** Twilio Messages API. Returns undefined when credentials are absent. */
export function createTwilioSmsSender(
  sms: SmsGatewaySettings | undefined,
  fetchImpl: HttpFetch = fetch,
): SmsSender | undefined {
  if (!sms) return undefined;
  const base = (sms.baseUrl ?? DEFAULT_SMS_BASE_URL).replace(/\/$/, "");
  const url = `${base}/2010-04-01/Accounts/${encodeURIComponent(sms.accountSid)}/Messages.json`;
  const authorization = `Basic ${btoa(`${sms.accountSid}:${sms.authToken}`)}`;
  return async (message) => {
    try {
      const response = await fetchImpl(url, {
        method: "POST",
        headers: {
          authorization,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: message.to, From: sms.from, Body: message.body }),
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      });
      if (response.ok) return { ok: true, provider: "sms", retryable: false };
      return {
        ok: false,
        provider: "sms",
        retryable:
          response.status >= HTTP_SERVER_ERROR || response.status === HTTP_TOO_MANY_REQUESTS,
        reason: `gateway status ${response.status}`,
      };
    } catch (error) {
      return { ok: false, provider: "sms", ...describeError(error) };
    }
  };
}
