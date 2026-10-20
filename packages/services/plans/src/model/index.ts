import {
  CURRENCY_CODES,
  type CurrencyCode,
  PLAN_CATALOG_STATUSES,
  type PlanCatalogStatus,
  SUBSCRIPTION_BILLING_CYCLES,
  type SubscriptionBillingCycle,
  SUBSCRIPTION_RECORD_STATUSES,
  type SubscriptionRecordStatus,
  SUBSCRIPTION_ROLES,
  type SubscriptionRole,
  SUBSCRIPTION_SCOPES,
  type SubscriptionScope,
} from "@trips-app/domain";

export {
  CURRENCY_CODES,
  type CurrencyCode,
  PLAN_CATALOG_STATUSES,
  type PlanCatalogStatus,
  SUBSCRIPTION_BILLING_CYCLES,
  type SubscriptionBillingCycle,
  SUBSCRIPTION_RECORD_STATUSES,
  type SubscriptionRecordStatus,
  SUBSCRIPTION_ROLES,
  type SubscriptionRole,
  SUBSCRIPTION_SCOPES,
  type SubscriptionScope,
};

export function computeSubscriptionPeriodEnd(
  start: Date,
  billingCycle: SubscriptionBillingCycle,
): Date {
  const days = billingCycle === "annual" ? 365 : 30;
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
}
