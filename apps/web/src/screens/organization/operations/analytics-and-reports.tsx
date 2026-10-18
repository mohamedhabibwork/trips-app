import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TePlanGate } from "@trips-app/ui/components/te-plan-gate";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, WorkspaceBackLink } from "../common/org-link";
import type { OrgSlug } from "../common/org-routes";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface ReportCard {
  id: string;
  slug: OrgSlug;
  title: string;
  metric: string;
  value: string;
}

export function AnalyticsAndReports() {
  const { status: authStatus } = useAuth();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const bookingsQuery = useQuery(
    orpc.booking.listOrganizationBookings.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const couponsQuery = useQuery(
    orpc.coupons.listOrganizationCoupons.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const summaryQuery = useQuery(
    orpc.accounting.getOrganizationSummary.queryOptions({
      input: undefined,
      enabled: authStatus === "authenticated",
    }),
  );

  const enrolledTravelers = useMemo(() => {
    if (!bookingsQuery.data) return 0;
    return bookingsQuery.data.reduce((sum, b) => sum + b.passengersCount, 0);
  }, [bookingsQuery.data]);

  const couponRedemptions = useMemo(() => {
    if (!couponsQuery.data?.items) return 0;
    return couponsQuery.data.items.reduce((sum, c) => sum + c.redemptionsCount, 0);
  }, [couponsQuery.data?.items]);

  const baseRevenueLabel = useMemo(() => {
    const s = summaryQuery.data;
    if (!s) return "0.00 EGP";
    return `${(s.grossRevenueMinor / 100).toFixed(2)} ${s.currencyCode}`;
  }, [summaryQuery.data]);

  const reportCards: readonly ReportCard[] = [
    {
      id: "enrollment",
      slug: "program-enrollment-report",
      title: t("screen.organization.operations.analyticsAndReports.enrollment"),
      metric: "Enrolled travelers",
      value: String(enrolledTravelers),
    },
    {
      id: "coupons",
      slug: "coupon-analytics",
      title: t("screen.organization.operations.analyticsAndReports.couponRedemption"),
      metric: "Redemptions",
      value: String(couponRedemptions),
    },
    {
      id: "revenue",
      slug: "trip-accounting",
      title: t("screen.organization.operations.analyticsAndReports.revenue"),
      metric: "Base revenue",
      value: baseRevenueLabel,
    },
  ];

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink />
        <TePageHeader
          title={t("screen.organization.operations.analyticsAndReports.analyticsAndReports")}
          actions={
            <TeButton variant="secondary">
              {t("screen.organization.operations.analyticsAndReports.export")}
            </TeButton>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TeInput
            label={t("screen.organization.operations.analyticsAndReports.from")}
            placeholder={t("screen.organization.operations.analyticsAndReports.yyyyMmDd")}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <TeInput
            label={t("screen.organization.operations.analyticsAndReports.to")}
            placeholder={t(
              "screen.organization.operations.analyticsAndReports.yyyyMmDdPlaceholder",
            )}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <OrgSection title={t("screen.organization.operations.analyticsAndReports.reports")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reportCards.map((card) => (
              <TeCard
                key={card.id}
                header={<h3 className="te-h3">{card.title}</h3>}
                footer={
                  <div className="flex justify-end">
                    <OrgButtonLink slug={card.slug} variant="ghost">
                      {t("screen.organization.operations.analyticsAndReports.openReport")}
                    </OrgButtonLink>
                  </div>
                }
              >
                <TeKpiTile label={card.metric} value={card.value} />
              </TeCard>
            ))}
          </div>
        </OrgSection>
        <OrgSection title={t("screen.organization.operations.analyticsAndReports.fullAnalytics")}>
          <TePlanGate
            plan="Enterprise"
            lockedLabel={t(
              "screen.organization.operations.analyticsAndReports.fullTrendAndRevenueAnalytics",
            )}
          />
        </OrgSection>
      </div>
    </StatePreview>
  );
}
