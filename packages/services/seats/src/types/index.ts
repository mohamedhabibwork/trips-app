// Shared TypeScript types, ids and enums. No I/O.
import type { SeatInventoryStatus, UserRole } from "@trips-app/domain";

export type {
  ErrorCategory,
  ErrorHttpStatus,
  SharedErrorCode,
  SharedErrorCode as SeatsErrorCode,
} from "@trips-app/domain";
export type * from "../schemas/dtos";

export interface SeatsActorContext {
  accountId: string;
  role: UserRole;
  activeTenantId?: string | null;
  planTier?: string | null;
}

export interface TripSeatDto {
  id: string;
  tripId: string;
  vehicleId: string;
  seatLabel: string;
  rowIndex: number;
  colIndex: number;
  isAccessible: boolean;
  isPriority: boolean;
  status: SeatInventoryStatus;
  heldByAccountId: string | null;
  holdExpiresAt: Date | null;
  bookingId: string | null;
  passengerName: string | null;
}
