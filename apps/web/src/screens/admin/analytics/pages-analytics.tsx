// SCR-ADM-38 Page & app analytics (docs/design/web/AdmPageAnalytics.dc.html): traffic, funnel,
// search terms, top screens, app versions and page speed for trips-enjoy.com and the apps. No
// analytics store exists in the backend yet, so every section renders the design's structure with
// the honest "no data source yet" state; the release floors that do exist (minimum app versions)
// come from system settings.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { serverQueryOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";

import { AdminCard, AdminGrid, AdminKpi, AdminPage } from "../common/admin-ui";
import { AnalyticsHeaderActions, AnalyticsNavTabs, NoSourceCard } from "./analytics-parts";

const K = "screen.admin.analytics.pagesAnalytics";

const RANGE_OPTIONS = (): readonly { value: string; label: string }[] => [
  { value: "14d", label: t(`${K}.rangeOctoberToDate`) },
  { value: "7d", label: t(`${K}.rangeLast7Days`) },
  { value: "30d", label: t(`${K}.rangeLast30Days`) },
];

export function PagesAnalytics() {
  const { status: authStatus } = useAuth();
  const [range, setRange] = useState("14d");
  const settingsQuery = useQuery({
    ...serverQueryOptions(orpc.admin.getSystemSettings, "admin/getSystemSettings", {
      input: undefined,
    }),
    enabled: authStatus === "authenticated",
  });
  const maintenance = settingsQuery.data?.maintenanceAndSupport;

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
      <AnalyticsNavTabs activeSlug="pages-analytics" />

      <AdminGrid columns={3}>
        <AdminKpi label={t(`${K}.kpiSessions`)} value="—" caption={t(`${K}.noAnalyticsSource`)} />
        <AdminKpi label={t(`${K}.kpiUsers`)} value="—" caption={t(`${K}.noAnalyticsSource`)} />
        <AdminKpi label={t(`${K}.kpiConversion`)} value="—" caption={t(`${K}.noAnalyticsSource`)} />
      </AdminGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NoSourceCard
          title={t(`${K}.sessionsPerDay`)}
          caption={t(`${K}.sessionsPerDayCaption`)}
          body={t(`${K}.noAnalyticsSource`)}
        />
        <NoSourceCard
          title={t(`${K}.trafficSources`)}
          caption={t(`${K}.trafficSourcesCaption`)}
          body={t(`${K}.noAnalyticsSource`)}
        />
      </div>

      <NoSourceCard
        title={t(`${K}.marketplaceFunnel`)}
        caption={t(`${K}.marketplaceFunnelCaption`)}
        body={t(`${K}.funnelNoSource`)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NoSourceCard
          title={t(`${K}.topSearchTerms`)}
          caption={t(`${K}.topSearchTermsCaption`)}
          body={t(`${K}.noSearchLogSource`)}
        />
        <NoSourceCard
          title={t(`${K}.topPages`)}
          caption={t(`${K}.topPagesCaption`)}
          body={t(`${K}.noAnalyticsSource`)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AdminCard title={t(`${K}.appVersions`)} caption={t(`${K}.appVersionsCaption`)}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--te-hairline)] py-2.5">
            <span className="te-body">{t(`${K}.minIosVersion`)}</span>
            <span className="te-label">{maintenance?.minIosVersion ?? "—"}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--te-hairline)] py-2.5">
            <span className="te-body">{t(`${K}.minAndroidSdk`)}</span>
            <span className="te-label">{maintenance?.minAndroidSdk ?? "—"}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
            <span className="te-body">{t(`${K}.minAppVersion`)}</span>
            <span className="te-label">{maintenance?.minMobileAppVersion ?? "—"}</span>
          </div>
          <p className="te-caption">{t(`${K}.crashFreeNoSource`)}</p>
        </AdminCard>
        <NoSourceCard
          title={t(`${K}.pageSpeed`)}
          caption={t(`${K}.pageSpeedCaption`)}
          body={t(`${K}.noAnalyticsSource`)}
        />
      </div>
    </AdminPage>
  );
}
