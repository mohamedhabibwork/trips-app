// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { and, desc, eq } from "@trips-app/db";
import type { ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";
import type { NotificationCategory, NotificationDeliveryChannel } from "../types";

export type { ServiceDatabase };

export function createNotificationsRepository(db: ServiceDatabase) {
  return {
    async listByRecipient(
      recipientAccountId: string,
      optionsOrUnreadOnly?:
        | boolean
        | {
            unreadOnly?: boolean;
            category?: NotificationCategory;
            limit?: number;
            offset?: number;
          },
    ) {
      const unreadOnly =
        typeof optionsOrUnreadOnly === "boolean"
          ? optionsOrUnreadOnly
          : optionsOrUnreadOnly?.unreadOnly;
      const category =
        typeof optionsOrUnreadOnly === "object" ? optionsOrUnreadOnly?.category : undefined;
      const limit =
        typeof optionsOrUnreadOnly === "object" ? optionsOrUnreadOnly?.limit : undefined;
      const offset =
        typeof optionsOrUnreadOnly === "object" ? optionsOrUnreadOnly?.offset : undefined;

      let query = db.select().from(schema.notificationMessages).$dynamic();

      const conditions = [eq(schema.notificationMessages.recipientAccountId, recipientAccountId)];
      if (unreadOnly) {
        conditions.push(eq(schema.notificationMessages.isRead, false));
      }
      if (category) {
        conditions.push(eq(schema.notificationMessages.category, category));
      }

      query = query.where(and(...conditions)).orderBy(desc(schema.notificationMessages.createdAt));
      query = query.limit(limit !== undefined ? limit : 100);
      if (offset !== undefined) query = query.offset(offset);
      return query;
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

    async insertMessages(
      messages: Array<{
        recipientAccountId: string;
        tenantId: string | null;
        category: NotificationCategory;
        channel: NotificationDeliveryChannel;
        titleAr: string;
        titleEn: string;
        bodyAr: string;
        bodyEn: string;
        actionUrl: string | null;
      }>,
    ) {
      if (messages.length === 0) return [];
      return db.insert(schema.notificationMessages).values(messages).returning();
    },
  };
}

export type NotificationsRepository = ReturnType<typeof createNotificationsRepository>;
