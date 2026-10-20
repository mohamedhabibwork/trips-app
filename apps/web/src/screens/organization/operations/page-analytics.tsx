// SCR-ORG-47 Page analytics: the pages-and-funnel report frame. Page views, funnels and traffic
// sources are not recorded by any procedure yet, so the design's sections render with honest
// "no data source" states instead of invented numbers.
import type { ReactNode } from "react";

import { t } from "@trips-app/i18n";

import { OrgButtonLink } from "../common/org-link";
import { NO_VALUE, OrgCard, OrgKpi, OrgKpiRow, OrgPage, OrgPageHeader } from "../common/org-ui";
import {
  AnalyticsTabs,
  EnterpriseUpgradeCard,
  NoSourceEmpty,
  PlanViewBadge,
  usePlanViewLabel,
} from "./analytics-parts";

const K = "screen.organization.operations.pageAnalytics";

export function PageAnalytics(): ReactNode {
  const planView = usePlanViewLabel();

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={
          <span className="flex flex-wrap items-center gap-3">
            <PlanViewBadge label={planView} />
            {t(`${K}.caption`)}
          </span>
        }
        actions={
          <OrgButtonLink slug="analytics-and-reports" variant="secondary">
            {t(`${K}.openReports`)}
          </OrgButtonLink>
        }
      />
      <AnalyticsTabs activeSlug="page-analytics" />
      <EnterpriseUpgradeCard what={t(`${K}.unlocksLine`)} />
      <OrgKpiRow>
        <OrgKpi label={t(`${K}.kpiPageViews`)} value={NO_VALUE} hint={t(`${K}.noSourceYet`)} />
        <OrgKpi label={t(`${K}.kpiVisitors`)} value={NO_VALUE} hint={t(`${K}.noSourceYet`)} />
        <OrgKpi label={t(`${K}.kpiTimeOnPage`)} value={NO_VALUE} hint={t(`${K}.noSourceYet`)} />
        <OrgKpi label={t(`${K}.kpiConversion`)} value={NO_VALUE} hint={t(`${K}.noSourceYet`)} />
      </OrgKpiRow>
      <OrgCard title={t(`${K}.bookingFunnel`)}>
        <NoSourceEmpty body={t(`${K}.funnelNoSource`)} />
      </OrgCard>
      <OrgCard title={t(`${K}.trafficSources`)}>
        <NoSourceEmpty body={t(`${K}.trafficNoSource`)} />
      </OrgCard>
      <OrgCard title={t(`${K}.topPages`)}>
        <NoSourceEmpty body={t(`${K}.pagesNoSource`)} />
      </OrgCard>
    </OrgPage>
  );
}
