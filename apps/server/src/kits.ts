import { resolve } from "node:path";

import {
  addIfAbsent,
  type Cache,
  type CacheConfig,
  type CacheManager,
  createCache,
  createCacheManager,
  createLayeredCache,
  decrement,
  increment,
  memoize,
  namespaced,
  pull,
} from "@mohamedhabibwork/cachekit";
import {
  createConsoleSink,
  createLogger,
  DEFAULT_REDACT_KEYS,
  FileSink,
  HttpSink,
  jsonFormatter,
  type Logger,
  type LogLevel,
  prettyFormatter,
  redact,
  type Sink,
} from "@mohamedhabibwork/loggerkit";
import { elysiaLogger } from "@mohamedhabibwork/loggerkit/adapters/elysia";
import { createLogContext } from "@mohamedhabibwork/loggerkit/context";
import {
  type BuiltInNotificationConfig,
  createNotificationManager,
  createNotificationRouter,
  createNotificationTemplates,
  createNotifier,
  createPreferenceFilter,
  dedupeMiddleware,
  dryRunMiddleware,
  type NotificationManager,
  type NotificationMessage,
  type NotificationMiddleware,
  type NotificationResult,
  Notifier,
  rateLimitMiddleware,
  retryMiddleware,
  sendWithFallback,
} from "@mohamedhabibwork/notifykit";
import { defineNotificationProvider } from "@mohamedhabibwork/notifykit/custom";
import { createFakeNotifier } from "@mohamedhabibwork/notifykit/testing";
import {
  type BuiltInQueueConfig,
  createMemoryIdempotencyStore,
  createQueue,
  createQueueManager,
  createTypedQueue,
  gracefulShutdown,
  type QueueProvider,
  scheduleRecurring,
  withIdempotency,
  withRetry,
  withTimeout,
} from "@mohamedhabibwork/queuekit";

export type QueueManager<
  TProviders extends Record<string, BuiltInQueueConfig> = Record<string, BuiltInQueueConfig>,
> = ReturnType<typeof createQueueManager<TProviders>>;
import {
  copyBetween,
  createStorage,
  createStorageManager,
  defineUploadIntent,
  saveUpload,
  saveUploadIntent,
  saveWebFile,
  scopedStorage,
  type Storage,
  type StorageConfig,
  type StorageManager,
} from "@mohamedhabibwork/storagekit";

import { ENV } from "./env.server";

// ============================================================================
// 1. Logger (@mohamedhabibwork/loggerkit)
// ============================================================================

export interface RequestLogContext extends Record<string, unknown> {
  requestId?: string;
  locale?: string;
  accountId?: string;
  tenantId?: string | null;
  role?: string;
}

export const logContext = createLogContext();

function buildLoggerSinks(): Sink[] {
  const formatter = ENV.LOG_FORMAT === "json" ? jsonFormatter() : prettyFormatter();
  const sinks: Sink[] = [createConsoleSink({ formatter })];

  if (ENV.LOG_FILE_PATH) {
    sinks.push(
      new FileSink({
        filePath: ENV.LOG_FILE_PATH,
        maxBytes: ENV.LOG_FILE_MAX_BYTES ?? 10 * 1024 * 1024,
        formatter: jsonFormatter(),
      }),
    );
  }

  if (ENV.LOG_HTTP_SINK_URL) {
    sinks.push(
      new HttpSink({
        url: ENV.LOG_HTTP_SINK_URL,
      }),
    );
  }

  return sinks;
}

export const logger: Logger = createLogger({
  name: "trips-app-server",
  level: (ENV.LOG_LEVEL ?? (ENV.NODE_ENV === "test" ? "warn" : "info")) as LogLevel,
  formatter: ENV.LOG_FORMAT === "json" ? jsonFormatter() : prettyFormatter(),
  sinks: buildLoggerSinks(),
  processors: [
    redact({
      keys: [
        ...DEFAULT_REDACT_KEYS,
        "authorization",
        "password",
        "pass",
        "token",
        "accessToken",
        "refreshToken",
        "secret",
        "privateKey",
        "cvv",
        "cardNumber",
      ],
    }),
  ],
  contextProvider: () => logContext.get(),
});

