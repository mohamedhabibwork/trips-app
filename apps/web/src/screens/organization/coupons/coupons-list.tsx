import { useState } from "react";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";

import { OrgButtonLink, OrgLink, WorkspaceBackLink } from "../common/org-link";
import { StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

type CouponStatus = "Active" | "Paused";

interface CouponRow {
  id: string;
  code: string;
  type: string;
  value: string;
  status: CouponStatus;
  redemptions: string;
  remainingUses: string;
}

const COUPON_ROWS: readonly CouponRow[] = [
  {
    id: "coupon-1",
    code: "[Coupon code]",
    type: "[Coupon type]",
    value: "[Value]",
    status: "Active",
    redemptions: "0",
    remainingUses: "[Remaining uses]",
  },
  {
    id: "coupon-2",
    code: "[Coupon code]",
    type: "[Coupon type]",
    value: "[Value]",
    status: "Paused",
    redemptions: "0",
    remainingUses: "[Remaining uses]",
  },
];

function buildColumns(onRevoke: () => void): readonly TeDataTableColumn<CouponRow>[] {
  return [
    {
      key: "code",
      header: "Code",
      render: (row) => <OrgLink slug="coupon-editor">{row.code}</OrgLink>,
    },
    { key: "type", header: "Type" },
    { key: "value", header: "Value", align: "end" },
    {
      key: "status",
      header: "Status",
      render: (row) =>
        row.status === "Active" ? (
          <StateBadge tone="success" icon="check" label="Active" />
        ) : (
          <StateBadge tone="warning" icon="clock" label="Paused" />
        ),
    },
    { key: "redemptions", header: "Redemptions", align: "end" },
    { key: "remainingUses", header: "Remaining uses", align: "end" },
    {
      key: "actions",
      header: "Actions",
      align: "end",
      render: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <TeButton variant="ghost">{row.status === "Active" ? "Pause" : "Resume"}</TeButton>
          <TeButton variant="ghost" onClick={onRevoke}>
            Revoke
          </TeButton>
        </div>
      ),
    },
  ];
}

export function CouponsList() {
  const [query, setQuery] = useState("");
  const [revokeOpen, setRevokeOpen] = useState(false);
  const columns = buildColumns(() => setRevokeOpen(true));

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = COUPON_ROWS.filter((row) => row.code.toLowerCase().includes(normalizedQuery));

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink />
        <TePageHeader
          title="Coupons list"
          actions={
            <div className="flex flex-wrap gap-3">
              <OrgButtonLink slug="coupon-analytics" variant="secondary">
                Analytics
              </OrgButtonLink>
              <OrgButtonLink slug="coupon-editor">Create coupon</OrgButtonLink>
            </div>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TeKpiTile
            label="Coupons"
            value="0 of [plan limit]"
            hint="Counted toward your plan limit"
          />
        </div>
        <TeSearchField
          label="Search coupons"
          value={query}
          onValueChange={setQuery}
          clearLabel="Clear search"
        />
        <TeDataTable
          columns={columns}
          rows={visibleRows}
          getRowKey={(row) => row.id}
          caption="Coupons"
          emptyTitle="No coupons yet"
          emptyDescription="Create a coupon to offer a discount on your trips."
        />
        <TeDialog
          open={revokeOpen}
          onOpenChange={setRevokeOpen}
          title="Revoke this coupon?"
          description="Travelers can no longer use it. Past redemptions are kept."
          primaryLabel="Revoke"
          onPrimary={() => setRevokeOpen(false)}
          secondaryLabel="Keep coupon"
          onSecondary={() => setRevokeOpen(false)}
          tone="danger"
        />
      </div>
    </StatePreview>
  );
}
