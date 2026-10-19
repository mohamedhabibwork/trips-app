import type {
  CurrencyCode,
  DisputeResolutionStatus,
  PaymentGatewayCode,
  PaymentPurpose,
  PaymentTransactionStatus,
} from "@trips-app/domain";

export type {
  CurrencyCode,
  DisputeResolutionStatus,
  PaymentGatewayCode,
  PaymentPurpose,
  PaymentTransactionStatus,
};

export const FAWRY_EXPIRY_HOURS = 48;
export const DEFAULT_PLATFORM_COMMISSION_BPS = 1000; // 10%

export function generateProviderReference(gateway: PaymentGatewayCode): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${gateway.toUpperCase()}-${hex.toUpperCase()}`;
}

export function generateFawryReferenceCode(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => (b % 10).toString()).join("");
}

/** The invoice number written to the ledger when a booking payment is confirmed. */
export function invoiceNumberFor(providerReference: string): string {
  return `INV-${providerReference}`;
}

/** A payment has a receipt once money has moved: paid, later refunded, or under dispute. */
export const RECEIPT_STATUSES: readonly PaymentTransactionStatus[] = [
  "succeeded",
  "refunded",
  "disputed",
];

export function hasReceipt(status: PaymentTransactionStatus): boolean {
  return RECEIPT_STATUSES.includes(status);
}

export type ReceiptLineKind = "trip" | "programs" | "discount" | "subscription";

export interface ReceiptLine {
  kind: ReceiptLineKind;
  /** Trip title in both languages for trip lines; null otherwise. */
  titleAr: string | null;
  titleEn: string | null;
  /** Coupon code for a discount line; null otherwise. */
  couponCode: string | null;
  quantity: number;
  /** Signed: a discount is negative. */
  amountMinor: number;
}

export interface ReceiptBookingSource {
  passengersCount: number;
  selectedProgramIds: readonly string[];
  subtotalMinor: number;
  programsTotalMinor: number;
  discountMinor: number;
  couponCode: string | null;
  tripTitleAr: string;
  tripTitleEn: string;
}

/**
 * The receipt lines for a payment: the trip seats, the programs and the coupon discount for a booking,
 * or a single line for a payment with no booking (a subscription upgrade).
 */
export function buildReceiptLines(
  booking: ReceiptBookingSource | null,
  paymentAmountMinor: number,
): ReceiptLine[] {
  if (!booking) {
    return [
      {
        kind: "subscription",
        titleAr: null,
        titleEn: null,
        couponCode: null,
        quantity: 1,
        amountMinor: paymentAmountMinor,
      },
    ];
  }
  const lines: ReceiptLine[] = [
    {
      kind: "trip",
      titleAr: booking.tripTitleAr,
      titleEn: booking.tripTitleEn,
      couponCode: null,
      quantity: booking.passengersCount,
      amountMinor: booking.subtotalMinor,
    },
  ];
  if (booking.programsTotalMinor > 0) {
    lines.push({
      kind: "programs",
      titleAr: null,
      titleEn: null,
      couponCode: null,
      quantity: booking.selectedProgramIds.length,
      amountMinor: booking.programsTotalMinor,
    });
  }
  if (booking.discountMinor > 0) {
    lines.push({
      kind: "discount",
      titleAr: null,
      titleEn: null,
      couponCode: booking.couponCode,
      quantity: 1,
      amountMinor: -booking.discountMinor,
    });
  }
  return lines;
}
