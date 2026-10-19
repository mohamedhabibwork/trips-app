// oRPC procedures for Notifications. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  listInboxSchema,
  markAllReadResultDtoSchema,
  markNotificationReadSchema,
  notificationMessageDtoSchema,
  sendNotificationSchema,
} from "../schemas";
import { createNotificationsService } from "../services";
import { notificationsAuthenticatedProcedure, procedure } from "./procedure";

export {
  createAuthNotifierFromContext,
  type NotifierContext,
  webBaseUrlFromContext,
} from "./notifier";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/notifications/status",
      operationId: "notificationsStatus",
      summary: "Notifications service health status",
      tags: ["notifications"],
    })
    .handler(() => ({ service: "notifications", status: "ok" as const })),

  listInbox: notificationsAuthenticatedProcedure
    .route({
      method: "GET",
      path: "/notifications/inbox",
      operationId: "notificationsListInbox",
      summary: "List in-app notifications for the authenticated user",
      tags: ["notifications"],
    })
    .input(listInboxSchema)
    .output(notificationMessageDtoSchema.array())
    .handler(async ({ context, input }) => {
      const svc = createNotificationsService(context.db);
      return svc.listInbox(context.auth.accountId, input?.unreadOnly);
    }),

  markRead: notificationsAuthenticatedProcedure
    .route({
      method: "POST",
      path: "/notifications/mark-read",
      operationId: "notificationsMarkRead",
      summary: "Mark a single notification as read",
      tags: ["notifications"],
    })
    .input(markNotificationReadSchema)
    .output(notificationMessageDtoSchema)
    .handler(async ({ context, input }) => {
      const svc = createNotificationsService(context.db);
      return svc.markRead(context.auth.accountId, input);
    }),

  markAllRead: notificationsAuthenticatedProcedure
    .route({
      method: "POST",
      path: "/notifications/mark-all-read",
      operationId: "notificationsMarkAllRead",
      summary: "Mark all unread notifications as read",
      tags: ["notifications"],
    })
    .output(markAllReadResultDtoSchema)
    .handler(async ({ context }) => {
      const svc = createNotificationsService(context.db);
      return svc.markAllRead(context.auth.accountId);
    }),

  sendNotification: notificationsAuthenticatedProcedure
    .route({
      method: "POST",
      path: "/notifications/send",
      operationId: "notificationsSend",
      summary: "Send an in-app/multi-channel notification to a recipient",
      tags: ["notifications"],
    })
    .input(sendNotificationSchema)
    .output(notificationMessageDtoSchema)
    .handler(async ({ context, input }) => {
      const svc = createNotificationsService(context.db);
      return svc.sendNotification(input);
    }),
};
