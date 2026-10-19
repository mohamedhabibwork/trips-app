// Notifications service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "notifications";
export {
  NOTIFICATIONS_ERROR_CODE_MAP,
  NotificationsServiceError,
  mapNotificationsError,
} from "./errors";
export { maskContact, renderAuthMessage } from "./model";
export { createNotificationsRepository, type NotificationsRepository } from "./repository";
export {
  createAuthNotifierFromContext,
  type NotifierContext,
  routes,
  webBaseUrlFromContext,
} from "./routes";
export * from "./schemas";
export {
  createAuthNotifier,
  createEmailSender,
  createNotificationsService,
  createTwilioSmsSender,
  type NotificationsService,
} from "./services";
export type * from "./types";
