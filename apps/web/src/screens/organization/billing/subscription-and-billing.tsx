// SCR-ORG-33 Subscription and billing: the plan, usage against its limits, and billing.
import { useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgChips, OrgChoice } from "../common/org-form";
import { toTripState, type TripState } from "../common/org-shared";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgError,
  OrgPage,
  OrgPageHeader,
  OrgRow,
  type OrgTone,
} from "../common/org-ui";
import { formatDate, formatMinor, intlLocale } from "../accounting/finance-format";
import { UsageRow } from "./billing-parts";

const INACTIVE_STATES: readonly TripState[] = ["Draft", "Cancelled", "Archived", "Completed"];
/** Basis points in a whole (1500 bps = 15%). */
const BPS_PER_WHOLE = 10_000;

type BillingCycle = "monthly" | "annual";

/** Plan limits a page shows; null means unlimited. */
interface PlanLimits {
  activeTripsPerMonth: number | null;
  vehiclesPerTrip: number | null;
  programsPerTrip: number | null;
  employeesMax: number | null;
  activeCouponsMax: number | null;
}

interface CatalogPlan {
  id: string;
  nameEn: string;
  nameAr: string;
  monthlyPriceMinor: number;
  annualPriceMinor: number;
  currencyCode: string;
  annualDiscountBps: number;
  limits: PlanLimits;
}

/** Plan limits arrive as untyped JSON; a missing or non-numeric limit reads as unlimited. */
function toPlanLimits(json: unknown): PlanLimits {
  const source = typeof json === "object" && json !== null ? (json as Record<string, unknown>) : {};
  const limit = (key: keyof PlanLimits): number | null => {
    const value = source[key];
    return typeof value === "number" ? value : null;
  };
  return {
    activeTripsPerMonth: limit("activeTripsPerMonth"),
    vehiclesPerTrip: limit("vehiclesPerTrip"),
    programsPerTrip: limit("programsPerTrip"),
    employeesMax: limit("employeesMax"),
    activeCouponsMax: limit("activeCouponsMax"),
  };
}

function statusBadge(status: string | undefined) {
  const tones: Record<string, { tone: OrgTone; label: string }> = {
    active: { tone: "ok", label: t("screen.organization.billing.subscriptionAndBilling.active") },
    trialing: {
      tone: "info",
      label: t("screen.organization.billing.subscriptionAndBilling.trial"),
    },
    past_due: {
      tone: "warn",
      label: t("screen.organization.billing.subscriptionAndBilling.pastDue"),
    },
    cancelled: {
      tone: "err",
      label: t("screen.organization.billing.subscriptionAndBilling.cancelled"),
    },
  };
  const entry = status ? tones[status] : undefined;
  return entry ? <OrgBadge tone={entry.tone}>{entry.label}</OrgBadge> : null;
}

