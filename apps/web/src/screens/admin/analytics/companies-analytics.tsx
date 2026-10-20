// SCR-ADM-35 Company analytics (docs/design/web/AdmCompanyAnalytics.dc.html): benchmark every
// organization on health, GMV, occupancy and churn risk. Ledger entries are the only per-
// organization money source admins can reach, so the benchmark and top-GMV tables group those
// entries by tenant; health scores, plan moves and churn risk have no source yet and their cards
// say so instead of inventing numbers.
import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { serverQueryOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";

import { AdminButton } from "../common/admin-actions";
import { AdminSelect, type AdminOption } from "../common/admin-form";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminBadge,
  AdminCard,
  AdminGrid,
  AdminKpi,
  AdminPage,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";
import { formatMinor, totalsByCurrency } from "../finance/finance-format";
import { AnalyticsHeaderActions, AnalyticsNavTabs, NoSourceCard } from "./analytics-parts";

const K = "screen.admin.analytics.companiesAnalytics";

const SORT_OPTIONS = (): readonly AdminOption[] => [
  { value: "gmv", label: t(`${K}.sortGmv`) },
  { value: "entries", label: t(`${K}.sortEntries`) },
  { value: "name", label: t(`${K}.sortName`) },
];

const RANGE_OPTIONS = (): readonly AdminOption[] => [
  { value: "30d", label: t(`${K}.rangeLast30Days`) },
  { value: "all", label: t(`${K}.rangeAllTime`) },
];

interface OrgRow {
  tenantId: string;
  rank: number;
  gmv: string;
  entryCount: number;
  net: string;
}

export function CompaniesAnalytics(): ReactNode {
  const { status: authStatus, locale } = useAuth();
  const [range, setRange] = useState("30d");
  const [sort, setSort] = useState("gmv");

  const ledgerQuery = useQuery({
    ...serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
      input: {},
    }),
    enabled: authStatus === "authenticated",
  });

  const entries = useMemo(() => {
    const all = ledgerQuery.data ?? [];
    if (range !== "30d") return all;
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return all.filter((entry) => new Date(entry.occurredAt).getTime() >= cutoff);
  }, [ledgerQuery.data, range]);

  const rows: readonly OrgRow[] = useMemo(() => {
    const byTenant = new Map<
      string,
      { gross: Map<string, number>; net: Map<string, number>; count: number }
    >();
    for (const entry of entries) {
      const bucket = byTenant.get(entry.tenantId) ?? {
        gross: new Map<string, number>(),
        net: new Map<string, number>(),
        count: 0,
      };
      if (entry.entryType === "booking_revenue" && entry.direction === "credit") {
        bucket.gross.set(
          entry.currencyCode,
          (bucket.gross.get(entry.currencyCode) ?? 0) + entry.grossAmountMinor,
        );
      }
      bucket.net.set(
        entry.currencyCode,
        (bucket.net.get(entry.currencyCode) ?? 0) + entry.netAmountMinor,
      );
      bucket.count += 1;
      byTenant.set(entry.tenantId, bucket);
    }
    const mapped = [...byTenant.entries()].map(([tenantId, bucket]) => {
      const gross = totalsByCurrency(
        [...bucket.gross.entries()].map(([currency, amountMinor]) => ({ currency, amountMinor })),
      );
      const net = totalsByCurrency(
        [...bucket.net.entries()].map(([currency, amountMinor]) => ({ currency, amountMinor })),
      );
      return {
        tenantId,
        rank: 0,
        gmv:
          gross
            .map((total) => formatMinor(total.amountMinor, total.currency, locale))
            .join(" · ") || "—",
        entryCount: bucket.count,
        net:
          net.map((total) => formatMinor(total.amountMinor, total.currency, locale)).join(" · ") ||
          "—",
      };
    });
    mapped.sort((a, b) => {
      if (sort === "name") return a.tenantId.localeCompare(b.tenantId);
      if (sort === "entries") return b.entryCount - a.entryCount;
      return b.gmv.localeCompare(a.gmv);
    });
    return mapped.map((row, index) => ({ ...row, rank: index + 1 }));
  }, [entries, locale, sort]);

  const columns: readonly AdminColumn<OrgRow>[] = [
    { key: "rank", header: t(`${K}.rank`), render: (row) => row.rank },
    { key: "org", header: t(`${K}.organization`), render: (row) => row.tenantId, wrap: true },
    { key: "gmv", header: t(`${K}.gmv`), render: (row) => row.gmv, align: "end" },
    {
      key: "entries",
      header: t(`${K}.entries`),
      render: (row) => row.entryCount,
      align: "end",
      headerWrap: true,
    },
    { key: "net", header: t(`${K}.net`), render: (row) => row.net, align: "end" },
    {
      key: "occupancy",
      header: t(`${K}.occupancy`),
      render: () => "—",
      align: "end",
      headerWrap: true,
    },
    {
      key: "risk",
      header: t(`${K}.churnRisk`),
      render: () => (
        <AdminBadge tone="neutral" icon={false}>
          {t(`${K}.notRecorded`)}
        </AdminBadge>
      ),
      align: "end",
      headerWrap: true,
    },
  ];

  return (
    <AdminPage
      title={t(`${K}.title`)}
      description={t(`${K}.description`)}
      actions={
        <AnalyticsHeaderActions
          range={range}
          onRangeChange={setRange}
          rangeOptions={RANGE_OPTIONS()}
          exportLabel={t(`${K}.exportCsv`)}
        />
      }
    >
      <AnalyticsNavTabs activeSlug="companies-analytics" />

      <AdminGrid columns={3}>
        <AdminKpi
          label={t(`${K}.kpiOrganizations`)}
          value={ledgerQuery.isSuccess ? rows.length : "—"}
          caption={t(`${K}.kpiOrganizationsCaption`)}
        />
        <AdminKpi label={t(`${K}.kpiHealthAverage`)} value="—" caption={t(`${K}.noHealthSource`)} />
        <AdminKpi label={t(`${K}.kpiChurning`)} value="—" caption={t(`${K}.noChurnSource`)} />
      </AdminGrid>

      <AdminQueryState query={ledgerQuery} loadingLabel={t(`${K}.loading`)}>
        <AdminCard title={t(`${K}.benchmarkTitle`)} caption={t(`${K}.benchmarkCaption`)}>
          <AdminSelect
            label={t(`${K}.sortBy`)}
            options={SORT_OPTIONS()}
            value={sort}
            onValueChange={setSort}
            className="w-full sm:w-[220px] self-end"
          />
          <AdminTable
            caption={t(`${K}.benchmarkCaption`)}
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.tenantId}
            empty={<AdminEmpty title={t(`${K}.emptyTitle`)} description={t(`${K}.emptyBody`)} />}
          />
        </AdminCard>
      </AdminQueryState>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NoSourceCard
          title={t(`${K}.healthDistribution`)}
          caption={t(`${K}.healthDistributionCaption`)}
          body={t(`${K}.noHealthSource`)}
        />
        <NoSourceCard
          title={t(`${K}.planMoves`)}
          caption={t(`${K}.planMovesCaption`)}
          body={t(`${K}.noPlanMovesSource`)}
        />
      </div>

      <AdminCard title={t(`${K}.riskListTitle`)} caption={t(`${K}.noChurnSource`)}>
        <AdminButton variant="secondary" disabled title={t(`${K}.noChurnSource`)}>
          {t(`${K}.riskListSeeAll`)}
        </AdminButton>
      </AdminCard>
    </AdminPage>
  );
}
