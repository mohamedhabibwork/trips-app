// Business logic for Notifications. Routes call this factory with context.db; repositories are created here.
import { NotificationsServiceError } from "../errors";
import { createNotificationsRepository, type ServiceDatabase } from "../repository";
import type { MarkNotificationReadInput, SendNotificationInput } from "../types";

export {
  createAuthNotifier,
  DEFAULT_MAX_RETRIES,
  type DispatcherDeps,
  type DispatcherLogger,
} from "./dispatcher";
export {
  createEmailSender,
  createTwilioSmsSender,
  type EmailMessage,
  type EmailSender,
  type EmailTransportSource,
  type HttpFetch,
  type SendResult,
  type SmsMessage,
  type SmsSender,
} from "./senders";

export function createNotificationsService(db: ServiceDatabase) {
  const repo = createNotificationsRepository(db);

  return {
    async listInbox(recipientAccountId: string, unreadOnly?: boolean) {
      return repo.listByRecipient(recipientAccountId, unreadOnly);
    },

    async markRead(recipientAccountId: string, input: MarkNotificationReadInput) {
      const existing = await repo.findById(input.notificationId);
      if (!existing || existing.recipientAccountId !== recipientAccountId) {
        throw new NotificationsServiceError("RESOURCE_NOT_FOUND", "Notification not found.");
      }
      const updated = await repo.markRead(existing.id);
      if (!updated) {
        throw new NotificationsServiceError("RESOURCE_NOT_FOUND", "Notification not found.");
      }
      return updated;
    },

    async markAllRead(recipientAccountId: string) {
      const updatedCount = await repo.markAllRead(recipientAccountId);
      return { updatedCount };
    },

    async sendNotification(input: SendNotificationInput) {
      return repo.insertMessage({
        recipientAccountId: input.recipientAccountId,
        tenantId: input.tenantId ?? null,
        category: input.category,
        channel: input.channel,
        titleAr: input.titleAr,
        titleEn: input.titleEn,
        bodyAr: input.bodyAr,
        bodyEn: input.bodyEn,
        actionUrl: input.actionUrl ?? null,
      });
    },
  };
}

export type NotificationsService = ReturnType<typeof createNotificationsService>;
