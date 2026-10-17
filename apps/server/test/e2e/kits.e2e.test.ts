import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { createContext } from "../../src/context";
import { app } from "../../src/index";
import {
  cache,
  caches,
  createFakeNotifier,
  createTypedQueue,
  disks,
  fallbackNotifier,
  fcmServiceAccount,
  firebaseConfig,
  getKitsHealth,
  logContext,
  logger,
  namespaced,
  notifications,
  queue,
  queues,
  storage,
} from "../../src/services";

describe("E2E: @mohamedhabibwork kits integration (apps/server)", () => {
  test("GET /health includes kits health summary for all 5 kits", async () => {
    const response = await app.handle(new Request("http://localhost/health"));
    const body = (await response.json()) as {
      success: boolean;
      data: {
        status: string;
        service: string;
        kits: ReturnType<typeof getKitsHealth>;
      };
    };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("OK");
    expect(body.data.kits.logger.driver).toBe("loggerkit");
    expect(body.data.kits.cache.stores).toContain("default");
    expect(body.data.kits.cache.stores).toContain("sessions");
    expect(body.data.kits.cache.stores).toContain("seatHolds");
    expect(body.data.kits.queue.streams).toContain("jobs");
    expect(body.data.kits.queue.streams).toContain("events");
    expect(body.data.kits.queue.streams).toContain("notifications");
    expect(body.data.kits.storage.disks).toContain("uploads");
    expect(body.data.kits.storage.disks).toContain("documents");
    expect(body.data.kits.storage.disks).toContain("temp");
    expect(body.data.kits.notifications).toBeDefined();
  });

  test("loggerkit: supports child loggers, contextual fields, and AsyncLocalStorage logContext", async () => {
    const child = logger.child("test-suite", { component: "kits-e2e" });
    expect(child).toBeDefined();

    const value = await logContext.run({ requestId: "req-test-123", locale: "en" }, async () => {
      const current = logContext.get();
      child.debug("Testing logger inside logContext", { secret: "should-be-redacted" });
      return current?.requestId;
    });

    expect(value).toBe("req-test-123");
  });

  test("cachekit: default cache, named stores, and namespaced views read/write/delete values", async () => {
    const key = `test:${randomUUID()}`;
    await cache.set(key, { tripId: "trip-1", seats: 12 }, { ttl: "60s" });
    const stored = await cache.get<{ tripId: string; seats: number }>(key);
    expect(stored).toEqual({ tripId: "trip-1", seats: 12 });

    const seatHoldsCache = await caches.cache("seatHolds");
    const scoped = namespaced(seatHoldsCache, "trip-1");
    await scoped.set("seat-4A", { heldBy: "acc-1" }, { ttl: "30s" });
    expect(await scoped.get<{ heldBy: string }>("seat-4A")).toEqual({ heldBy: "acc-1" });

    await scoped.delete("seat-4A");
    await cache.delete(key);
    expect(await cache.get(key)).toBeUndefined();
  });

  test("queuekit: publishes and consumes typed messages on named providers", async () => {
    const eventsQueue = await queues.provider("events");
    const streamName = `booking.created.${randomUUID()}`;
    const typedEvents =
      createTypedQueue<Record<string, { bookingId: string; amountHalalas: number }>>(eventsQueue);

    const received: Array<{ bookingId: string; amountHalalas: number }> = [];

    const consumer = await typedEvents.consume(streamName, async ({ message, ack }) => {
      received.push(message.payload);
      await ack.complete();
    });

    await typedEvents.publish(streamName, {
      bookingId: "bkg_1001",
      amountHalalas: 25_000,
    });

    await consumer.close();
    expect(received).toEqual([{ bookingId: "bkg_1001", amountHalalas: 25_000 }]);
    expect(queue).toBeDefined();
  });

  test("storagekit: uploads, downloads, checks existence, and deletes objects on configured disks", async () => {
    const tempDisk = await disks.disk("temp");
    const objectKey = `test-${randomUUID()}.txt`;

    await tempDisk.upload(objectKey, "Hello from storagekit!", {
      contentType: "text/plain; charset=utf-8",
    });

    expect(await tempDisk.exists(objectKey)).toBe(true);
    const downloaded = await tempDisk.download(objectKey);
    expect(await downloaded.text()).toBe("Hello from storagekit!");
    expect(await tempDisk.getUrl(objectKey)).toContain(objectKey);

    await tempDisk.delete(objectKey);
    expect(await tempDisk.exists(objectKey)).toBe(false);
    expect(storage).toBeDefined();
  });

  test("notifykit: configures FCM from Firebase Admin SDK env vars and dispatches notifications", async () => {
    expect(firebaseConfig).toEqual({
      apiKey: "AIzaSyDN7EMFEeaV_8xQ82mHWrQH8UGYRSx9Jnw",
      authDomain: "trips-enjoy-com.firebaseapp.com",
      projectId: "trips-enjoy-com",
      storageBucket: "trips-enjoy-com.firebasestorage.app",
      messagingSenderId: "219706704727",
      appId: "1:219706704727:web:cbfdca35713cf9c5ea3412",
      measurementId: "G-4G3RHXW9LC",
    });

    expect(fcmServiceAccount.type).toBe("service_account");
    expect(fcmServiceAccount.project_id).toBe("trips-enjoy-com");
    expect(fcmServiceAccount.private_key_id).toBe("43efd209b9b2bd6185aa83ed6c47590c9d87c1fe");
    expect(fcmServiceAccount.client_email).toBe(
      "firebase-adminsdk-fbsvc@trips-enjoy-com.iam.gserviceaccount.com",
    );
    expect(fcmServiceAccount.client_id).toBe("101219454632563794686");
    expect(fcmServiceAccount.private_key).toContain("-----BEGIN PRIVATE KEY-----");

    const health = getKitsHealth();
    expect(health.notifications.configuredProviders).toContain("fcm");
    expect(health.notifications.defaultProvider).toBe("fcm");

    const fallbackResult = await fallbackNotifier.send({
      to: "traveler_123",
      notification: {
        title: "Booking Confirmed",
        body: "Your seat 4A is reserved.",
      },
      data: { bookingId: "bkg_1001" },
    });

    expect(fallbackResult.ok).toBe(true);

    const fake = createFakeNotifier<{ id: string }>();
    const fakeResult = await fake.send({
      to: { id: "device_token_abc" },
      notification: { title: "Trip Reminder", body: "Bus departs in 30 minutes" },
    });

    expect(fakeResult.ok).toBe(true);
    expect(fake.messages()).toHaveLength(1);
    expect(notifications).toBeDefined();
  });

  test("createContext: attaches logger, cache, caches, queue, queues, storage, disks, and notifications", async () => {
    const rpcContext = await createContext({
      context: {
        request: new Request("http://localhost/rpc/trips/status", {
          headers: {
            "x-request-id": "ctx-req-001",
            "accept-language": "en",
          },
        }),
      } as Parameters<typeof createContext>[0]["context"],
    });

    expect(rpcContext.requestId).toBe("ctx-req-001");
    expect(rpcContext.locale).toBe("en");
    expect(rpcContext.logger).toBeDefined();
    expect(rpcContext.cache).toBe(cache);
    expect(rpcContext.caches).toBe(caches);
    expect(rpcContext.queue).toBe(queue);
    expect(rpcContext.queues).toBe(queues);
    expect(rpcContext.storage).toBe(storage);
    expect(rpcContext.disks).toBe(disks);
    expect(rpcContext.notifications).toBe(notifications);
  });
});
