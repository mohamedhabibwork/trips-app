import { DEFAULT_SYSTEM_SETTINGS } from "@trips-app/domain";
import type {
  BookingPassenger,
  BookingStatus,
  CurrencyCode,
  PaymentGatewayCode,
} from "@trips-app/domain";

export type { BookingPassenger, BookingStatus, CurrencyCode, PaymentGatewayCode };

export function generateBookingReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `BK-${Array.from(bytes, (b) => chars[b % chars.length]).join("")}`;
}

export function generateQrCodeToken(bookingRef: string, passengerIndex: number): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `QR-${bookingRef}-${passengerIndex + 1}-${hex}`;
}

export function calculateRefundAmountMinor(
  totalAmountMinor: number,
  departureAt: Date | null,
  now: Date = new Date(),
): number {
  if (!departureAt) {
    return totalAmountMinor;
  }
  const hoursBeforeDeparture = (departureAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  const tiers = [...DEFAULT_SYSTEM_SETTINGS.refundPolicyTiers].sort(
    (a, b) => b.minHoursBeforeDeparture - a.minHoursBeforeDeparture,
  );
  for (const tier of tiers) {
    if (hoursBeforeDeparture >= tier.minHoursBeforeDeparture) {
      return Math.floor((totalAmountMinor * tier.refundPercent) / 100);
    }
  }
  return 0;
}
