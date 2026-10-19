// Builds the auth notifier from a request context. Lives in `routes` because only this layer may
// read the shared @trips-app/rpc Context.
import type { Context } from "@trips-app/rpc";

import { createAuthNotifier, createEmailSender, createTwilioSmsSender } from "../services";
import type { AuthNotifier } from "../types";

export type NotifierContext = Pick<Context, "notifications" | "notificationSettings" | "logger">;

/** A context with no providers yields a notifier that reports every channel as skipped. */
export function createAuthNotifierFromContext(context: NotifierContext): AuthNotifier {
  const settings = context.notificationSettings;
  const logger = context.logger;
  return createAuthNotifier({
    email: createEmailSender(context.notifications, settings?.providers ?? []),
    sms: createTwilioSmsSender(settings?.sms),
    logger: logger ? { warn: (message, meta) => logger.warn(message, meta) } : undefined,
  });
}

/** Public web origin for links in messages. Falls back to the local dev web app. */
export function webBaseUrlFromContext(context: Pick<Context, "notificationSettings">): string {
  return (context.notificationSettings?.webBaseUrl ?? "http://localhost:3001").replace(/\/$/, "");
}
