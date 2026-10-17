import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TePlanGate } from "@trips-app/ui/components/te-plan-gate";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface CouponMetricRow {
  id: string;
  code: string;
  redemptions: string;
  discountTotal: string;
  remainingUses: string;
}

const METRIC_ROWS: readonly CouponMetricRow[] = [
  {
    id: "metric-1",
    code: "[Coupon code]",
    redemptions: "0",
    discountTotal: "[Amount and currency]",
    remainingUses: "[Remaining uses]",
  },
];

const COLUMNS: readonly TeDataTableColumn<CouponMetricRow>[] = [
  { key: "code", header: "Coupon" },
  { key: "redemptions", header: "Redemptions", align: "end" },
  { key: "discountTotal", header: "Discount total", align: "end" },
  { key: "remainingUses", header: "Remaining uses", align: "end" },
];

export function CouponAnalytics() {
  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "coupons-list", label: "Back to coupons" }} />
        <TePageHeader
          title="Coupon analytics"
          actions={<TeButton variant="secondary">Export</TeButton>}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TeInput label="From" placeholder="YYYY-MM-DD" />
          <TeInput label="To" placeholder="YYYY-MM-DD" />
        </div>
        <OrgSection title="Coupons">
          <TeDataTable
            columns={COLUMNS}
            rows={METRIC_ROWS}
            getRowKey={(row) => row.id}
            caption="Redemptions and discounts per coupon"
            emptyTitle="No redemptions"
            emptyDescription="Redemptions appear here once travelers use a coupon."
          />
        </OrgSection>
        <OrgSection title="Full breakdown">
          <TePlanGate
            plan="Enterprise"
            lockedLabel="The full coupon breakdown is available on the Enterprise plan."
          />
        </OrgSection>
      </div>
    </StatePreview>
  );
}
