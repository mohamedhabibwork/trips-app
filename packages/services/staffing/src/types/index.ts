// Shared TypeScript types, ids and enums. No I/O.
import type { TripStaffSource, UserRole } from "@trips-app/domain";

export type {
  ErrorCategory,
  ErrorHttpStatus,
  SharedErrorCode,
  SharedErrorCode as StaffingErrorCode,
} from "@trips-app/domain";
export type * from "../schemas/dtos";

export interface StaffingTenantActorContext {
  accountId: string;
  role: UserRole;
  activeTenantId: string;
  ipAddress?: string | null;
  requestId?: string | null;
}

export interface TripVehicleStaffingDto {
  id: string;
  tripId: string;
  vehicleId: string;
  plateNumber: string | null;
  model: string | null;
  driverSource: TripStaffSource;
  driverAccountId: string | null;
  moderatorSource: TripStaffSource;
  moderatorAccountId: string | null;
  photographerSource: TripStaffSource;
  photographerAccountId: string | null;
}

export interface ModeratorAssignmentDto {
  id: string;
  tenantId: string;
  accountId: string;
  tripId: string;
  vehicleId: string;
  validFrom: Date;
  validUntil: Date;
  status: "assigned" | "active" | "expired" | "revoked";
  createdAt: Date;
}
