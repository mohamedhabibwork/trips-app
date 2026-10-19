// Routes an auth event to email and SMS, renders it in the recipient's language and retries failures
// (WF-NTF-01, WF-NTF-06). The returned notifier never rejects.
import { maskContact } from "../model/mask";
import { renderAuthMessage } from "../model/templates";
import type {
  AuthNotificationEvent,
  AuthNotifier,
  DeliveryOutcome,
  NotificationChannel,
  NotificationRecipient,
  NotifyOptions,
} from "../types";
import type { EmailSender, SendResult, SmsSender } from "./senders";

export const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BACKOFF_BASE_MS = 250;

/** Alerts that also go to SMS when the recipient has a phone, because email may be the thing attacked. */
const SMS_ALSO_EVENTS: ReadonlySet<AuthNotificationEvent["type"]> = new Set([
  "new_device_sign_in",
  "password_changed",
  "contact_changed",
  "account_locked",
]);

export interface DispatcherLogger {
  warn(message: string, meta?: Record<string, unknown>): void;
}

export interface DispatcherDeps {
  email?: EmailSender;
  sms?: SmsSender;
  logger?: DispatcherLogger;
  sleep?: (ms: number) => Promise<void>;
  backoffBaseMs?: number;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function addressFor(
  recipient: NotificationRecipient,
  channel: NotificationChannel,
): string | undefined {
  const value = channel === "email" ? recipient.email : recipient.phone;
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function channelsFor(
  recipient: NotificationRecipient,
  event: AuthNotificationEvent,
): NotificationChannel[] {
  if (event.type === "otp") return [event.channel];
  const hasEmail = addressFor(recipient, "email") !== undefined;
  const hasPhone = addressFor(recipient, "sms") !== undefined;
  const channels: NotificationChannel[] = [];
  if (hasEmail) channels.push("email");
  if (hasPhone && (!hasEmail || SMS_ALSO_EVENTS.has(event.type))) channels.push("sms");
  return channels;
}

export function createAuthNotifier(deps: DispatcherDeps): AuthNotifier {
  const sleep = deps.sleep ?? defaultSleep;
  const backoffBase = deps.backoffBaseMs ?? DEFAULT_BACKOFF_BASE_MS;

  async function sendWithRetry(
    attempt: () => Promise<SendResult>,
    maxRetries: number,
  ): Promise<{ result: SendResult; attempts: number }> {
    let attempts = 0;
    let result: SendResult = { ok: false, provider: "unknown", retryable: false };
    while (attempts <= maxRetries) {
      attempts += 1;
      result = await attempt();
      if (result.ok || !result.retryable || attempts > maxRetries) break;
      await sleep(backoffBase * 2 ** (attempts - 1));
    }
    return { result, attempts };
  }

  async function deliver(
    channel: NotificationChannel,
    recipient: NotificationRecipient,
    event: AuthNotificationEvent,
    maxRetries: number,
  ): Promise<DeliveryOutcome> {
    const address = addressFor(recipient, channel);
    if (!address) return { channel, status: "skipped", attempts: 0, reason: "no_address" };

    const emailSender = deps.email;
    const smsSender = deps.sms;
    if ((channel === "email" && !emailSender) || (channel === "sms" && !smsSender)) {
      deps.logger?.warn("Notification skipped: channel not configured", {
        event: event.type,
        channel,
        to: maskContact(address),
      });
      return { channel, status: "skipped", attempts: 0, reason: "provider_not_configured" };
    }

    const rendered = renderAuthMessage(event, {
      locale: recipient.locale,
      recipientName: recipient.name,
    });

    let attempt: () => Promise<SendResult>;
    if (channel === "email" && emailSender) {
      attempt = () =>
        emailSender({
          to: address,
          subject: rendered.subject,
          text: rendered.text,
          html: rendered.html,
        });
    } else if (smsSender && rendered.sms) {
      const body = rendered.sms;
      attempt = () => smsSender({ to: address, body });
    } else {
      return { channel, status: "skipped", attempts: 0, reason: "email_only" };
    }

    const { result, attempts } = await sendWithRetry(attempt, maxRetries);
    if (result.ok) return { channel, status: "sent", provider: result.provider, attempts };

    // The message body and code are never logged.
    deps.logger?.warn("Notification delivery failed", {
      event: event.type,
      channel,
      attempts,
      reason: result.reason,
      to: maskContact(address),
    });
    return {
      channel,
      status: "failed",
      provider: result.provider,
      attempts,
      reason: result.reason,
    };
  }

  return {
    async notify(
      recipient: NotificationRecipient,
      event: AuthNotificationEvent,
      options: NotifyOptions = {},
    ) {
      const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
      const channels = channelsFor(recipient, event);
      return Promise.all(
        channels.map(async (channel): Promise<DeliveryOutcome> => {
          try {
            return await deliver(channel, recipient, event, maxRetries);
          } catch (error) {
            deps.logger?.warn("Notification dispatch crashed", {
              event: event.type,
              channel,
              reason: error instanceof Error ? error.message : "unknown",
            });
            return { channel, status: "failed", attempts: 0, reason: "dispatch_error" };
          }
        }),
      );
    },
  };
}
