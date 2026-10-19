// Entities and aggregates with their invariants. No I/O.
export {
  computeBlindIndex,
  DEFAULT_PLAN_CATALOG,
  decryptField,
  encryptField,
  findPlanCatalogEntry,
  normalizeEmail,
  normalizePhoneE164,
  type PlanCatalogEntry,
  type PrivacyRequestStatus,
  type PrivacyRequestType,
  type SupportedCountryCode,
  type SupportedLocale,
  type TravelerPlanCode,
  type UserRole,
} from "@trips-app/domain";

export const SUPPORTED_COUNTRIES = ["EG", "SA", "AE"] as const;
export const SUPPORTED_LOCALES = ["ar", "en"] as const;
export const TRAVELER_PLAN_CODES = ["free", "explorer", "vip"] as const;
export const PRIVACY_REQUEST_TYPES = ["data_export", "account_deletion"] as const;
export const PRIVACY_REQUEST_STATUSES = [
  "pending",
  "processing",
  "completed",
  "cancelled",
] as const;

export const DELETION_GRACE_DAYS = 30;
export const QUIET_HOURS_NOTICE = "10 pm to 7 am for SMS and push, unless urgent";

export interface NotificationPreferencesData {
  bookingsPush: boolean;
  bookingsSms: boolean;
  bookingsEmail: boolean;
  tripUpdatesPush: boolean;
  tripUpdatesSms: boolean;
  tripUpdatesEmail: boolean;
  promotionsPush: boolean;
  promotionsSms: boolean;
  promotionsEmail: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferencesData = {
  bookingsPush: true,
  bookingsSms: true,
  bookingsEmail: true,
  tripUpdatesPush: true,
  tripUpdatesSms: true,
  tripUpdatesEmail: true,
  promotionsPush: false,
  promotionsSms: false,
  promotionsEmail: false,
};
