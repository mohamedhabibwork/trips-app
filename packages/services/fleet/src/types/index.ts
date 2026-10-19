// TypeScript types for Fleet. Re-exported from the service root.
import type {
  AdminSubRole,
  SeatLayoutConfig,
  UserRole,
  VehicleRegistrationStatus,
  VehicleStatus,
  VehicleTypeScope,
  VehicleTypeStatus,
} from "@trips-app/domain";

export type { SharedErrorCode } from "@trips-app/domain";
export type * from "../schemas/dtos";

export interface FleetTenantActorContext {
  accountId: string;
  role: UserRole;
  activeTenantId: string;
  ipAddress?: string | null;
  requestId?: string | null;
}

export interface FleetAdminActorContext {
  accountId: string;
  role: UserRole;
  adminSubRole: AdminSubRole;
  ipAddress?: string | null;
  requestId?: string | null;
}

export interface VehicleTypeDto {
  id: string;
  tenantId: string | null;
  scope: VehicleTypeScope;
  categoryLookupCode: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  seatCount: number;
  seatLayout: SeatLayoutConfig;
  status: VehicleTypeStatus;
  createdByAccountId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleDto {
  id: string;
  tenantId: string;
  vehicleTypeId: string;
  plateNumber: string;
  plateNumberNormalized: string;
  model: string;
  manufacturingYear: number;
  seatCount: number;
  registrationStatus: VehicleRegistrationStatus;
  registrationExpiry: Date | null;
  registrationDocumentUrl: string | null;
  photoUrls: readonly string[];
  amenityCodes: readonly string[];
  status: VehicleStatus;
  notes: string | null;
  createdByAccountId: string | null;
  createdAt: Date;
  updatedAt: Date;
  vehicleType: VehicleTypeDto | null;
  activeBookingsCount: number;
  assignedActiveTripsCount: number;
}