// ============================================================================
// 2. Cache (@mohamedhabibwork/cachekit)
// ============================================================================

export function buildCacheConfig(
  namespaceSuffix?: string,
  defaultTtlSeconds = ENV.CACHE_DEFAULT_TTL ?? 300,
): CacheConfig {
  const baseNamespace = ENV.CACHE_NAMESPACE ?? "trips:";
  const namespace = namespaceSuffix ? `${baseNamespace}${namespaceSuffix}:` : baseNamespace;
  const driver = ENV.CACHE_DRIVER ?? "memory";
  const defaultTtl = `${defaultTtlSeconds}s` as const;

  if (driver === "memory") {
    return {
      type: "memory",
      namespace,
      defaultTtl,
      maxEntries: 10_000,
    };
  }

  return {
    type: driver,
    url: ENV.REDIS_URL ?? "redis://localhost:6379",
    namespace,
    defaultTtl,
  };
}

export const caches = createCacheManager({
  default: "default",
  logger: logger.child("cachekit"),
  caches: {
    default: buildCacheConfig(undefined, ENV.CACHE_DEFAULT_TTL ?? 300),
    catalog: buildCacheConfig("catalog", ENV.CACHE_DEFAULT_TTL ?? 300),
    sessions: buildCacheConfig("sessions", ENV.CACHE_SESSION_TTL ?? 86_400),
    idempotency: buildCacheConfig("idempotency", ENV.CACHE_IDEMPOTENCY_TTL ?? 86_400),
    seatHolds: buildCacheConfig("seat-holds", ENV.CACHE_SEAT_HOLD_TTL ?? 600),
  },
});

export const cache: Cache = await caches.default();

// ============================================================================
// 3. Queue (@mohamedhabibwork/queuekit)
// ============================================================================

export function buildQueueConfig(streamSuffix?: string): BuiltInQueueConfig {
  const basePrefix = ENV.QUEUE_PREFIX ?? "trips";
  const prefix = streamSuffix ? `${basePrefix}:${streamSuffix}` : basePrefix;
  const driver = ENV.QUEUE_DRIVER ?? "memory";
  const redisUrl = ENV.REDIS_URL ?? "redis://localhost:6379";

  switch (driver) {
    case "bullmq":
      return {
        type: "bullmq",
        connection: redisUrl,
        prefix,
      };
    case "redis":
      return {
        type: "redis",
        url: redisUrl,
        mode: ENV.QUEUE_REDIS_MODE ?? "streams",
        group: ENV.QUEUE_REDIS_GROUP ?? "trips-workers",
        consumer: ENV.QUEUE_REDIS_CONSUMER ?? "trips-server-1",
      };
    case "kafka": {
      const brokers = (ENV.QUEUE_KAFKA_BROKERS ?? "localhost:9092")
        .split(",")
        .map((broker) => broker.trim())
        .filter(Boolean);
      return {
        type: "kafka",
        brokers,
        clientId: ENV.QUEUE_KAFKA_CLIENT_ID ?? "trips-app",
        ssl: ENV.QUEUE_KAFKA_SSL ?? false,
      };
    }
    case "rabbitmq":
      return {
        type: "rabbitmq",
        url: ENV.QUEUE_RABBITMQ_URL ?? "amqp://localhost:5672",
      };
    case "nats": {
      const servers = (ENV.QUEUE_NATS_SERVERS ?? "nats://localhost:4222")
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean);
      return {
        type: "nats",
        servers,
        mode: ENV.QUEUE_NATS_MODE ?? "jetstream",
      };
    }
    case "sqs":
      return {
        type: "sqs",
        region: ENV.QUEUE_SQS_REGION ?? "me-central-1",
        queueUrl: ENV.QUEUE_SQS_QUEUE_URL || undefined,
        endpoint: ENV.QUEUE_SQS_ENDPOINT || undefined,
      };
    case "memory":
    default:
      return {
        type: "memory",
      };
  }
}

