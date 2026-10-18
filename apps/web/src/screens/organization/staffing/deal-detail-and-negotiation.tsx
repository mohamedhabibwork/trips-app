import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeTimeline, type TeTimelineItem } from "@trips-app/ui/components/te-timeline";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import {
  getActiveWizardTripId,
  getSelectedNegotiationId,
  OrgSection,
  StateBadge,
} from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

export function DealDetailAndNegotiation() {
  const goTo = useOrgNavigate();
  const queryClient = useQueryClient();
  const { status: authStatus, actor } = useAuth();
  const [counterAmount, setCounterAmount] = useState("");
  const [currency, setCurrency] = useState("SAR");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wizardTripId = getActiveWizardTripId() ?? undefined;

  const negotiationsQuery = useQuery(
    orpc.negotiation.listOrganizationNegotiations.queryOptions({
      input: { tripId: wizardTripId },
      enabled: authStatus === "authenticated" && Boolean(actor?.activeTenantId),
    }),
  );

  const selectedId = getSelectedNegotiationId();
  const deal = useMemo(() => {
    return (
      (selectedId ? negotiationsQuery.data?.items.find((d) => d.id === selectedId) : undefined) ??
      negotiationsQuery.data?.items[0]
    );
  }, [negotiationsQuery.data, selectedId]);

  const tripDetailQuery = useQuery(
    orpc.trips.getOrganizationTrip.queryOptions({
      input: { tripId: deal?.tripId ?? "" },
      enabled: authStatus === "authenticated" && Boolean(deal?.tripId),
    }),
  );

  useEffect(() => {
    if (deal) {
      setCurrency(deal.currencyCode);
      setCounterAmount((deal.currentOfferMinor / 100).toFixed(2));
    }
  }, [deal]);

  const respondMutation = useMutation(
    orpc.negotiation.respondToOffer.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.negotiation.key() });
      },
    }),
  );

  const statusLabel =
    deal?.status ?? t("screen.organization.staffing.dealDetailAndNegotiation.proposed");
  const payLabel = deal ? `${(deal.currentOfferMinor / 100).toFixed(2)} ${deal.currencyCode}` : "—";

  const tripDetail = tripDetailQuery.data;
  const tripLabel = tripDetail ? tripDetail.titleEn || tripDetail.titleAr : "—";
  const originName = tripDetail?.origin?.nameEn ?? "";
  const destName = tripDetail?.destinations[0]?.nameEn ?? "";
  const routeLabel = originName && destName ? `${originName} → ${destName}` : originName || "—";
  const dateLabel = tripDetail?.startsAt
    ? new Date(tripDetail.startsAt).toISOString().slice(0, 10)
    : "—";

  const historyItems = useMemo<readonly TeTimelineItem[]>(() => {
    if (!deal) return [];
    return [
      {
        id: `${deal.id}-init`,
        time: new Date(deal.createdAt).toLocaleString(),
        label: `${t("screen.organization.staffing.dealDetailAndNegotiation.proposedByTheOrganization")} (${(deal.initialOfferMinor / 100).toFixed(2)} ${deal.currencyCode})`,
        state: deal.roundsCount === 1 ? "current" : "done",
      },
      ...(deal.roundsCount > 1
        ? [
            {
              id: `${deal.id}-latest`,
              time: new Date(deal.updatedAt).toLocaleString(),
              label: `Latest offer by ${deal.lastOfferedBy}: ${(deal.currentOfferMinor / 100).toFixed(2)} ${deal.currencyCode}`,
              state: "current" as const,
            },
          ]
        : []),
    ];
  }, [deal]);

  async function handleRespond(action: "accept" | "counter" | "decline") {
    if (authStatus === "authenticated" && deal?.id) {
      setErrorMsg(null);
      try {
        const counterOfferMinor =
          action === "counter"
            ? Math.max(100, Math.round((Number.parseFloat(counterAmount) || 0) * 100))
            : undefined;
        await respondMutation.mutateAsync({
          negotiationId: deal.id,
          action,
          counterOfferMinor,
        });
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not respond to offer.");
        return;
      }
    }
    if (action !== "counter") {
      void goTo("staffing-board");
    }
  }

  const busy = respondMutation.isPending;

  const summaryItems = [
    {
      label: t("screen.organization.staffing.dealDetailAndNegotiation.trip"),
      value: tripLabel,
    },
    {
      label: t("screen.organization.staffing.dealDetailAndNegotiation.route"),
      value: routeLabel,
    },
    {
      label: t("screen.organization.staffing.dealDetailAndNegotiation.date"),
      value: dateLabel,
    },
    {
      label: t("screen.organization.staffing.dealDetailAndNegotiation.pay"),
      value: payLabel,
    },
  ];

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "staffing-board",
            label: t("screen.organization.staffing.dealDetailAndNegotiation.backToStaffingBoard"),
          }}
        />
        <TePageHeader
          title={t(
            "screen.organization.staffing.dealDetailAndNegotiation.dealDetailAndNegotiation",
          )}
          actions={<StateBadge tone="info" icon="clock" label={statusLabel} />}
        />
        {errorMsg ? <TeInlineAlert tone="error">{errorMsg}</TeInlineAlert> : null}
        <TeCard>
          <dl className="grid gap-4 sm:grid-cols-2">
            {summaryItems.map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <dt className="te-label">{item.label}</dt>
                <dd className="te-body">{item.value}</dd>
              </div>
            ))}
          </dl>
        </TeCard>
        <TeInlineAlert tone="info">
          {t("screen.organization.staffing.dealDetailAndNegotiation.theDealExpires72Hours")}
        </TeInlineAlert>
        <OrgSection title={t("screen.organization.staffing.dealDetailAndNegotiation.offerHistory")}>
          <TeTimeline
            items={historyItems}
            ariaLabel={t(
              "screen.organization.staffing.dealDetailAndNegotiation.offerHistoryAriaLabel",
            )}
          />
        </OrgSection>
        <OrgSection title={t("screen.organization.staffing.dealDetailAndNegotiation.counterOffer")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TeInput
              label={t("screen.organization.staffing.dealDetailAndNegotiation.counterAmount")}
              placeholder={t("screen.organization.staffing.dealDetailAndNegotiation.amount")}
              inputMode="decimal"
              value={counterAmount}
              onChange={(e) => setCounterAmount(e.target.value)}
            />
            <TeInput
              label={t("screen.organization.staffing.dealDetailAndNegotiation.currency")}
              placeholder={t("screen.organization.staffing.dealDetailAndNegotiation.currencyCode")}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
        </OrgSection>
        <div className="flex flex-wrap justify-end gap-3">
          <TeButton variant="ghost" disabled={busy} onClick={() => void handleRespond("decline")}>
            {t("screen.organization.staffing.dealDetailAndNegotiation.reject")}
          </TeButton>
          <TeButton
            variant="secondary"
            disabled={busy}
            onClick={() => void handleRespond("counter")}
          >
            {t("screen.organization.staffing.dealDetailAndNegotiation.counter")}
          </TeButton>
          <TeButton disabled={busy} onClick={() => void handleRespond("accept")}>
            {t("screen.organization.staffing.dealDetailAndNegotiation.accept")}
          </TeButton>
        </div>
      </div>
    </StatePreview>
  );
}
