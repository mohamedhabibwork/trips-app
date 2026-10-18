import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, WorkspaceBackLink } from "../common/org-link";
import { OrgSection, StateBadge, getSelectedTripId } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

function formatMinor(minor: number, currency: string): string {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

export function TripAccounting() {
  const { status: authStatus } = useAuth();

  const summaryQuery = useQuery(
    orpc.accounting.getOrganizationSummary.queryOptions({
      input: undefined,
      enabled: authStatus === "authenticated",
    }),
  );

  const tripsQuery = useQuery(
    orpc.trips.listOrganizationTrips.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const summary = summaryQuery.data;
  const currency = summary?.currencyCode ?? "EGP";
  const baseRevenue = summary?.grossRevenueMinor ?? 0;
  const couponImpact = summary?.refundsMinor ?? 0;
  const supplierCosts = summary?.payoutsSettledMinor ?? 0;
  const gatewayFees = summary?.platformCommissionMinor ?? 0;
  const programRevenue = Math.max(0, summary?.availableBalanceMinor ?? 0);

  const selectedId = getSelectedTripId();
  const trip = useMemo(() => {
    return (
      tripsQuery.data?.items.find((item) => item.id === selectedId) ?? tripsQuery.data?.items[0]
    );
  }, [tripsQuery.data?.items, selectedId]);
  const tripTitle = trip ? trip.titleEn || trip.titleAr : "";

  const accountingLines = [
    {
      label: t("screen.organization.accounting.tripAccounting.baseRevenue"),
      value: formatMinor(baseRevenue, currency),
      hint: t("screen.organization.accounting.tripAccounting.ticketRevenueForThisTrip"),
    },
    {
      label: t("screen.organization.accounting.tripAccounting.programRevenue"),
      value: formatMinor(programRevenue, currency),
      hint: t("screen.organization.accounting.tripAccounting.revenueFromPrograms"),
    },
    {
      label: t("screen.organization.accounting.tripAccounting.couponImpact"),
      value: formatMinor(couponImpact, currency),
      hint: t("screen.organization.accounting.tripAccounting.discountsFromCoupons"),
    },
    {
      label: t("screen.organization.accounting.tripAccounting.supplierCosts"),
      value: formatMinor(supplierCosts, currency),
      hint: t("screen.organization.accounting.tripAccounting.costsPaidToSuppliers"),
    },
    {
      label: t("screen.organization.accounting.tripAccounting.gatewayFees"),
      value: formatMinor(gatewayFees, currency),
      hint: t("screen.organization.accounting.tripAccounting.paymentGatewayFees"),
    },
  ];

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "trip-command-view",
            label: t("screen.organization.accounting.tripAccounting.backToTrip"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.accounting.tripAccounting.tripAccounting")}
          description={tripTitle || t("screen.organization.accounting.tripAccounting.tripName")}
          actions={
            <OrgButtonLink slug="ledger-and-exports" variant="secondary">
              {t("screen.organization.accounting.tripAccounting.openLedger")}
            </OrgButtonLink>
          }
        />
        <OrgSection title={t("screen.organization.accounting.tripAccounting.accountingLines")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accountingLines.map((line) => (
              <TeKpiTile key={line.label} label={line.label} value={line.value} hint={line.hint} />
            ))}
          </div>
        </OrgSection>
        <OrgSection title={t("screen.organization.accounting.tripAccounting.reconciliation")}>
          <TeCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StateBadge
                tone="neutral"
                icon="shield"
                label={t("screen.organization.accounting.tripAccounting.reconciliationStatus")}
              />
              <div className="flex flex-wrap gap-3">
                <OrgButtonLink slug="invoices-list" variant="ghost">
                  {t("screen.organization.accounting.tripAccounting.invoices")}
                </OrgButtonLink>
                <OrgButtonLink slug="settlements" variant="ghost">
                  {t("screen.organization.accounting.tripAccounting.settlements")}
                </OrgButtonLink>
              </div>
            </div>
          </TeCard>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