export const queues = createQueueManager({
  default: "jobs",
  logger: logger.child("queuekit"),
  providers: {
    jobs: buildQueueConfig("jobs"),
    events: buildQueueConfig("events"),
    notifications: buildQueueConfig("notifications"),
  },
});

export const queue: QueueProvider = await queues.default();

// ============================================================================
// 4. Storage (@mohamedhabibwork/storagekit)
// ============================================================================

export function buildStorageConfig(options?: { subdir?: string; bucket?: string }): StorageConfig {
  const driver = ENV.STORAGE_DRIVER ?? "local";
  const bucket = options?.bucket ?? ENV.STORAGE_BUCKET ?? "trips-media";
  const prefix = options?.subdir
    ? `${ENV.STORAGE_PREFIX ?? "trips"}/${options.subdir}`
    : (ENV.STORAGE_PREFIX ?? "trips");
  const publicUrlBase = ENV.STORAGE_PUBLIC_URL_BASE ?? "http://localhost:3000/uploads";
  const credentials =
    ENV.STORAGE_ACCESS_KEY_ID && ENV.STORAGE_SECRET_ACCESS_KEY
      ? {
          accessKeyId: ENV.STORAGE_ACCESS_KEY_ID,
          secretAccessKey: ENV.STORAGE_SECRET_ACCESS_KEY,
        }
      : undefined;

  switch (driver) {
    case "s3":
      return {
        type: "s3",
        bucket,
        region: ENV.STORAGE_REGION ?? "us-east-1",
        endpoint: ENV.STORAGE_ENDPOINT || undefined,
        credentials,
        forcePathStyle: ENV.STORAGE_FORCE_PATH_STYLE ?? false,
        prefix,
        publicUrlBase,
      };
    case "r2":
      return {
        type: "r2",
        accountId: ENV.STORAGE_R2_ACCOUNT_ID || undefined,
        bucket,
        credentials,
        prefix,
        publicUrlBase,
      };
    case "minio":
      return {
        type: "minio",
        endPoint: ENV.STORAGE_MINIO_ENDPOINT ?? "localhost",
        port: ENV.STORAGE_MINIO_PORT ?? 9000,
        useSSL: ENV.STORAGE_MINIO_USE_SSL ?? false,
        bucket,
        accessKey: ENV.STORAGE_ACCESS_KEY_ID ?? "minioadmin",
        secretKey: ENV.STORAGE_SECRET_ACCESS_KEY ?? "minioadmin",
        prefix,
        publicUrlBase,
      };
    case "rustfs":
      return {
        type: "rustfs",
        endpoint: ENV.STORAGE_ENDPOINT ?? "http://localhost:9000",
        bucket,
        region: ENV.STORAGE_REGION ?? "us-east-1",
        credentials,
        forcePathStyle: ENV.STORAGE_FORCE_PATH_STYLE ?? true,
        prefix,
        publicUrlBase,
      };
    case "azure":
      return {
        type: "azure",
        container: options?.bucket ?? ENV.STORAGE_AZURE_CONTAINER ?? bucket,
        connectionString: ENV.STORAGE_AZURE_CONNECTION_STRING || undefined,
        accountUrl: ENV.STORAGE_AZURE_ACCOUNT_URL || undefined,
        prefix,
        publicUrlBase,
      };
    case "gcs":
      return {
        type: "gcs",
        bucket,
        projectId: ENV.STORAGE_GCS_PROJECT_ID || undefined,
        keyFilename: ENV.STORAGE_GCS_KEY_FILE || undefined,
        prefix,
        publicUrlBase,
      };
    case "oracle":
      return {
        type: "oracle",
        namespaceName: ENV.STORAGE_ORACLE_NAMESPACE ?? "",
        region: ENV.STORAGE_REGION ?? "me-jeddah-1",
        bucketName: options?.bucket ?? ENV.STORAGE_ORACLE_BUCKET ?? bucket,
        prefix,
        publicUrlBase,
      };
    case "local":
    default: {
      const rootDir = resolve(process.cwd(), ENV.STORAGE_LOCAL_ROOT ?? "./uploads");
      const targetRoot = options?.subdir ? resolve(rootDir, options.subdir) : rootDir;
      const targetPublicUrl = options?.subdir
        ? `${publicUrlBase.replace(/\/$/, "")}/${options.subdir}`
        : publicUrlBase;
      return {
        type: "local",
        root: targetRoot,
        baseUrl: targetPublicUrl,
        createDirectories: true,
      };
    }
  }
}

