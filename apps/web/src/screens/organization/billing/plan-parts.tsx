// Pieces shared by the plan screens (SCR-ORG-66 to 68): the catalog plan view, the display name
// in the reader's language and the VAT rate the checkout applies. The plan catalog carries prices,
// limits and the annual discount but no tax field, so the checkout labels its VAT as the 15% rate
// the designs specify.
import type { ReactNode } from "react";

import { t } from "@trips-app/i18n";

import { OrgAlert } from "../common/org-ui";

export const PLAN_PARTS_K = "screen.organization.billing.planParts";

/** Basis points in a whole (1500 bps = 15%). */
export const BPS_PER_WHOLE = 10_000;

/** VAT rate the checkout applies, in basis points, because the catalog carries no tax field. */
export const DESIGN_VAT_BPS = 1500;

export interface CatalogPlanView {
  id: string;
  tier: string;
  nameEn: string;
  nameAr: string;
  monthlyPriceMinor: number;
  annualPriceMinor: number;
  currencyCode: string;
  annualDiscountBps: number;
  trialDays: number;
  gracePeriodDays: number;
  features: Record<string, unknown>;
}

/** Catalog rows narrowed to the fields the plan pages read; features arrive as loose JSON. */
export function toCatalogPlans(data: unknown): readonly CatalogPlanView[] {
  if (!Array.isArray(data)) return [];
  return (data as Record<string, unknown>[]).map((plan) => ({
    id: typeof plan.id === "string" ? plan.id : "",
    tier: typeof plan.tier === "string" ? plan.tier : "",
    nameEn: typeof plan.nameEn === "string" ? plan.nameEn : "",
    nameAr: typeof plan.nameAr === "string" ? plan.nameAr : "",
    monthlyPriceMinor: typeof plan.monthlyPriceMinor === "number" ? plan.monthlyPriceMinor : 0,
    annualPriceMinor: typeof plan.annualPriceMinor === "number" ? plan.annualPriceMinor : 0,
    currencyCode: typeof plan.currencyCode === "string" ? plan.currencyCode : "EGP",
    annualDiscountBps: typeof plan.annualDiscountBps === "number" ? plan.annualDiscountBps : 0,
    trialDays: typeof plan.trialDays === "number" ? plan.trialDays : 0,
    gracePeriodDays: typeof plan.gracePeriodDays === "number" ? plan.gracePeriodDays : 0,
    features:
      typeof plan.features === "object" && plan.features !== null
        ? (plan.features as Record<string, unknown>)
        : {},
  }));
}

/** The plan's name in the reader's language, falling back on the other one. */
export function planDisplayName(plan: CatalogPlanView, locale: string): string {
  return (locale === "ar" ? plan.nameAr || plan.nameEn : plan.nameEn || plan.nameAr) || plan.id;
}

/** The price for a billing cycle, in minor units. */
export function planPriceMinor(plan: CatalogPlanView, cycle: "monthly" | "annual"): number {
  return cycle === "annual" ? plan.annualPriceMinor : plan.monthlyPriceMinor;
}

/** Alert for a plan change the API refused; both plan screens share it. */
export function PlanChangeFailedAlert(): ReactNode {
  return (
    <OrgAlert tone="err" title={t(`${PLAN_PARTS_K}.changeFailedTitle`)}>
      {t(`${PLAN_PARTS_K}.changeFailedBody`)}
    </OrgAlert>
  );
}
