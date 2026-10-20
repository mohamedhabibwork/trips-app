// SCR-ORG-67 Billing details (checkout): the plan picked on the choose-plan page
// (?plan=&cycle=), the organization's billing fields and payment method, and the VAT math
// (docs/design/web/OrgCheckout.dc.html). Billing details stay local form state — no procedure
// stores them yet — and the totals are computed from the catalog price with the 15% VAT rate the
// designs specify (the catalog carries no tax field of its own).
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { trackEvent } from "@/utils/analytics";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { OrgChips, OrgInput } from "../common/org-form";
import { orgHref } from "../common/org-routes";
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
import { TotalRow } from "./billing-parts";
import { formatMinor } from "../accounting/finance-format";
import {
  BPS_PER_WHOLE,
  DESIGN_VAT_BPS,
  PlanChangeFailedAlert,
  planDisplayName,
  planPriceMinor,
  toCatalogPlans,
} from "./plan-parts";

const K = "screen.organization.billing.checkout";

type Cycle = "monthly" | "annual";
type PaymentMethod = "card" | "transfer" | "sadad";

function cycleOf(value: string | undefined): Cycle {
  return value === "annual" ? "annual" : "monthly";
}

export function BillingCheckout(): ReactNode {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const search = useSearch({ strict: false }) as {
    plan?: string;
    cycle?: string;
  };

  const [billingName, setBillingName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

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

  const plans = toCatalogPlans(catalogQuery.data);
  const plan = plans.find((entry) => entry.id === search.plan) ?? null;
  const cycle = cycleOf(search.cycle);
  const priceMinor = plan ? planPriceMinor(plan, cycle) : null;
  const currency = plan?.currencyCode ?? "EGP";
  // The catalog carries no tax field, so VAT applies the designs' 15% rate to the catalog price.
  const vatMinor =
    priceMinor === null ? null : Math.round((priceMinor * DESIGN_VAT_BPS) / BPS_PER_WHOLE);
  const trialDays = plan?.trialDays ?? 0;
  const dueTodayMinor = trialDays > 0 ? 0 : (priceMinor ?? 0) + (vatMinor ?? 0);

  const billingComplete =
    billingName.trim().length > 0 && invoiceEmail.trim().length > 0 && vatNumber.trim().length > 0;
  const cardComplete =
    method !== "card" ||
    (cardNumber.trim().length > 0 && cardExpiry.trim().length > 0 && cardCvc.trim().length > 0);
  const canStart = enabled && Boolean(plan) && billingComplete && cardComplete;

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!plan) return;
    changePlanMutation.mutate({ planId: plan.id, billingCycle: cycle });
  }

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={t(`${K}.caption`)}
        badge={
          plan ? (
            <OrgBadge tone="info">
              {t(`${K}.planBadge`, { plan: planDisplayName(plan, locale) })}
            </OrgBadge>
          ) : undefined
        }
        actions={
          <OrgButton variant="secondary" onClick={() => navigate({ to: orgHref("choose-plan") })}>
            {t(`${K}.changePlan`)}
          </OrgButton>
        }
      />
      {catalogQuery.isError ? <OrgError onRetry={() => void catalogQuery.refetch()} /> : null}
      {!enabled ? (
        <OrgLoading rows={5} />
      ) : catalogQuery.isLoading ? (
        <OrgLoading rows={5} />
      ) : !plan ? (
        <OrgCard title={t(`${K}.noPlanTitle`)}>
          <p className="m-0 text-sm leading-5">{t(`${K}.noPlanBody`)}</p>
          <div>
            <OrgButton onClick={() => navigate({ to: orgHref("choose-plan") })}>
              {t(`${K}.goToPlans`)}
            </OrgButton>
          </div>
        </OrgCard>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          <OrgRow align="start">
            <OrgCard title={t(`${K}.billingTitle`)} className="lg:flex-[2]">
              <div className="flex flex-col gap-4">
                <OrgInput
                  label={t(`${K}.billingNameLabel`)}
                  value={billingName}
                  onChange={(change) => setBillingName(change.target.value)}
                />
                <OrgRow align="start">
                  <OrgInput
                    label={t(`${K}.vatNumberLabel`)}
                    hint={t(`${K}.vatNumberHint`)}
                    value={vatNumber}
                    onChange={(change) => setVatNumber(change.target.value)}
                    className="lg:flex-1"
                  />
                  <OrgInput
                    label={t(`${K}.invoiceEmailLabel`)}
                    type="email"
                    value={invoiceEmail}
                    onChange={(change) => setInvoiceEmail(change.target.value)}
                    className="lg:flex-1"
                  />
                </OrgRow>
                <OrgInput
                  label={t(`${K}.addressLabel`)}
                  value={address}
                  onChange={(change) => setAddress(change.target.value)}
                />
                <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.billingNote`)}</p>
              </div>
            </OrgCard>
            <OrgCard title={t(`${K}.summaryTitle`)} className="lg:flex-1">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between gap-3 text-sm leading-5">
                  <b>
                    {t(`${K}.summaryPlan`, {
                      plan: planDisplayName(plan, locale),
                    })}
                  </b>
                  <span>{cycle === "annual" ? t(`${K}.annual`) : t(`${K}.monthly`)}</span>
                </div>
                {priceMinor === null ? (
                  <p className="m-0 text-sm">{NO_VALUE}</p>
                ) : (
                  <>
                    <TotalRow
                      label={t(`${K}.subtotal`)}
                      value={formatMinor(priceMinor, currency, locale)}
                    />
                    <TotalRow
                      label={t(`${K}.vat`, { percent: "15%" })}
                      value={formatMinor(vatMinor ?? 0, currency, locale)}
                    />
                    <TotalRow
                      label={t(`${K}.dueToday`)}
                      value={formatMinor(dueTodayMinor, currency, locale)}
                      strong
                    />
                    <p className="te-caption m-0 text-[var(--te-ink-muted)]">
                      {trialDays > 0
                        ? t(`${K}.trialNote`, {
                            amount: formatMinor(
                              (priceMinor ?? 0) + (vatMinor ?? 0),
                              currency,
                              locale,
                            ),
                            n: trialDays,
                          })
                        : t(`${K}.chargeNote`)}
                    </p>
                    <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.vatNote`)}</p>
                  </>
                )}
              </div>
            </OrgCard>
          </OrgRow>
          <OrgCard title={t(`${K}.paymentTitle`)}>
            <div className="flex flex-col gap-4">
              <OrgChips
                label={t(`${K}.methodLabel`)}
                options={[
                  { value: "card", label: t(`${K}.method.card`) },
                  { value: "transfer", label: t(`${K}.method.transfer`) },
                  { value: "sadad", label: t(`${K}.method.sadad`) },
                ]}
                value={method}
                onValueChange={(value) => setMethod(value as PaymentMethod)}
              />
              {method === "card" ? (
                <OrgRow align="start">
                  <OrgInput
                    label={t(`${K}.cardNumberLabel`)}
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(change) => setCardNumber(change.target.value)}
                    className="lg:flex-[2]"
                  />
                  <OrgInput
                    label={t(`${K}.cardExpiryLabel`)}
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(change) => setCardExpiry(change.target.value)}
                    className="lg:flex-1"
                  />
                  <OrgInput
                    label={t(`${K}.cardCvcLabel`)}
                    inputMode="numeric"
                    value={cardCvc}
                    onChange={(change) => setCardCvc(change.target.value)}
                    className="lg:flex-1"
                  />
                </OrgRow>
              ) : (
                <p className="m-0 text-sm leading-5 text-[var(--te-ink-muted)]">
                  {method === "transfer"
                    ? t(`${K}.method.transferNote`)
                    : t(`${K}.method.sadadNote`)}
                </p>
              )}
              <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.cardNote`)}</p>
            </div>
          </OrgCard>
          {changePlanMutation.isError ? <PlanChangeFailedAlert /> : null}
          <div className="flex flex-col gap-2">
            <div>
              <OrgButton type="submit" disabled={!canStart || changePlanMutation.isPending}>
                {trialDays > 0 ? t(`${K}.startTrial`) : t(`${K}.subscribeNow`)}
              </OrgButton>
            </div>
            <p className="te-caption m-0 text-[var(--te-ink-muted)]">
              {t(`${K}.cycleChangeNote`, {
                plan: planDisplayName(plan, locale),
                cycle: cycle === "annual" ? t(`${K}.annual`) : t(`${K}.monthly`),
              })}
            </p>
          </div>
        </form>
      )}
      {subscriptionQuery.data ? (
        <OrgAlert tone="info" title={t(`${K}.activePlanTitle`)}>
          {t(`${K}.activePlanBody`)}
        </OrgAlert>
      ) : null}
    </OrgPage>
  );
}
