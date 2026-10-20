// Booking records and their status badges, shared by the bookings screens (SCR-ORG-23 to 26).
// The booking procedures return table rows; these narrow them to the fields the pages read.
import { t } from "@trips-app/i18n";

import { NO_VALUE, OrgBadge } from "../common/org-ui";

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "refunded";

export interface BookingPassengerRecord {
  id?: string;
  fullName?: string;
  seatLabel?: string | null;
}

export interface BookingRecord {
  id: string;
  bookingReference: string;
  tripId: string;
  vehicleId: string | null;
  passengersCount: number;
  passengers: readonly BookingPassengerRecord[];
  selectedProgramIds: readonly string[];
  seatLabels: readonly string[];
  couponId: string | null;
  couponCode: string | null;
  programsTotalMinor: number;
  discountMinor: number;
  totalAmountMinor: number;
  currencyCode: string;
  status: BookingStatus;
  refundAmountMinor: number;
  createdAt: string | Date;
}

export interface CheckInRecord {
  passengerId: string;
  passengerName: string;
  vehicleId: string | null;
  status: "pending" | "checked_in" | "no_show";
}

export interface PaymentRecord {
  id: string;
  bookingId: string | null;
}

function asArray<T>(data: unknown): readonly T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}

export function toBookingRecords(data: unknown): readonly BookingRecord[] {
  return asArray<BookingRecord>(data);
}

export function toCheckInRecords(data: unknown): readonly CheckInRecord[] {
  return asArray<CheckInRecord>(data);
}

/** `getBooking` returns the booking with its boarding passes (check-in records). */
export function toBookingDetail(data: unknown): {
  booking: BookingRecord | undefined;
  checkIns: readonly CheckInRecord[];
} {
  if (!data || typeof data !== "object") return { booking: undefined, checkIns: [] };
  const detail = data as { booking?: BookingRecord; boardingPasses?: unknown };
  return { booking: detail.booking, checkIns: toCheckInRecords(detail.boardingPasses) };
}

export function toPaymentRecords(data: unknown): readonly PaymentRecord[] {
  return asArray<PaymentRecord>(data);
}

/** Minor units and currency as "150.00 EGP". */
export function money(minor: number | null | undefined, currency: string | undefined): string {
  if (minor === null || minor === undefined || !currency) return NO_VALUE;
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

/** A cancelled booking whose refund the gateway has not confirmed yet. */
export function isRefundPending(booking: BookingRecord): boolean {
  return booking.status === "cancelled" && booking.refundAmountMinor > 0;
}

export function BookingStateBadge({ booking }: { booking: BookingRecord }) {
  if (isRefundPending(booking)) {
    return (
      <OrgBadge tone="warn" icon={false}>
        {t("screen.organization.bookings.bookingParts.refundPending")}
      </OrgBadge>
    );
  }
  switch (booking.status) {
    case "confirmed":
      return (
        <OrgBadge tone="ok">{t("screen.organization.bookings.bookingParts.confirmed")}</OrgBadge>
      );
    case "checked_in":
      return (
        <OrgBadge tone="neu">{t("screen.organization.bookings.bookingParts.checkedIn")}</OrgBadge>
      );
    case "completed":
      return (
        <OrgBadge tone="neu">{t("screen.organization.bookings.bookingParts.completed")}</OrgBadge>
      );
    case "pending_payment":
      return (
        <OrgBadge tone="warn">
          {t("screen.organization.bookings.bookingParts.pendingPayment")}
        </OrgBadge>
      );
    case "refunded":
      return (
        <OrgBadge tone="neu">{t("screen.organization.bookings.bookingParts.refunded")}</OrgBadge>
      );
    default:
      return (
        <OrgBadge tone="err">{t("screen.organization.bookings.bookingParts.cancelled")}</OrgBadge>
      );
  }
}

export function PaymentBadge({ booking }: { booking: BookingRecord }) {
  if (isRefundPending(booking)) {
    return (
      <OrgBadge tone="warn">
        {t("screen.organization.bookings.bookingParts.refundInProgress")}
      </OrgBadge>
    );
  }
  if (booking.status === "pending_payment") {
    return <OrgBadge tone="warn">{t("screen.organization.bookings.bookingParts.unpaid")}</OrgBadge>;
  }
  if (booking.status === "refunded") {
    return (
      <OrgBadge tone="neu">{t("screen.organization.bookings.bookingParts.refunded")}</OrgBadge>
    );
  }
  return <OrgBadge tone="ok">{t("screen.organization.bookings.bookingParts.paid")}</OrgBadge>;
}
