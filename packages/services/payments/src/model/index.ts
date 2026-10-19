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
/** D-30: a gateway callback is expected within 30 seconds of handoff. */
export const PAYMENT_CONFIRM_TIMEOUT_SECONDS = 30;
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

export interface MockGatewayHandoff {
  gateway: PaymentGatewayCode;
  providerReference: string;
  redirectUrl: string;
  method: "GET";
  mock: true;
}

/**
 * Dry-run gateway adapter (NFR-SEC-12): builds the redirect the traveler app would open.
 * No card data ever reaches the server and no network request is made — the URL is only
 * ever handed to the client. Markets: Stripe / Paymob / Tap / Fawry (sandbox endpoints).
 */
export function buildMockGatewayHandoff(
  gateway: PaymentGatewayCode,
  providerReference: string,
): MockGatewayHandoff {
  const hosts: Record<PaymentGatewayCode, string> = {
    stripe: "https://checkout.stripe.com/c/pay",
    paymob: "https://accept.paymob.com/api/acceptance/iframes",
    tap: "https://checkout.tap.company/v2/checkout",
    fawry: "https://atfawry.fawrystaging.com/ECommerceWeb/Fawry/payments/chargewithToken",
    stub: "/mock-gateway/pay",
  };
  return {
    gateway,
    providerReference,
    redirectUrl: `${hosts[gateway]}?ref=${encodeURIComponent(providerReference)}`,
    method: "GET",
    mock: true,
  };
}

export type GatewayCallbackAction =
  | { action: "already_processed" }
  | { action: "apply_success" }
  | { action: "apply_failure" };

/**
 * Idempotency decision for a gateway callback (FR-PAY-02): once a transaction is settled
 * (succeeded / failed / refunded / disputed) any further delivery is a no-op.
 */
export function resolveGatewayCallbackAction(
  currentStatus: PaymentTransactionStatus,
  outcome: "succeeded" | "failed",
): GatewayCallbackAction {
  if (
    currentStatus === "succeeded" ||
    currentStatus === "failed" ||
    currentStatus === "refunded" ||
    currentStatus === "disputed"
  ) {
    return { action: "already_processed" };
  }
  return outcome === "succeeded" ? { action: "apply_success" } : { action: "apply_failure" };
}

/** D-30 helper kept next to the gateway adapter for testability. */
export function paymentConfirmDeadlineSafe(createdAt: Date): Date {
  return new Date(createdAt.getTime() + PAYMENT_CONFIRM_TIMEOUT_SECONDS * 1000);
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
