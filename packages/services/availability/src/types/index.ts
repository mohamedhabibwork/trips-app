// Shared TypeScript types, ids and enums. No I/O.
import type { AvailabilityBlockType, SupplierRole, UserRole } from "@trips-app/domain";

export type {
  ErrorCategory,
  ErrorHttpStatus,
  SharedErrorCode,
  SharedErrorCode as AvailabilityErrorCode,
} from "@trips-app/domain";
export type * from "../schemas/dtos";

export interface AvailabilityActorContext {
  accountId: string;
  role: UserRole;
  activeTenantId?: string | null;
}

export interface SupplierAvailabilityBlockDto {
  id: string;
  supplierAccountId: string;
  supplierRole: SupplierRole;
  tenantId: string | null;
  blockType: AvailabilityBlockType;
  startsAt: Date;
  endsAt: Date;
  tripId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
