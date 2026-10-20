// SCR-ORG-68 Plan ended (dashboard locked): the renewal failed and the grace period is over
// (docs/design/web/OrgPaywall.dc.html). The state comes from plans.getOrganizationSubscription and
// the renewal path is plans.changeOrganizationPlan; data is kept, so the copy says picking a plan
// reopens everything.
import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";
import { cn } from "@trips-app/ui/lib/utils";

import { useAuth } from "@/auth/auth-context";
import { trackEvent } from "@/utils/analytics";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { formatDate, formatMinor, intlLocale } from "../accounting/finance-format";
import {
  BPS_PER_WHOLE,
  PlanChangeFailedAlert,
  planDisplayName,
  planPriceMinor,
  toCatalogPlans,
} from "./plan-parts";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { orgHref } from "../common/org-routes";

const K = "screen.organization.billing.planEnded";

type Cycle = "monthly" | "annual";

/** What stays available while the dashboard is locked, from the design. */
const STILL_AVAILABLE_KEYS = ["viewBookings", "downloadInvoices", "contactSupport"] as const;
/** What is locked until a plan is chosen, from the design. */
const LOCKED_KEYS = ["createTrips", "publishTrips", "campaigns", "analytics"] as const;

export function PlanEnded(): ReactNode {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const [cycle, setCycle] = useState<Cycle | null>(null);

  const subscriptionQuery = useQuery({
    ...serverQueryOptions(
      orpc.plans.getOrganizationSubscription,
      "plans/getOrganizationSubscription",
      {
        input: undefined,
      },
    ),
    enabled,
  });
  const catalogQuery = useQuery({
    ...serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", {
      input: { role: "organization" },
    }),
    enabled,
  });

  const changePlanMutation = useMutation(
    serverMutationOptions(orpc.plans.changeOrganizationPlan, "plans/changeOrganizationPlan", {
      onSuccess: () => {
        trackEvent("subscription_plan_changed", { surface: "organization" });
        void queryClient.invalidateQueries({ queryKey: orpc.plans.key() });
      },
      onError: () =>
        trackEvent("subscription_plan_change_failed", {
          surface: "organization",
        }),
    }),
  );

  const plans = toCatalogPlans(catalogQuery.data);
  const sub = subscriptionQuery.data;
  const currentPlan = plans.find((plan) => plan.id === sub?.planId) ?? null;
  const activeCycle: Cycle = cycle ?? (sub?.billingCycle === "annual" ? "annual" : "monthly");
  const endedOn = sub ? formatDate(sub.currentPeriodEnd, locale) : NO_VALUE;
  const percent =
    plans[0] === undefined
      ? ""
      : new Intl.NumberFormat(intlLocale(locale), { style: "percent" }).format(
          plans[0].annualDiscountBps / BPS_PER_WHOLE,
        );

  const pick = (planId: string | null) => {
    if (!planId) return;
    changePlanMutation.mutate({ planId, billingCycle: activeCycle });
  };

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={t(`${K}.caption`, { date: endedOn })}
        badge={<OrgBadge tone="err">{t(`${K}.lockedBadge`)}</OrgBadge>}
      />
      {subscriptionQuery.isError || catalogQuery.isError ? (
        <OrgError
          onRetry={() => {
            void subscriptionQuery.refetch();
            void catalogQuery.refetch();
          }}
        />
      ) : null}
      <OrgAlert tone="warn" title={t(`${K}.explainTitle`, { date: endedOn })}>
        {t(`${K}.explainBody`)}
      </OrgAlert>
      <div className="flex flex-wrap gap-2">
        {(["monthly", "annual"] as const).map((value) => {
          const pressed = value === activeCycle;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={pressed}
              onClick={() => setCycle(value)}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-5 py-2 text-sm leading-5 font-semibold",
                pressed
                  ? "border-[var(--te-accent)] bg-[var(--te-accent)] text-[var(--te-brand-navy)]"
                  : "border-[var(--te-control-border)] bg-[var(--te-surface-raised)] text-[var(--te-ink)]",
              )}
            >
              {value === "monthly"
                ? t(`${K}.monthly`)
                : percent
                  ? t(`${K}.annual`, { discount: percent })
                  : t(`${K}.annualPlain`)}
            </button>
          );
        })}
      </div>
      {subscriptionQuery.isLoading || catalogQuery.isLoading ? (
        <OrgLoading rows={5} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan?.id;
            return (
              <div
                key={plan.id}
                className="flex min-w-0 flex-col gap-3 rounded-xl border border-[var(--te-hairline)] bg-[var(--te-surface-raised)] p-6 shadow-[var(--te-card-shadow)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <b className="text-xl leading-7 font-semibold">{planDisplayName(plan, locale)}</b>
                  {isCurrent ? <OrgBadge tone="acc">{t(`${K}.currentBadge`)}</OrgBadge> : null}
                </div>
                <div className="text-[28px] leading-9 font-semibold">
                  {formatMinor(planPriceMinor(plan, activeCycle), plan.currencyCode, locale)}
                </div>
                <p className="te-caption m-0 text-[var(--te-ink-muted)]">
                  {activeCycle === "annual" ? t(`${K}.perYear`) : t(`${K}.perMonth`)}
                </p>
                <div className="mt-auto">
                  <OrgButton
                    className="w-full"
                    disabled={changePlanMutation.isPending}
                    onClick={() => pick(plan.id)}
                  >
                    {t(`${K}.pickPlan`, {
                      plan: planDisplayName(plan, locale),
                    })}
                  </OrgButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {changePlanMutation.isError ? <PlanChangeFailedAlert /> : null}
      {changePlanMutation.isSuccess ? (
        <OrgAlert tone="ok" title={t(`${K}.reopenedTitle`)}>
          {t(`${K}.reopenedBody`)}
        </OrgAlert>
      ) : null}
      <OrgRow align="start">
        <OrgCard title={t(`${K}.stillAvailableTitle`)} className="lg:flex-1">
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm leading-5">
            {STILL_AVAILABLE_KEYS.map((key) => (
              <li key={key}>{t(`${K}.available.${key}`)}</li>
            ))}
          </ul>
        </OrgCard>
        <OrgCard title={t(`${K}.lockedTitle`)} className="lg:flex-1">
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm leading-5">
            {LOCKED_KEYS.map((key) => (
              <li key={key}>{t(`${K}.lockedItem.${key}`)}</li>
            ))}
          </ul>
        </OrgCard>
      </OrgRow>
      <div className="flex flex-wrap gap-3">
        <OrgButton
          variant="secondary"
          onClick={() => navigate({ to: orgHref("subscription-and-billing") })}
        >
          {t(`${K}.updatePayment`)}
        </OrgButton>
        <OrgButton variant="secondary" onClick={() => navigate({ to: orgHref("support") })}>
          {t(`${K}.contactSales`)}
        </OrgButton>
      </div>
      <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.dataKeptNote`)}</p>
    </OrgPage>
  );
}
