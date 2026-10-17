import { randomUUID } from "node:crypto";

import { verifyAccessToken } from "@trips-app/domain";

import {
  cache,
  caches,
  db,
  disks,
  logger,
  notifications,
  queue,
  queues,
  storage,
} from "./services";
import type { AuthActor, CreateContextOptions, RpcContext } from "./types";

export type { Context, CreateContextOptions } from "./types";

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
    requestId,
    locale,
    ipAddress,
    userAgent,
    deviceFingerprint,
    idempotencyKey,
    auth,
  };
}
