// Shared TypeScript types, ids and enums. No I/O.
import type { CurrencyCode, Money, TripProgramStatus, UserRole } from "@trips-app/domain";

export type {
  ErrorCategory,
  ErrorHttpStatus,
  SharedErrorCode,
  SharedErrorCode as ProgramsErrorCode,
} from "@trips-app/domain";
export type * from "../schemas/dtos";

export interface ProgramsTenantActorContext {
  accountId: string;
  role: UserRole;
  activeTenantId: string;
  ipAddress?: string | null;
  requestId?: string | null;
}

export interface TripProgramDto {
  id: string;
  tenantId: string;
  tripId: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  dayNumber: number;
  startsAt: Date | null;
  endsAt: Date | null;
  locationNameAr: string | null;
  locationNameEn: string | null;
  price: Money;
  priceMinor: number;
  currencyCode: CurrencyCode;
  isIncludedInBase: boolean;
  capacity: number | null;
  bookedCount: number;
  remainingCapacity: number | null;
  sortOrder: number;
  attachmentUrls: readonly string[];
  status: TripProgramStatus;
  createdAt: Date;
  updatedAt: Date;
}