export const disks = createStorageManager({
  default: "uploads",
  logger: logger.child("storagekit"),
  disks: {
    uploads: buildStorageConfig({ subdir: "media", bucket: ENV.STORAGE_BUCKET ?? "trips-media" }),
    documents: buildStorageConfig({
      subdir: "documents",
      bucket: ENV.STORAGE_DOCUMENTS_BUCKET ?? "trips-documents",
    }),
    temp: buildStorageConfig({ subdir: "temp", bucket: ENV.STORAGE_BUCKET ?? "trips-media" }),
  },
});

export const storage: Storage = await disks.defaultDisk();

// ============================================================================
// 5. Firebase & Notifications (@mohamedhabibwork/notifykit)
// ============================================================================

export const firebaseConfig = {
  apiKey: ENV.FIREBASE_API_KEY ?? "AIzaSyDN7EMFEeaV_8xQ82mHWrQH8UGYRSx9Jnw",
  authDomain: ENV.FIREBASE_AUTH_DOMAIN ?? "trips-enjoy-com.firebaseapp.com",
  projectId: ENV.FIREBASE_PROJECT_ID ?? ENV.FCM_PROJECT_ID ?? "trips-enjoy-com",
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET ?? "trips-enjoy-com.firebasestorage.app",
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID ?? "219706704727",
  appId: ENV.FIREBASE_APP_ID ?? "1:219706704727:web:cbfdca35713cf9c5ea3412",
  measurementId: ENV.FIREBASE_MEASUREMENT_ID ?? "G-4G3RHXW9LC",
} as const;

