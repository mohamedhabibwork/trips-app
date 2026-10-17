// Shared TypeScript interfaces and types for @trips-app/rpc.
import type { Cache, CacheConfig, CacheManager } from "@mohamedhabibwork/cachekit";
import type { Logger } from "@mohamedhabibwork/loggerkit";
import type { BuiltInNotificationConfig, NotificationManager } from "@mohamedhabibwork/notifykit";
import type {
  BuiltInQueueConfig,
  createQueueManager,
  QueueProvider,
} from "@mohamedhabibwork/queuekit";
import type { Storage, StorageConfig, StorageManager } from "@mohamedhabibwork/storagekit";
import type { Database } from "@trips-app/db";
import type {
  AdminSubRole,
  ApiErrorFieldDetail,
  ApiErrorPayload,
  ApiErrorResponse,
  ApiPaginationMeta,
  ApiResponse,
  ApiResponseMeta,
  ApiSuccessResponse,
  CreateErrorResponseInput,
  CreateSuccessResponseOptions,
  ErrorCategory,
  ErrorHttpStatus,
  OrgPermissionArea,
  OrgPermissionMatrix,
  ServiceErrorOptions,
  SHARED_ERROR_CATALOG,
  SharedErrorCode,
  SharedErrorDefinition,
  SupportedLocale,
  UserRole,
} from "@trips-app/domain";

export type QueueManager<
  TProviders extends Record<string, BuiltInQueueConfig> = Record<string, BuiltInQueueConfig>,
> = ReturnType<typeof createQueueManager<TProviders>>;

export type AppCacheConfigMap = {
  readonly default: CacheConfig;
  readonly catalog: CacheConfig;
  readonly sessions: CacheConfig;
  readonly idempotency: CacheConfig;
  readonly seatHolds: CacheConfig;
};

export type AppQueueConfigMap = {
  readonly jobs: BuiltInQueueConfig;
  readonly events: BuiltInQueueConfig;
  readonly notifications: BuiltInQueueConfig;
};

export type AppStorageConfigMap = {
  readonly uploads: StorageConfig;
  readonly documents: StorageConfig;
  readonly temp: StorageConfig;
};

export type {
  AdminSubRole,
  ApiErrorFieldDetail,
  ApiErrorPayload,
  ApiErrorResponse,
  ApiPaginationMeta,
  ApiResponse,
  ApiResponseMeta,
  ApiSuccessResponse,
  BuiltInNotificationConfig,
  BuiltInQueueConfig,
  Cache,
  CacheConfig,
  CacheManager,
  CreateErrorResponseInput,
  CreateSuccessResponseOptions,
  ErrorCategory,
  ErrorHttpStatus,
  Logger,
  NotificationManager,
  OrgPermissionArea,
  OrgPermissionMatrix,
  QueueProvider,
  ServiceErrorOptions,
  SharedErrorCode,
  SharedErrorDefinition,
  Storage,
  StorageConfig,
  StorageManager,
  SupportedLocale,
  UserRole,
};

export interface AuthActor {
  accountId: string;
  sessionId: string;
  activeRole: UserRole;
  adminSubRole?: AdminSubRole | null;
  activeTenantId?: string | null;
  planTier?: string | null;
  permissions?: Partial<OrgPermissionMatrix> | null;
  moderatorVehicleId?: string | null;
  moderatorTripId?: string | null;
}

// Procedure context shared by every router. Routes read db, auth, and kits from here and pass them to services.
export type Context = {
  db: Database;
  logger?: Logger;
  cache?: Cache;
  caches?: CacheManager<AppCacheConfigMap>;
  queue?: QueueProvider;
  queues?: QueueManager<AppQueueConfigMap>;
  storage?: Storage;
  disks?: StorageManager<AppStorageConfigMap>;
  notifications?: NotificationManager<
    Record<string, BuiltInNotificationConfig>,
    string | undefined
  >;
  requestId?: string;
  locale?: SupportedLocale;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  idempotencyKey?: string | null;
  auth?: AuthActor | null;
};

/**
 * Shared oRPC error map built from the central `SHARED_ERROR_CATALOG`.
 */
export type SharedORPCErrorDefMap = {
  [K in SharedErrorCode]: {
    status: (typeof SHARED_ERROR_CATALOG)[K]["status"];
    message: string;
  };
};
