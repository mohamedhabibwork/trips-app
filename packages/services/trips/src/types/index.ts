// TypeScript types for Trips. Re-exported from the service root.
import type {
  CurrencyCode,
  Money,
  SeatLayoutConfig,
  SupportedLocale,
  TravelerPlanCode,
  TripPublishMode,
  TripRoutePoint,
  TripSeatAssignmentMode,
  TripStaffSource,
  TripState,
  TripWizardStepCompletion,
  UserRole,
} from "@trips-app/domain";

export type { SharedErrorCode } from "@trips-app/domain";
export type * from "../schemas/dtos";

export interface TripsTenantActorContext {
  accountId: string;
  role: UserRole;
  activeTenantId: string;
  ipAddress?: string | null;
  requestId?: string | null;
}

export interface TripsViewerContext {
  accountId?: string | null;
  role?: UserRole | null;
  travelerPlanTier?: TravelerPlanCode | null;
}

export interface TripVehicleAssignmentDto {
  id: string;
  tripId: string;
  vehicleId: string;
  plateNumber: string | null;
  model: string | null;
  seatCountSnapshot: number;
  seatLayoutSnapshot: SeatLayoutConfig;
  driverSource: TripStaffSource;
  driverAccountId: string | null;
  moderatorSource: TripStaffSource;
  moderatorAccountId: string | null;
  photographerSource: TripStaffSource;
  photographerAccountId: string | null;
}

export interface OrganizationTripDto {
  id: string;
  tenantId: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  categoryLookupCode: string;
  language: SupportedLocale;
  coverImageUrl: string | null;
  galleryImageUrls: readonly string[];
  startsAt: Date | null;
  endsAt: Date | null;
  timezone: string;
  origin: TripRoutePoint | null;
  destinations: readonly TripRoutePoint[];
  seatAssignmentMode: TripSeatAssignmentMode;
  seatPriorityWindowHours: number;
  basePrice: Money;
  basePriceMinor: number;
  currencyCode: CurrencyCode;
  totalCapacity: number;
  confirmedSeatsCount: number;
  heldSeatsCount: number;
  remainingSeatsCount: number;
  childTrackingEnabled: boolean;
  state: TripState;
  publishMode: TripPublishMode;
  targetedAudienceIds: readonly string[];
  vipEarlyAccessUntil: Date | null;
  wizardSteps: TripWizardStepCompletion;
  hasStaffingGap: boolean;
  publishedAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  cancelledByAccountId: string | null;
  createdByAccountId: string | null;
  createdAt: Date;
  updatedAt: Date;
  vehicles: readonly TripVehicleAssignmentDto[];
}

export interface PublicTripSummaryDto {
  id: string;
  tenantId: string;
  organizerNameAr: string;
  organizerNameEn: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  categoryLookupCode: string;
  language: SupportedLocale;
  coverImageUrl: string | null;
  galleryImageUrls: readonly string[];
  startsAt: Date | null;
  endsAt: Date | null;
  timezone: string;
  origin: TripRoutePoint | null;
  destinations: readonly TripRoutePoint[];
  seatAssignmentMode: TripSeatAssignmentMode;
  /** Hours before departure when the Explorer/VIP seat priority window opens (FR-SEAT-03). */
  seatPriorityWindowHours: number;
  basePrice: Money;
  basePriceMinor: number;
  currencyCode: CurrencyCode;
  totalCapacity: number;
  confirmedSeatsCount: number;
  remainingSeatsCount: number;
  childTrackingEnabled: boolean;
  state: TripState;
}
