import { randomUUID } from "node:crypto";

import { verifyAccessToken } from "@trips-app/domain";
import type { NotificationSettings } from "@trips-app/rpc";

import {
  cache,
  caches,
  db,
  disks,
  getKitsHealth,
  logger,
  notifications,
  queue,
  queues,
  storage,
} from "./services";
import { ENV } from "./env.server";
import type { AuthActor, CreateContextOptions, RpcContext } from "./types";

export type { Context, CreateContextOptions } from "./types";

function buildNotificationSettings(): NotificationSettings {
  // Dry run means nothing leaves the machine: advertise no providers so every channel is skipped.
  const dryRun = Boolean(ENV.NOTIFY_DRY_RUN);
  const hasSms = !dryRun && ENV.SMS_ACCOUNT_SID && ENV.SMS_AUTH_TOKEN && ENV.SMS_FROM;
  return {
    providers: dryRun ? [] : getKitsHealth().notifications.configuredProviders,
    webBaseUrl: ENV.WEB_APP_URL,
    sms: hasSms
      ? {
          accountSid: ENV.SMS_ACCOUNT_SID as string,
          authToken: ENV.SMS_AUTH_TOKEN as string,
          from: ENV.SMS_FROM as string,
          baseUrl: ENV.SMS_BASE_URL || undefined,
        }
      : undefined,
  };
}

export async function createContext(options: CreateContextOptions): Promise<RpcContext> {
  const headers = options.context.request.headers;
  const authHeader = headers.get("authorization");
  let auth: AuthActor | null = null;

  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    const claims = verifyAccessToken(token);
    if (claims) {
      auth = {
        accountId: claims.sub,
        sessionId: claims.sid,
        activeRole: claims.role,
        adminSubRole: claims.adminSubRole ?? null,
        activeTenantId: claims.tenantId ?? null,
        planTier: claims.planTier ?? null,
        permissions: claims.permissions ?? null,
        moderatorVehicleId: claims.moderatorVehicleId ?? null,
        moderatorTripId: claims.moderatorTripId ?? null,
      };
    }
  }

  const acceptLanguage = headers.get("accept-language") ?? "ar";
  const locale = acceptLanguage.toLowerCase().startsWith("en") ? "en" : "ar";
  const requestId = headers.get("x-request-id") ?? randomUUID();
  const idempotencyKey = headers.get("idempotency-key");
  const ipAddress =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "127.0.0.1";
  const userAgent = headers.get("user-agent") ?? "unknown";
  const deviceFingerprint = headers.get("x-device-fingerprint") ?? "default-device";

  const requestLogger = logger.child("request", {
    requestId,
    locale,
    ...(auth
      ? {
          accountId: auth.accountId,
          activeRole: auth.activeRole,
          activeTenantId: auth.activeTenantId,
        }
      : {}),
  });

  return {
    db,
    logger: requestLogger,
    cache,
    caches,
    queue,
    queues,
    storage,
    disks,
    notifications,
    notificationSettings: buildNotificationSettings(),
    requestId,
    locale,
    ipAddress,
    userAgent,
    deviceFingerprint,
    idempotencyKey,
    auth,
  };
}
