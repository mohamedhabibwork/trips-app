// SCR-ADM-36 Provider analytics (docs/design/web/AdmProviderAnalytics.dc.html): platform drivers
// and photographers — supply vs demand, offer acceptance, negotiation rounds, utilization and
// verification. The negotiation list is the one admin-reachable provider dataset, so the deal
// stats derive from it; supply curves, acceptance-rate history, utilization and lab-test
// compliance have no source yet and their cards say so.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { serverQueryOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";

import { AdminButton, AdminLink } from "../common/admin-actions";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminCard,
  AdminGrid,
  AdminKpi,
  AdminPage,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";
import { AnalyticsNavTabs, NoSourceCard } from "./analytics-parts";

const K = "screen.admin.analytics.providersAnalytics";

interface ProviderRow {
  accountId: string;
  role: string;
  deals: number;
  finalized: number;
  rejected: number;
  rounds: string;
  latest: string;
}

export function ProvidersAnalytics() {
  const { status: authStatus, locale } = useAuth();

  const dealsQuery = useQuery({
    ...serverQueryOptions(
      orpc.negotiation.listOrganizationNegotiations,
      "negotiation/listOrganizationNegotiations",
      { input: {} },
    ),
    enabled: authStatus === "authenticated",
  });

  const rows: readonly ProviderRow[] = useMemo(() => {
    const bySupplier = new Map<
      string,
      {
        role: string;
        deals: number;
        finalized: number;
        rejected: number;
        rounds: number;
        latest: string;
      }
    >();
    for (const deal of dealsQuery.data?.items ?? []) {
      const key = deal.supplierAccountId;
      const bucket = bySupplier.get(key) ?? {
        role: deal.supplierRole,
        deals: 0,
        finalized: 0,
        rejected: 0,
        rounds: 0,
        latest: "",
      };
      bucket.deals += 1;
      if (deal.status === "accepted") bucket.finalized += 1;
      if (deal.status === "declined") bucket.rejected += 1;
      bucket.rounds = Math.max(bucket.rounds, deal.roundsCount);
      const updated = new Date(deal.updatedAt).toISOString();
      if (updated > bucket.latest) bucket.latest = updated;
      bySupplier.set(key, bucket);
    }
    return [...bySupplier.entries()]
      .map(([accountId, bucket]) => ({
        accountId,
        role: bucket.role,
        deals: bucket.deals,
        finalized: bucket.finalized,
        rejected: bucket.rejected,
        rounds: bucket.rounds > 0 ? String(bucket.rounds) : "—",
        latest: bucket.latest,
      }))
      .sort((a, b) => b.deals - a.deals)
      .slice(0, 10);
  }, [dealsQuery.data]);

  const allDeals = dealsQuery.data?.items ?? [];
  const finalized = allDeals.filter((deal) => deal.status === "accepted");
  const rejected = allDeals.filter((deal) => deal.status === "declined");
  const avgRounds =
    allDeals.length > 0
      ? allDeals.reduce((sum, deal) => sum + deal.roundsCount, 0) / allDeals.length
      : null;
  const dealVsInitial =
    finalized.length > 0
      ? finalized.reduce((sum, deal) => {
          if (deal.agreedPriceMinor === null || deal.initialOfferMinor <= 0) return sum;
          return sum + ((deal.agreedPriceMinor / deal.initialOfferMinor) * 100 - 100);
        }, 0) / finalized.length
      : null;

  const columns: readonly AdminColumn<ProviderRow>[] = [
    { key: "provider", header: t(`${K}.provider`), render: (row) => row.accountId, wrap: true },
    {
      key: "role",
      header: t(`${K}.role`),
      render: (row) =>
        row.role === "platform_photographer" ? t(`${K}.rolePhotographer`) : t(`${K}.roleDriver`),
    },
    { key: "deals", header: t(`${K}.deals`), render: (row) => row.deals, align: "end" },
    { key: "finalized", header: t(`${K}.finalized`), render: (row) => row.finalized, align: "end" },
    { key: "rejected", header: t(`${K}.rejected`), render: (row) => row.rejected, align: "end" },
    {
      key: "rounds",
      header: t(`${K}.maxRounds`),
      render: (row) => row.rounds,
      align: "end",
      headerWrap: true,
    },
    {
      key: "latest",
      header: t(`${K}.lastActivity`),
      render: (row) => (row.latest ? new Date(row.latest).toLocaleDateString(locale) : "—"),
    },
  ];

  return (
    <AdminPage title={t(`${K}.title`)} description={t(`${K}.description`)}>
      <AnalyticsNavTabs activeSlug="providers-analytics" />

      <AdminGrid columns={3}>
        <AdminKpi
          label={t(`${K}.kpiFinalizedDeals`)}
          value={dealsQuery.isSuccess ? finalized.length : "—"}
          caption={t(`${K}.kpiFinalizedCaption`, { total: allDeals.length })}
        />
        <AdminKpi
          label={t(`${K}.kpiAvgRounds`)}
          value={avgRounds !== null ? avgRounds.toFixed(1) : "—"}
          caption={t(`${K}.kpiAvgRoundsCaption`)}
        />
        <AdminKpi
          label={t(`${K}.kpiRejected`)}
          value={dealsQuery.isSuccess ? rejected.length : "—"}
          caption={t(`${K}.kpiRejectedCaption`)}
        />
      </AdminGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NoSourceCard
          title={t(`${K}.supplyVsDemand`)}
          caption={t(`${K}.supplyVsDemandCaption`)}
          body={t(`${K}.noSupplySource`)}
        />
        <NoSourceCard
          title={t(`${K}.requestsPerProvider`)}
          caption={t(`${K}.requestsPerProviderCaption`)}
          body={t(`${K}.noSupplySource`)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AdminCard title={t(`${K}.negotiation`)} caption={t(`${K}.negotiationCaption`)}>
          <AdminQueryState query={dealsQuery} loadingLabel={t(`${K}.loading`)}>
            {allDeals.length > 0 ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--te-hairline)] py-2.5">
                  <span className="te-body">{t(`${K}.dealVsOffer`)}</span>
                  <span className="te-label">
                    {dealVsInitial !== null
                      ? `${dealVsInitial >= 0 ? "+" : ""}${dealVsInitial.toFixed(1)}%`
                      : "—"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                  <span className="te-body">{t(`${K}.avgRoundsRow`)}</span>
                  <span className="te-label">
                    {avgRounds !== null ? avgRounds.toFixed(1) : "—"}
                  </span>
                </div>
              </>
            ) : (
              <AdminEmpty title={t(`${K}.noDealsTitle`)} description={t(`${K}.noDealsBody`)} />
            )}
          </AdminQueryState>
        </AdminCard>
        <NoSourceCard
          title={t(`${K}.offerAcceptance`)}
          caption={t(`${K}.offerAcceptanceCaption`)}
          body={t(`${K}.noAcceptanceSource`)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NoSourceCard
          title={t(`${K}.utilizationPlanMix`)}
          caption={t(`${K}.utilizationCaption`)}
          body={t(`${K}.noUtilizationSource`)}
        />
        <NoSourceCard
          title={t(`${K}.verifiedLabTests`)}
          caption={t(`${K}.verifiedCaption`)}
          body={t(`${K}.noVerificationSource`)}
        />
      </div>

      <AdminQueryState query={dealsQuery} loadingLabel={t(`${K}.loading`)}>
        <AdminCard title={t(`${K}.topProviders`)} caption={t(`${K}.topProvidersCaption`)}>
          <AdminTable
            caption={t(`${K}.topProvidersCaption`)}
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.accountId}
            empty={
              <AdminEmpty title={t(`${K}.noDealsTitle`)} description={t(`${K}.noDealsBody`)} />
            }
            footer={
              <div className="flex flex-wrap items-center gap-4">
                <AdminLink screen="SCR-ADM-21">{t(`${K}.openDealAudit`)}</AdminLink>
                <AdminButton variant="secondary" disabled title={t(`${K}.noSupplySource`)}>
                  {t(`${K}.providerPool`)}
                </AdminButton>
              </div>
            }
          />
        </AdminCard>
      </AdminQueryState>
    </AdminPage>
  );
}
