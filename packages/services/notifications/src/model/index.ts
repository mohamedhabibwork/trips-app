// Entities and aggregates with their invariants. No I/O.
export {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_DELIVERY_CHANNELS,
  type NotificationCategory,
  type NotificationDeliveryChannel,
} from "@trips-app/domain";
export { maskContact } from "./mask";
export { DEFAULT_LOCALE, escapeHtml, renderAuthMessage } from "./templates";