export const fcmServiceAccount = {
  type: "service_account",
  project_id: ENV.FCM_PROJECT_ID ?? firebaseConfig.projectId,
  private_key_id: ENV.FCM_PRIVATE_KEY_ID ?? "",
  private_key: (ENV.FCM_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  client_email: ENV.FCM_CLIENT_EMAIL ?? "",
  client_id: ENV.FCM_CLIENT_ID ?? "",
  auth_uri: ENV.FCM_AUTH_URI ?? "https://accounts.google.com/o/oauth2/auth",
  token_uri: ENV.FCM_TOKEN_URI ?? "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url:
    ENV.FCM_AUTH_PROVIDER_X509_CERT_URL ?? "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: ENV.FCM_CLIENT_X509_CERT_URL ?? "",
  universe_domain: ENV.FCM_UNIVERSE_DOMAIN ?? "googleapis.com",
  projectId: ENV.FCM_PROJECT_ID ?? firebaseConfig.projectId,
  clientEmail: ENV.FCM_CLIENT_EMAIL ?? "",
  privateKey: (ENV.FCM_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
} as const;

function buildNotificationMiddlewares(): NotificationMiddleware[] {
  const middlewares: NotificationMiddleware[] = [];
  if (ENV.NOTIFY_DRY_RUN || ENV.NODE_ENV === "test") {
    middlewares.push(dryRunMiddleware());
  }
  return middlewares;
}

export function buildNotificationConfigs(): Record<string, BuiltInNotificationConfig> {
  const providers: Record<string, BuiltInNotificationConfig> = {};

  if (ENV.SMTP_HOST) {
    providers.email = {
      type: "email",
      transport: {
        type: "smtp",
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT ?? 587,
        secure: ENV.SMTP_SECURE ?? false,
        auth:
          ENV.SMTP_USER && ENV.SMTP_PASS ? { user: ENV.SMTP_USER, pass: ENV.SMTP_PASS } : undefined,
      },
      defaults: {
        from: ENV.SMTP_FROM ?? "Trips Enjoy <no-reply@trips-enjoy.com>",
      },
    };
  }

  if (ENV.FCM_PROJECT_ID && ENV.FCM_CLIENT_EMAIL && ENV.FCM_PRIVATE_KEY) {
    providers.fcm = {
      type: "fcm",
      appName: "trips-enjoy-fcm",
      credential: {
        serviceAccount: fcmServiceAccount,
      },
      auth: {
        tokenCache: {
          async get() {
            return (
              (await cache.get<{ accessToken: string; expiresAt: number }>("fcm:oauth-token")) ??
              undefined
            );
          },
          async set(token) {
            const ttlSeconds = Math.max(60, Math.floor((token.expiresAt - Date.now()) / 1000));
            await cache.set("fcm:oauth-token", token, { ttl: `${ttlSeconds}s` });
          },
        },
      },
    };
  }

  if (ENV.APNS_KEY && ENV.APNS_KEY_ID && ENV.APNS_TEAM_ID) {
    providers.apns = {
      type: "apns",
      token: {
        key: ENV.APNS_KEY.replace(/\\n/g, "\n"),
        keyId: ENV.APNS_KEY_ID,
        teamId: ENV.APNS_TEAM_ID,
      },
      production: ENV.APNS_PRODUCTION ?? false,
    };
  }

  if (ENV.WEBPUSH_PUBLIC_KEY && ENV.WEBPUSH_PRIVATE_KEY) {
    providers.webpush = {
      type: "webpush",
      vapid: {
        subject: ENV.WEBPUSH_SUBJECT ?? "mailto:support@trips-enjoy.com",
        publicKey: ENV.WEBPUSH_PUBLIC_KEY,
        privateKey: ENV.WEBPUSH_PRIVATE_KEY,
      },
    };
  }

  if (ENV.HUAWEI_APP_ID && ENV.HUAWEI_APP_SECRET) {
    providers.huawei = {
      type: "huawei",
      appId: ENV.HUAWEI_APP_ID,
      appSecret: ENV.HUAWEI_APP_SECRET,
    };
  }

  if (ENV.TELEGRAM_BOT_TOKEN) {
    providers.telegram = {
      type: "telegram",
      botToken: ENV.TELEGRAM_BOT_TOKEN,
    };
  }

  if (ENV.SLACK_BOT_TOKEN || ENV.SLACK_WEBHOOK_URL) {
    providers.slack = {
      type: "slack",
      botToken: ENV.SLACK_BOT_TOKEN || undefined,
      webhookUrl: ENV.SLACK_WEBHOOK_URL || undefined,
    };
  }

  return providers;
}

const configuredNotificationProviders = buildNotificationConfigs();
const defaultNotificationProviderKey =
  "fcm" in configuredNotificationProviders
    ? "fcm"
    : Object.keys(configuredNotificationProviders)[0];

export const notifications: NotificationManager<
  Record<string, BuiltInNotificationConfig>,
  string | undefined
> = createNotificationManager({
  providers: configuredNotificationProviders,
  default: defaultNotificationProviderKey,
  logger: logger.child("notifykit"),
});

/**
 * Custom logger-backed notification provider using `defineNotificationProvider`.
 * Always available in development/testing or as a safe fallback channel.
 */
export const loggerNotificationDriver = defineNotificationProvider({
  name: "logger",
  capabilities: {
    single: true,
    batch: false,
    notification: true,
    data: true,
  },
  async create(config: { logger: Logger }) {
    return {
      name: "logger" as const,
      capabilities: {
        single: true,
        batch: false,
        notification: true,
        data: true,
      },
      async send(
        message: NotificationMessage<string, unknown>,
      ): Promise<NotificationResult<"logger", { logged: true }>> {
        const messageId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        config.logger.info("Notification dispatched via logger provider", {
          messageId,
          to: message.to,
          title: message.notification?.title,
          body: message.notification?.body,
          data: message.data,
        });
        return {
          ok: true,
          provider: "logger",
          messageId,
          recipient: message.to,
          status: "sent",
          native: { logged: true },
        };
      },
    };
  },
});

const fallbackNotifierInstance = new Notifier(
  await loggerNotificationDriver.create({ logger: logger.child("notifykit:fallback") }),
);
for (const middleware of buildNotificationMiddlewares()) {
  fallbackNotifierInstance.use(middleware);
}
export const fallbackNotifier = fallbackNotifierInstance;

// ============================================================================
// 6. Health & Graceful Shutdown
// ============================================================================

export interface KitsHealthSummary {
  logger: {
    driver: "loggerkit";
    level: string;
    format: "pretty" | "json";
  };
  cache: {
    driver: string;
    namespace: string;
    stores: readonly string[];
  };
  queue: {
    driver: string;
    prefix: string;
    streams: readonly string[];
  };
  storage: {
    driver: string;
    disks: readonly string[];
  };
  notifications: {
    dryRun: boolean;
    configuredProviders: readonly string[];
    defaultProvider: string;
  };
}

export function getKitsHealth(): KitsHealthSummary {
  return {
    logger: {
      driver: "loggerkit",
      level: logger.level,
      format: ENV.LOG_FORMAT === "json" ? "json" : "pretty",
    },
    cache: {
      driver: ENV.CACHE_DRIVER ?? "memory",
      namespace: ENV.CACHE_NAMESPACE ?? "trips:",
      stores: caches.cacheNames(),
    },
    queue: {
      driver: ENV.QUEUE_DRIVER ?? "memory",
      prefix: ENV.QUEUE_PREFIX ?? "trips",
      streams: ["jobs", "events", "notifications"],
    },
    storage: {
      driver: ENV.STORAGE_DRIVER ?? "local",
      disks: disks.diskNames(),
    },
    notifications: {
      dryRun: Boolean(ENV.NOTIFY_DRY_RUN || ENV.NODE_ENV === "test"),
      configuredProviders: Object.keys(configuredNotificationProviders),
      defaultProvider: defaultNotificationProviderKey ?? "logger",
    },
  };
}

export async function shutdownKits(): Promise<void> {
  await Promise.allSettled([
    queues.close(),
    caches.close(),
    notifications.close(),
    fallbackNotifier.close(),
  ]);
  await logger.close();
}

export {
  // cachekit re-exports
  addIfAbsent,
  type BuiltInNotificationConfig,
  type BuiltInQueueConfig,
  type Cache,
  type CacheConfig,
  type CacheManager,
  // storagekit re-exports
  copyBetween,
  createCache,
  createCacheManager,
  createFakeNotifier,
  createLayeredCache,
  // loggerkit re-exports
  createLogContext,
  createLogger,
  // queuekit re-exports
  createMemoryIdempotencyStore,
  // notifykit re-exports
  createNotificationManager,
  createNotificationRouter,
  createNotificationTemplates,
  createNotifier,
  createPreferenceFilter,
  createQueue,
  createQueueManager,
  createStorage,
  createStorageManager,
  createTypedQueue,
  decrement,
  dedupeMiddleware,
  defineNotificationProvider,
  defineUploadIntent,
  dryRunMiddleware,
  elysiaLogger,
  gracefulShutdown,
  increment,
  type Logger,
  type LogLevel,
  memoize,
  namespaced,
  type NotificationManager,
  type NotificationMessage,
  type NotificationMiddleware,
  type NotificationResult,
  Notifier,
  pull,
  type QueueProvider,
  rateLimitMiddleware,
  redact,
  retryMiddleware,
  saveUpload,
  saveUploadIntent,
  saveWebFile,
  scheduleRecurring,
  scopedStorage,
  sendWithFallback,
  type Storage,
  type StorageConfig,
  type StorageManager,
  withIdempotency,
  withRetry,
  withTimeout,
};
