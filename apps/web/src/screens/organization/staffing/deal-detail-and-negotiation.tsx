// SCR-ORG-22 Deal detail and negotiation: one supplier deal, its offer history and the response.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgInput } from "../common/org-form";
import { useOrgNavigate, useOrgParams } from "../common/org-link";
import { getSelectedNegotiationId, isoDay, tripTitle } from "../common/org-shared";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgEmpty,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import {
  DealStatusBadge,
  DetailItem,
  formatMinor,
  platformRoleLabel,
  routeText,
} from "./staffing-parts";

const HOUR_MS = 60 * 60 * 1000;
const MIN_OFFER_MINOR = 100;
const OPEN_STATUSES = ["pending_supplier", "countered_by_supplier", "countered_by_org"];

function timeText(value: string | Date | null | undefined): string {
  if (!value) return NO_VALUE;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? NO_VALUE
    : `${isoDay(date)} ${date.toISOString().slice(11, 16)}`;
}

export function DealDetailAndNegotiation() {
  const goTo = useOrgNavigate();
  const queryClient = useQueryClient();
  const { status: authStatus, actor, locale } = useAuth();
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);
  const { dealId: routeDealId } = useOrgParams();
  const dealId = routeDealId ?? getSelectedNegotiationId();
  const [counterInput, setCounterInput] = useState<string | null>(null);
  const [respondFailed, setRespondFailed] = useState(false);

  const negotiationsQuery = useQuery({
    ...orpc.negotiation.listOrganizationNegotiations.queryOptions({ input: {} }),
    enabled,
  });
  const items = negotiationsQuery.data?.items ?? [];
  const deal = (dealId ? items.find((item) => item.id === dealId) : undefined) ?? items[0];

  const tripQuery = useQuery({
    ...orpc.trips.getOrganizationTrip.queryOptions({ input: { tripId: deal?.tripId ?? "" } }),
    enabled: enabled && Boolean(deal?.tripId),
  });
  const suppliersQuery = useQuery({
    ...orpc.onboarding.listOrganizationSuppliers.queryOptions({ input: {} }),
    enabled: enabled && Boolean(deal),
  });

  const respondMutation = useMutation(
    orpc.negotiation.respondToOffer.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.negotiation.key() });
      },
    }),
  );

  const trip = tripQuery.data;
  const supplierName =
    suppliersQuery.data?.suppliers.find((s) => s.supplierAccountId === deal?.supplierAccountId)
      ?.fullName ?? (deal ? platformRoleLabel(deal.supplierRole) : NO_VALUE);
  const plate =
    trip?.vehicles.find((vehicle) => vehicle.vehicleId === deal?.vehicleId)?.plateNumber ??
    NO_VALUE;
  const counterAmount = counterInput ?? (deal ? (deal.currentOfferMinor / 100).toFixed(2) : "");
  const expiresAt = deal ? new Date(deal.expiresAt).getTime() : Number.NaN;
  const hoursLeft = Number.isNaN(expiresAt)
    ? null
    : Math.max(0, Math.ceil((expiresAt - Date.now()) / HOUR_MS));
  const isOpen = deal ? OPEN_STATUSES.includes(deal.status) : false;
  const busy = respondMutation.isPending;

  async function handleRespond(action: "accept" | "counter" | "decline") {
    if (!deal) return;
    setRespondFailed(false);
    try {
      await respondMutation.mutateAsync({
        negotiationId: deal.id,
        action,
        counterOfferMinor:
          action === "counter"
            ? Math.max(MIN_OFFER_MINOR, Math.round((Number.parseFloat(counterAmount) || 0) * 100))
            : undefined,
      });
      if (action === "counter") setCounterInput(null);
      else void goTo("staffing-board");
    } catch {
      setRespondFailed(true);
    }
  }

  if (negotiationsQuery.isLoading) return <OrgLoading rows={6} />;

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.staffing.dealDetailAndNegotiation.dealWith", {
          name: supplierName,
        })}
        caption={
          <span className="flex flex-wrap items-center gap-3">
            {deal ? <DealStatusBadge status={deal.status} /> : null}
            <span>
              {t("screen.organization.staffing.dealDetailAndNegotiation.vehicleLastUpdate", {
                plate,
                time: timeText(deal?.updatedAt),
              })}
            </span>
          </span>
        }
      />
      {negotiationsQuery.isError ? (
        <OrgError onRetry={() => void negotiationsQuery.refetch()} />
      ) : null}
      {!deal && !negotiationsQuery.isError ? (
        <OrgEmpty title={t("screen.organization.staffing.dealDetailAndNegotiation.emptyTitle")}>
          {t("screen.organization.staffing.dealDetailAndNegotiation.emptyBody")}
        </OrgEmpty>
      ) : null}
      {isOpen ? (
        <OrgAlert
          tone="warn"
          title={t("screen.organization.staffing.dealDetailAndNegotiation.expiresInHours", {
            hours: hoursLeft ?? NO_VALUE,
          })}
        >
          {t("screen.organization.staffing.dealDetailAndNegotiation.expiryRule")}
        </OrgAlert>
      ) : null}
      {respondFailed ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.staffing.dealDetailAndNegotiation.respondFailed")}
        />
      ) : null}
      <OrgRow align="start">
        <OrgCard
          title={t("screen.organization.staffing.dealDetailAndNegotiation.dealDetails")}
          className="flex-1"
        >
          <dl className="m-0 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <DetailItem label={t("screen.organization.staffing.dealDetailAndNegotiation.trip")}>
              {trip ? tripTitle(trip, locale) || NO_VALUE : NO_VALUE}
            </DetailItem>
            <DetailItem label={t("screen.organization.staffing.dealDetailAndNegotiation.date")}>
              {isoDay(trip?.startsAt) ?? NO_VALUE}
            </DetailItem>
            <DetailItem label={t("screen.organization.staffing.dealDetailAndNegotiation.route")}>
              {routeText(trip, locale)}
            </DetailItem>
            <DetailItem
              label={t("screen.organization.staffing.dealDetailAndNegotiation.currentPay")}
            >
              {deal ? formatMinor(deal.currentOfferMinor, deal.currencyCode) : NO_VALUE}
            </DetailItem>
          </dl>
          <h3 className="m-0 mt-2 text-base leading-6 font-semibold">
            {t("screen.organization.staffing.dealDetailAndNegotiation.offerHistory")}
          </h3>
          {deal ? (
            <ol
              aria-label={t("screen.organization.staffing.dealDetailAndNegotiation.offerHistory")}
              className="m-0 flex list-none flex-col gap-3 p-0"
            >
              <li className="flex flex-wrap items-center gap-3 text-sm leading-5">
                <OrgBadge tone="neu" icon={false}>
                  {t("screen.organization.staffing.dealDetailAndNegotiation.proposed")}
                </OrgBadge>
                <span>
                  {t("screen.organization.staffing.dealDetailAndNegotiation.organizationProposed", {
                    amount: formatMinor(deal.initialOfferMinor, deal.currencyCode),
                    date: isoDay(deal.createdAt) ?? NO_VALUE,
                  })}
                </span>
              </li>
              {deal.roundsCount > 1 ? (
                <li className="flex flex-wrap items-center gap-3 text-sm leading-5">
                  <OrgBadge tone="warn">
                    {deal.lastOfferedBy === "supplier"
                      ? t(
                          "screen.organization.staffing.dealDetailAndNegotiation.counteredByProvider",
                        )
                      : t(
                          "screen.organization.staffing.dealDetailAndNegotiation.counteredByOrganization",
                        )}
                  </OrgBadge>
                  <span>
                    {deal.lastOfferedBy === "supplier"
                      ? t(
                          "screen.organization.staffing.dealDetailAndNegotiation.providerCountered",
                          {
                            amount: formatMinor(deal.currentOfferMinor, deal.currencyCode),
                            date: isoDay(deal.updatedAt) ?? NO_VALUE,
                          },
                        )
                      : t(
                          "screen.organization.staffing.dealDetailAndNegotiation.organizationCountered",
                          {
                            amount: formatMinor(deal.currentOfferMinor, deal.currencyCode),
                            date: isoDay(deal.updatedAt) ?? NO_VALUE,
                          },
                        )}
                  </span>
                </li>
              ) : null}
            </ol>
          ) : (
            <p className="te-caption m-0 text-[var(--te-ink-muted)]">{NO_VALUE}</p>
          )}
        </OrgCard>
        <OrgCard
          title={t("screen.organization.staffing.dealDetailAndNegotiation.yourResponse")}
          className="flex-1"
        >
          <OrgInput
            label={t("screen.organization.staffing.dealDetailAndNegotiation.counterAmount")}
            inputMode="decimal"
            value={counterAmount}
            onChange={(event) => setCounterInput(event.target.value)}
            disabled={!isOpen}
          />
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t("screen.organization.staffing.dealDetailAndNegotiation.counterVoidsAcceptance")}
          </p>
          <div className="mt-2 flex flex-wrap justify-between gap-3">
            <OrgButton
              variant="danger"
              disabled={!isOpen || busy}
              onClick={() => void handleRespond("decline")}
            >
              {t("screen.organization.staffing.dealDetailAndNegotiation.rejectDeal")}
            </OrgButton>
            <div className="flex flex-wrap gap-3">
              <OrgButton
                variant="secondary"
                disabled={!isOpen || busy}
                onClick={() => void handleRespond("accept")}
              >
                {t("screen.organization.staffing.dealDetailAndNegotiation.acceptOffer")}
              </OrgButton>
              <OrgButton disabled={!isOpen || busy} onClick={() => void handleRespond("counter")}>
                {t("screen.organization.staffing.dealDetailAndNegotiation.sendCounter")}
              </OrgButton>
            </div>
          </div>
        </OrgCard>
      </OrgRow>
    </OrgPage>
  );
}
