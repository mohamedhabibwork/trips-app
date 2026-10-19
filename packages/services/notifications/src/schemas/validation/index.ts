import { z } from "zod/v4";

export const listInboxSchema = z
  .object({
    unreadOnly: z.boolean().optional(),
  })
  .optional();

export const markNotificationReadSchema = z.object({
  notificationId: z.uuid(),
});

export const sendNotificationSchema = z.object({
  recipientAccountId: z.uuid(),
  tenantId: z.uuid().nullable().optional(),
  category: z
    .enum(["bookings", "trip_updates", "promotions", "security", "safety", "operations"])
    .default("operations"),
  channel: z.enum(["in_app", "email", "sms", "push"]).default("in_app"),
  titleAr: z.string().trim().min(2).max(200),
  titleEn: z.string().trim().min(2).max(200),
  bodyAr: z.string().trim().min(2).max(1000),
  bodyEn: z.string().trim().min(2).max(1000),
  actionUrl: z.string().trim().max(500).nullable().optional(),
});
