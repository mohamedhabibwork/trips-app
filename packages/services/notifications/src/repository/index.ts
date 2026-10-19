// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { and, desc, eq } from "@trips-app/db";
import type { Database as ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";
import type { NotificationCategory, NotificationDeliveryChannel } from "../types";

export type { ServiceDatabase };

export function createNotificationsRepository(db: ServiceDatabase) {
  return {
    async listByRecipient(recipientAccountId: string, unreadOnly?: boolean) {
      const condition = unreadOnly
        ? and(
            eq(schema.notificationMessages.recipientAccountId, recipientAccountId),
            eq(schema.notificationMessages.isRead, false),
          )
        : eq(schema.notificationMessages.recipientAccountId, recipientAccountId);
      return db
        .select()
        .from(schema.notificationMessages)
        .where(condition)
        .orderBy(desc(schema.notificationMessages.createdAt))
        .limit(100);
    },

    async findById(notificationId: string) {
      const [row] = await db
        .select()
        .from(schema.notificationMessages)
        .where(eq(schema.notificationMessages.id, notificationId))
        .limit(1);
      return row ?? null;
    },

    async markRead(notificationId: string) {
      const now = new Date();
      const [updated] = await db
        .update(schema.notificationMessages)
        .set({ isRead: true, readAt: now })
        .where(eq(schema.notificationMessages.id, notificationId))
        .returning();
      return updated ?? null;
    },

    async markAllRead(recipientAccountId: string) {
      const now = new Date();
      const updated = await db
        .update(schema.notificationMessages)
        .set({ isRead: true, readAt: now })
        .where(
          and(
            eq(schema.notificationMessages.recipientAccountId, recipientAccountId),
            eq(schema.notificationMessages.isRead, false),
          ),
        )
        .returning({ id: schema.notificationMessages.id });
      return updated.length;
    },

    async insertMessage(values: {
      recipientAccountId: string;
      tenantId: string | null;
      category: NotificationCategory;
      channel: NotificationDeliveryChannel;
      titleAr: string;
      titleEn: string;
      bodyAr: string;
      bodyEn: string;
      actionUrl: string | null;
    }) {
      const [created] = await db.insert(schema.notificationMessages).values(values).returning();
      return created!;
    },
  };
}

export type NotificationsRepository = ReturnType<typeof createNotificationsRepository>;
