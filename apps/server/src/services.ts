import {
  createMediaService,
  MEDIA_CLEANUP_QUEUE_NAME,
  UNLINKED_FILE_TTL_HOURS,
} from "@trips-app/api";
import { createDb, type Database } from "@trips-app/db";

import { ENV } from "./env.server";
import { disks, logger, queue, scheduleRecurring } from "./kits";

// SQL text is logged in development only. Parameters are never logged.
export const db: Database = createDb({
  DATABASE_URL: ENV.DATABASE_URL,
  logQueries: ENV.NODE_ENV === "development",
});

export interface UnlinkedMediaCleanupRunOptions {
  olderThanHours?: number;
  limit?: number;
  now?: () => Date;
}

export async function runUnlinkedMediaCleanup(options: UnlinkedMediaCleanupRunOptions = {}) {
  const mediaService = createMediaService(db, {
    storage: disks,
    queue,
    now: options.now,
  });

  const result = await mediaService.cleanupExpiredFiles({
    olderThanHours: options.olderThanHours ?? UNLINKED_FILE_TTL_HOURS,
    limit: options.limit ?? 100,
  });

  if (result.deletedCount > 0 || result.failedCount > 0) {
    logger.info("Completed 12h unlinked media cleanup sweep", {
      scannedCount: result.scannedCount,
      deletedCount: result.deletedCount,
      failedCount: result.failedCount,
      cutoffIso: result.cutoffIso,
    });
  }

  return result;
}

let cleanupWorkerHandle: { stop: () => Promise<void> } | null = null;

export async function startUnlinkedMediaCleanupWorker(
  sweepIntervalMs: number = 15 * 60 * 1000,
): Promise<{ stop: () => Promise<void> }> {
  if (cleanupWorkerHandle) {
    return cleanupWorkerHandle;
  }

  const consumer = await queue.consume(
    MEDIA_CLEANUP_QUEUE_NAME,
    async ({ ack }) => {
      await runUnlinkedMediaCleanup();
      await ack.complete();
    },
    { concurrency: 1 },
  );

  const recurring = scheduleRecurring(
    queue,
    MEDIA_CLEANUP_QUEUE_NAME,
    { payload: { trigger: "periodic-12h-unlinked-cleanup" } },
    { every: sweepIntervalMs },
  );

  cleanupWorkerHandle = {
    async stop() {
      recurring.stop();
      await consumer.close();
      cleanupWorkerHandle = null;
    },
  };

  return cleanupWorkerHandle;
}

export * from "./kits";
