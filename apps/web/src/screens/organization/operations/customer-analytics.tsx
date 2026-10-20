// SCR-ORG-45 Customer analytics: the report frame the design shows. The booking data the
// dashboard can read carries no customer identity yet, so every metric renders its structure with
// an honest "no data source" state instead of invented numbers.
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

const K = "screen.organization.operations.customerAnalytics";

export function CustomerAnalytics(): ReactNode {
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
          <OrgButtonLink slug="bookings-and-travelers" variant="secondary">
            {t(`${K}.openBookings`)}
          </OrgButtonLink>
        }
      />
      <AnalyticsTabs activeSlug="customer-analytics" />
      <EnterpriseUpgradeCard what={t(`${K}.unlocksLine`)} />
      <OrgKpiRow>
        <OrgKpi label={t(`${K}.kpiCustomers`)} value={NO_VALUE} hint={t(`${K}.noSourceYet`)} />
        <OrgKpi label={t(`${K}.kpiReturning`)} value={NO_VALUE} hint={t(`${K}.noSourceYet`)} />
        <OrgKpi label={t(`${K}.kpiLifetimeValue`)} value={NO_VALUE} hint={t(`${K}.noSourceYet`)} />
        <OrgKpi label={t(`${K}.kpiBackWithinYear`)} value={NO_VALUE} hint={t(`${K}.noSourceYet`)} />
      </OrgKpiRow>
      <OrgCard title={t(`${K}.newVsReturning`)}>
        <NoSourceEmpty body={t(`${K}.needsCustomerIdentity`)} />
      </OrgCard>
      <OrgCard title={t(`${K}.cohortRetention`)}>
        <NoSourceEmpty body={t(`${K}.needsCustomerIdentity`)} />
      </OrgCard>
      <OrgCard title={t(`${K}.ltvBySegment`)}>
        <NoSourceEmpty body={t(`${K}.needsCrmSegments`)} />
      </OrgCard>
      <OrgCard title={t(`${K}.topCustomers`)}>
        <NoSourceEmpty body={t(`${K}.needsCustomerIdentity`)} />
      </OrgCard>
    </OrgPage>
  );
}
