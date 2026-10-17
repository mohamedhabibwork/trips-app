import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TePlanGate } from "@trips-app/ui/components/te-plan-gate";

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

const REPORT_CARDS: readonly ReportCard[] = [
  {
    id: "enrollment",
    slug: "program-enrollment-report",
    title: "Enrollment",
    metric: "Enrolled travelers",
    value: "0",
  },
  {
    id: "coupons",
    slug: "coupon-analytics",
    title: "Coupon redemption",
    metric: "Redemptions",
    value: "0",
  },
  {
    id: "revenue",
    slug: "trip-accounting",
    title: "Revenue",
    metric: "Base revenue",
    value: "[Amount and currency]",
  },
];

export function AnalyticsAndReports() {
  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink />
        <TePageHeader
          title="Analytics and reports"
          actions={<TeButton variant="secondary">Export</TeButton>}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TeInput label="From" placeholder="YYYY-MM-DD" />
          <TeInput label="To" placeholder="YYYY-MM-DD" />
        </div>
        <OrgSection title="Reports">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REPORT_CARDS.map((card) => (
              <TeCard
                key={card.id}
                header={<h3 className="te-h3">{card.title}</h3>}
                footer={
                  <div className="flex justify-end">
                    <OrgButtonLink slug={card.slug} variant="ghost">
                      Open report
                    </OrgButtonLink>
                  </div>
                }
              >
                <TeKpiTile label={card.metric} value={card.value} />
              </TeCard>
            ))}
          </div>
        </OrgSection>
        <OrgSection title="Full analytics">
          <TePlanGate
            plan="Enterprise"
            lockedLabel="Full trend and revenue analytics are available on the Enterprise plan."
          />
        </OrgSection>
      </div>
    </StatePreview>
  );
}
