export {
  computeBlindIndex,
  DEFAULT_PLAN_CATALOG,
  decryptField,
  encryptField,
  findPlanCatalogEntry,
  normalizeEmail,
  normalizePhoneE164,
  type PlanCatalogEntry,
  PRIVACY_REQUEST_STATUSES,
  PRIVACY_REQUEST_TYPES,
  type PrivacyRequestStatus,
  type PrivacyRequestType,
  SUPPORTED_COUNTRY_CODES,
  type SupportedCountryCode,
  SUPPORTED_LOCALES,
  type SupportedLocale,
  TRAVELER_PLAN_CODES,
  type TravelerPlanCode,
  type UserRole,
} from "@trips-app/domain";

import { SUPPORTED_COUNTRY_CODES } from "@trips-app/domain";
export const SUPPORTED_COUNTRIES = SUPPORTED_COUNTRY_CODES;

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