export function SubscriptionAndBilling() {
  const queryClient = useQueryClient();
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const panelId = useId();
  const [cycle, setCycle] = useState<BillingCycle | null>(null);
  const [changeOpen, setChangeOpen] = useState(false);
  const [chosenPlanId, setChosenPlanId] = useState<string | null>(null);

  const subscriptionQuery = useQuery(
    orpc.plans.getOrganizationSubscription.queryOptions({ input: undefined, enabled }),
  );
  const catalogQuery = useQuery(
    orpc.plans.getCatalog.queryOptions({ input: { role: "organization" }, enabled }),
  );
  const tripsQuery = useQuery(
    orpc.trips.listOrganizationTrips.queryOptions({ input: {}, enabled }),
  );
  const employeesQuery = useQuery(orpc.employees.list.queryOptions({ input: {}, enabled }));
  const couponsQuery = useQuery(
    orpc.coupons.listOrganizationCoupons.queryOptions({ input: {}, enabled }),
  );

  const changePlanMutation = useMutation(
    orpc.plans.changeOrganizationPlan.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.plans.key() });
        setChangeOpen(false);
      },
    }),
  );

  const sub = subscriptionQuery.data;
  const plans: readonly CatalogPlan[] = (catalogQuery.data ?? []).map((plan) => ({
    ...plan,
    limits: toPlanLimits(plan.limits),
  }));
  const currentPlan = plans.find((plan) => plan.id === sub?.planId);
  const activeCycle: BillingCycle =
    cycle ?? (sub?.billingCycle === "annual" ? "annual" : "monthly");
  const planName = (plan: CatalogPlan) =>
    locale === "ar" ? plan.nameAr || plan.nameEn : plan.nameEn || plan.nameAr;
  const periodEnd = sub ? formatDate(sub.currentPeriodEnd, locale) : NO_VALUE;
  const discountBps = currentPlan?.annualDiscountBps ?? plans[0]?.annualDiscountBps;
  const discount =
    discountBps === undefined
      ? NO_VALUE
      : new Intl.NumberFormat(intlLocale(locale), { style: "percent" }).format(
          discountBps / BPS_PER_WHOLE,
        );

  const trips = tripsQuery.data?.items ?? [];
  const limits = currentPlan?.limits;
  const activeTrips = tripsQuery.isSuccess
    ? trips.filter((trip) => !INACTIVE_STATES.includes(toTripState(trip.state))).length
    : null;
  const vehiclesPerTrip = tripsQuery.isSuccess
    ? trips.reduce((max, trip) => Math.max(max, trip.vehicles.length), 0)
    : null;
  const employees = employeesQuery.data?.employees.length ?? null;
  const activeCoupons = couponsQuery.isSuccess
    ? (couponsQuery.data?.items ?? []).filter((coupon) => coupon.status === "active").length
    : null;

  const selectedPlanId = chosenPlanId ?? sub?.planId ?? "";
  const canConfirm =
    enabled &&
    Boolean(selectedPlanId) &&
    !changePlanMutation.isPending &&
    (selectedPlanId !== sub?.planId || activeCycle !== sub?.billingCycle);

  const planPrice = (plan: CatalogPlan) =>
    formatMinor(
      activeCycle === "annual" ? plan.annualPriceMinor : plan.monthlyPriceMinor,
      plan.currencyCode,
      locale,
    );

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.billing.subscriptionAndBilling.title")}
        caption={t("screen.organization.billing.subscriptionAndBilling.caption")}
        actions={
          <OrgButton
            aria-expanded={changeOpen}
            aria-controls={panelId}
            disabled={!enabled}
            onClick={() => setChangeOpen((open) => !open)}
          >
            {t("screen.organization.billing.subscriptionAndBilling.changePlan")}
          </OrgButton>
        }
      />
      {subscriptionQuery.isError || catalogQuery.isError ? (
        <OrgError
          onRetry={() => {
            void subscriptionQuery.refetch();
            void catalogQuery.refetch();
          }}
        />
      ) : null}
      {changeOpen ? (
        <OrgCard title={t("screen.organization.billing.subscriptionAndBilling.choosePlan")}>
          <div id={panelId} className="flex flex-col gap-2">
            <fieldset className="m-0 flex flex-col border-0 p-0">
              <legend className="sr-only">
                {t("screen.organization.billing.subscriptionAndBilling.choosePlan")}
              </legend>
              {plans.map((plan) => (
                <OrgChoice
                  key={plan.id}
                  type="radio"
                  name="organization-plan"
                  checked={plan.id === selectedPlanId}
                  onChange={() => setChosenPlanId(plan.id)}
                >
                  {t("screen.organization.billing.subscriptionAndBilling.planWithPrice", {
                    plan: planName(plan),
                    price: planPrice(plan),
                  })}
                </OrgChoice>
              ))}
            </fieldset>
            {changePlanMutation.isError ? (
              <OrgAlert
                tone="err"
                title={t("screen.organization.billing.subscriptionAndBilling.changeFailed")}
              />
            ) : null}
            <div className="flex flex-wrap justify-end gap-3">
              <OrgButton variant="text" onClick={() => setChangeOpen(false)}>
                {t("screen.organization.billing.subscriptionAndBilling.cancel")}
              </OrgButton>
              <OrgButton
                disabled={!canConfirm}
                onClick={() =>
                  changePlanMutation.mutate({ planId: selectedPlanId, billingCycle: activeCycle })
                }
              >
                {t("screen.organization.billing.subscriptionAndBilling.confirmPlanChange")}
              </OrgButton>
            </div>
          </div>
        </OrgCard>
      ) : null}
      <OrgRow align="start">
        <OrgCard
          className="flex-1"
          title={t("screen.organization.billing.subscriptionAndBilling.currentPlan")}
          actions={statusBadge(sub?.status)}
        >
          <div className="text-[28px] leading-9 font-semibold">
            {currentPlan ? planName(currentPlan) : (sub?.tier ?? NO_VALUE)}
          </div>
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t("screen.organization.billing.subscriptionAndBilling.renewsOn", { date: periodEnd })}
          </p>
          <OrgChips
            label={t("screen.organization.billing.subscriptionAndBilling.billingCycle")}
            options={[
              {
                value: "monthly",
                label: t("screen.organization.billing.subscriptionAndBilling.monthly"),
              },
              {
                value: "annual",
                label: t("screen.organization.billing.subscriptionAndBilling.annual"),
              },
            ]}
            value={activeCycle}
            onValueChange={(value) => setCycle(value === "annual" ? "annual" : "monthly")}
          />
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t("screen.organization.billing.subscriptionAndBilling.annualBillingSaves", {
              discount,
            })}
          </p>
        </OrgCard>
        <OrgCard
          className="flex-1"
          title={t("screen.organization.billing.subscriptionAndBilling.usageAgainstLimits")}
        >
          <UsageRow
            label={t("screen.organization.billing.subscriptionAndBilling.activeTripsThisMonth")}
            used={activeTrips}
            limit={limits?.activeTripsPerMonth}
          />
          <UsageRow
            label={t("screen.organization.billing.subscriptionAndBilling.employees")}
            used={employees}
            limit={limits?.employeesMax}
          />
          <UsageRow
            label={t("screen.organization.billing.subscriptionAndBilling.vehiclesPerTrip")}
            used={vehiclesPerTrip}
            limit={limits?.vehiclesPerTrip}
          />
          <UsageRow
            label={t("screen.organization.billing.subscriptionAndBilling.programsPerTrip")}
            used={null}
            limit={limits?.programsPerTrip}
          />
          <UsageRow
            label={t("screen.organization.billing.subscriptionAndBilling.coupons")}
            used={activeCoupons}
            limit={limits?.activeCouponsMax}
          />
        </OrgCard>
      </OrgRow>
      <OrgAlert
        tone="info"
        title={t("screen.organization.billing.subscriptionAndBilling.upgradesApplyAtOnce")}
      >
        {t("screen.organization.billing.subscriptionAndBilling.downgradesTakeEffect", {
          date: periodEnd,
        })}
      </OrgAlert>
    </OrgPage>
  );
}
