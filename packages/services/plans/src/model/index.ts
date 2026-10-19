import type {
  CurrencyCode,
  SubscriptionBillingCycle,
  SubscriptionRecordStatus,
} from "@trips-app/domain";

export type { CurrencyCode, SubscriptionBillingCycle, SubscriptionRecordStatus };

export function computeSubscriptionPeriodEnd(
  start: Date,
  billingCycle: SubscriptionBillingCycle,
): Date {
  const days = billingCycle === "annual" ? 365 : 30;
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
}
