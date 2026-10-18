// The dispute record shared by the disputes queue and the dispute detail (SCR-ADM-23, SCR-ADM-24).
// Disputes are read from the admin reconciliation exceptions: every listed entry is still open.
import { ACKNOWLEDGE_WITHIN_WORKING_DAYS, shortId, workingDaysSince } from "./deals-format";

export interface DisputeSource {
  id: string;
  tenantId: string;
  bookingId: string | null;
  tripId: string | null;
  entryType: string;
  description: string;
  grossAmountMinor: number;
  currencyCode: string;
  invoiceNumber: string | null;
  occurredAt: Date | string;
}

export type DisputeState = "open" | "openOverdue" | "acknowledged" | "resolved";

export interface Dispute {
  id: string;
  organization: string;
  /** Booking ID, else trip ID; the payment refund is linked to it. */
  linkedId: string | null;
  isBooking: boolean;
  reference: string;
  type: string;
  ageWorkingDays: number;
  state: DisputeState;
  amountMinor: number;
  currencyCode: string;
  paymentReference: string;
}

export function toDispute(source: DisputeSource, now: Date = new Date()): Dispute {
  const linkedId = source.bookingId ?? source.tripId;
  const ageWorkingDays = workingDaysSince(source.occurredAt, now);
  return {
    id: source.id,
    organization: shortId(source.tenantId),
    linkedId,
    isBooking: source.bookingId !== null,
    reference: shortId(linkedId ?? source.id),
    type: source.description || source.entryType,
    ageWorkingDays,
    state: ageWorkingDays > ACKNOWLEDGE_WITHIN_WORKING_DAYS ? "openOverdue" : "open",
    amountMinor: Math.abs(source.grossAmountMinor),
    currencyCode: source.currencyCode,
    paymentReference: source.invoiceNumber ?? shortId(source.id),
  };
}
