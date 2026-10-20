// Zod schemas that validate input at the boundary.
// Derived from @trips-app/db/zod table definitions.
import {
  insertNotificationMessagesSchema,
  selectNotificationMessagesSchema,
  updateNotificationMessagesSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

export const notificationMessageSelectSchema = selectNotificationMessagesSchema;
export const notificationMessageInsertSchema = insertNotificationMessagesSchema;
export const notificationMessageUpdateSchema = updateNotificationMessagesSchema;

export const listInboxSchema = z
  .object({
    unreadOnly: z.boolean().optional(),
  })
  .optional();

export const markNotificationReadSchema = z.object({
  notificationId: z.uuid(),
});

export const sendNotificationSchema = insertNotificationMessagesSchema
  .pick({
    recipientAccountId: true,
  })
  .extend({
    tenantId: z.uuid().nullable().optional(),
    category: insertNotificationMessagesSchema.shape.category.default("operations"),
    channel: insertNotificationMessagesSchema.shape.channel.default("in_app"),
    titleAr: z.string().trim().min(2).max(200),
    titleEn: z.string().trim().min(2).max(200),
    bodyAr: z.string().trim().min(2).max(1000),
    bodyEn: z.string().trim().min(2).max(1000),
    actionUrl: z.string().trim().max(500).nullable().optional(),
  });
