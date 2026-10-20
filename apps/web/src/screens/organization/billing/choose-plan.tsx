// SCR-ORG-66 Choose a plan: the plan cards an approved organization picks from before its
// dashboard opens (docs/design/web/OrgPlan.dc.html). Prices and the annual discount come from
// plans.getCatalog; the selection continues to the checkout with ?plan=&cycle=.
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

import { orgHref } from "../common/org-routes";
import {
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
} from "../common/org-ui";
import { formatMinor, intlLocale } from "../accounting/finance-format";
import {
  BPS_PER_WHOLE,
  PlanChangeFailedAlert,
  planDisplayName,
  planPriceMinor,
  toCatalogPlans,
  type CatalogPlanView,
} from "./plan-parts";

const K = "screen.organization.billing.choosePlan";

type Cycle = "monthly" | "annual";

export function ChoosePlan(): ReactNode {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const catalogQuery = useQuery({
    ...serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", {
      input: { role: "organization" },
    }),
    enabled,
  });
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

  const changePlanMutation = useMutation(
    serverMutationOptions(orpc.plans.changeOrganizationPlan, "plans/changeOrganizationPlan", {
      onSuccess: () => {
        trackEvent("subscription_plan_changed", { surface: "organization" });
        void queryClient.invalidateQueries({ queryKey: orpc.plans.key() });
        navigate({ to: orgHref("subscription-and-billing") });
      },
      onError: () =>
        trackEvent("subscription_plan_change_failed", {
          surface: "organization",
        }),
    }),
  );

  const plans = toCatalogPlans(catalogQuery.data).filter((plan) => plan.id.length > 0);
  const existing = subscriptionQuery.data;
  const selectedPlan = plans.find((plan) => plan.id === selectedId) ?? null;

  const continueToCheckout = () => {
    if (!selectedPlan) return;
    navigate({
      to: orgHref("billing-checkout"),
      search: { plan: selectedPlan.id, cycle },
    });
  };

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={t(`${K}.caption`)}
        badge={<OrgBadge tone="ok">{t(`${K}.approvedBadge`)}</OrgBadge>}
      />
      {catalogQuery.isError || subscriptionQuery.isError ? (
        <OrgError
          onRetry={() => {
            void catalogQuery.refetch();
            void subscriptionQuery.refetch();
          }}
        />
      ) : null}
      {existing ? (
        <OrgAlert tone="info" title={t(`${K}.activePlanTitle`)}>
          {t(`${K}.activePlanBody`)}
        </OrgAlert>
      ) : null}
      <OrgChipsCycle cycle={cycle} onCycle={setCycle} discountBps={plans[0]?.annualDiscountBps} />
      {catalogQuery.isLoading ? (
        <OrgLoading rows={5} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const selected = plan.id === selectedPlan?.id;
            return (
              <div
                key={plan.id}
                className={cn(
                  "flex min-w-0 flex-col gap-4 rounded-xl border bg-[var(--te-surface-raised)] p-6 shadow-[var(--te-card-shadow)]",
                  selected ? "border-[var(--te-accent)]" : "border-[var(--te-hairline)]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <b className="text-xl leading-7 font-semibold">{planDisplayName(plan, locale)}</b>
                  {plan.trialDays > 0 ? (
                    <OrgBadge tone="acc" icon={false}>
                      {t(`${K}.trialBadge`, { n: plan.trialDays })}
                    </OrgBadge>
                  ) : null}
                </div>
                <div className="text-[28px] leading-9 font-semibold">
                  {formatMinor(planPriceMinor(plan, cycle), plan.currencyCode, locale)}
                  <span className="te-caption ms-2 font-normal text-[var(--te-ink-muted)]">
                    {cycle === "annual" ? t(`${K}.perYear`) : t(`${K}.perMonth`)}
                  </span>
                </div>
                <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm leading-5">
                  {featureLines(plan).map((line) => (
                    <li key={line.key}>
                      {line.value === true
                        ? t(`${K}.featureYes`, {
                            feature: t(`${PLAN_FEATURE_K}.${line.key}`),
                          })
                        : line.value === false
                          ? t(`${K}.featureNo`, {
                              feature: t(`${PLAN_FEATURE_K}.${line.key}`),
                            })
                          : t(`${K}.featureValue`, {
                              feature: t(`${PLAN_FEATURE_K}.${line.key}`),
                              value: String(line.value),
                            })}
                    </li>
                  ))}
                </ul>
                <div>
                  <OrgButton
                    variant={selected ? "primary" : "secondary"}
                    className="w-full"
                    onClick={() => setSelectedId(plan.id)}
                    aria-pressed={selected}
                  >
                    {selected
                      ? t(`${K}.selected`)
                      : t(`${K}.pickPlan`, {
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
      <div className="flex flex-col gap-2">
        <div>
          <OrgButton disabled={!selectedPlan} onClick={continueToCheckout}>
            {selectedPlan
              ? t(`${K}.continue`, {
                  plan: planDisplayName(selectedPlan, locale),
                })
              : t(`${K}.continuePickFirst`)}
          </OrgButton>
        </div>
        <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.cycleNote`)}</p>
      </div>
    </OrgPage>
  );
}

const PLAN_FEATURE_K = "screen.organization.billing.planParts.feature";

/** The boolean/numeric features the catalog carries, in a stable display order. */
const FEATURE_KEYS = ["platformSuppliers", "seatSelfSelection", "childTracking"] as const;

function featureLines(plan: CatalogPlanView): { key: string; value: unknown }[] {
  return FEATURE_KEYS.filter((key) => key in plan.features).map((key) => ({
    key,
    value: plan.features[key],
  }));
}

function OrgChipsCycle({
  cycle,
  onCycle,
  discountBps,
}: {
  cycle: Cycle;
  onCycle: (cycle: Cycle) => void;
  discountBps: number | undefined;
}): ReactNode {
  const { locale } = useAuth();
  const percent =
    discountBps === undefined
      ? ""
      : new Intl.NumberFormat(intlLocale(locale), { style: "percent" }).format(
          discountBps / BPS_PER_WHOLE,
        );
  return (
    <div role="group" aria-label={t(`${K}.cycleLabel`)} className="flex flex-wrap gap-2">
      {(["monthly", "annual"] as const).map((value) => {
        const pressed = value === cycle;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={pressed}
            onClick={() => onCycle(value)}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full border px-5 py-2 text-sm leading-5 font-semibold",
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
  );
}
