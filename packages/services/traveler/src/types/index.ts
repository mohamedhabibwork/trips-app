// TypeScript types for Traveler. Re-exported from the service root.
import type {
  PlanCatalogEntry,
  PrivacyRequestStatus,
  PrivacyRequestType,
  SupportedCountryCode,
  SupportedLocale,
  TravelerPlanCode,
  UserRole,
} from "@trips-app/domain";

export type { SharedErrorCode } from "@trips-app/domain";
export type * from "../schemas/dtos";

export interface NotificationPreferencesDto {
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

export interface TravelerActorContext {
  accountId: string;
  role: UserRole;
  ipAddress?: string | null;
  requestId?: string | null;
}

export interface TravelerProfileDto {
  accountId: string;
  fullName: string;
  email: string | null;
  phoneE164: string | null;
  countryCode: SupportedCountryCode;
  preferredLanguage: SupportedLocale;
  avatarUrl: string | null;
  travelerPlanTier: TravelerPlanCode;
  notificationPreferences: NotificationPreferencesDto;
  quietHoursNotice: string;
}

export interface TravelerPlanOverviewDto {
  currentPlanTier: TravelerPlanCode;
  annualDiscountBps: number;
  plans: readonly PlanCatalogEntry[];
}

export interface PrivacyRequestDto {
  id: string;
  accountId: string;
  requestType: PrivacyRequestType;
  status: PrivacyRequestStatus;
  reason: string | null;
  downloadUrl: string | null;
  scheduledPurgeAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}
