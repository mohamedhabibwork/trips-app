// Notifications service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "notifications";
export {
  NOTIFICATIONS_ERROR_CODE_MAP,
  NotificationsServiceError,
  mapNotificationsError,
} from "./errors";
export { routes } from "./routes";
export type * from "./types";
