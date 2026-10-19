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
