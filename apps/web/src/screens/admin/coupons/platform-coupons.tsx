import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminFilterSelect,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface CouponRow {
  id: string;
  creator: string;
  code: string;
  state: "active" | "revoked" | "expired";
  redemptions: string;
  abuseRule: string | null;
}

const COUPON_ROWS: readonly CouponRow[] = [
  {
    id: "coupon-1",
    creator: "[Creator type]",
    code: "[Coupon code]",
    state: "active",
    redemptions: "0",
    abuseRule: null,
  },
  {
    id: "coupon-2",
    creator: "[Creator type]",
    code: "[Coupon code]",
    state: "active",
    redemptions: "0",
    abuseRule: "[Rule that raised the flag]",
  },
];

const STATE_PRESENTATION: Record<CouponRow["state"], AdminStatusPresentation> = {
  active: { tone: "success", icon: "check", label: "Active" },
  revoked: { tone: "danger", icon: "close", label: "Revoked" },
  expired: { tone: "neutral", icon: "clock", label: "Expired" },
};

const ABUSE_FLAG: AdminStatusPresentation = { tone: "warning", icon: "alert", label: "Abuse flag" };

const STATE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "Any status" },
  { value: "active", label: "Active" },
  { value: "revoked", label: "Revoked" },
  { value: "expired", label: "Expired" },
];

const COLUMNS: readonly TeDataTableColumn<CouponRow>[] = [
  { key: "creator", header: "Creator type" },
  { key: "code", header: "Code" },
  {
    key: "state",
    header: "Status",
    render: (row) => <AdminStatus status={STATE_PRESENTATION[row.state]} />,
  },
  { key: "redemptions", header: "Redemptions", align: "end" },
  {
    key: "abuseRule",
    header: "Abuse flag",
    render: (row) =>
      row.abuseRule === null ? (
        <span>None</span>
      ) : (
        <span className="flex flex-col gap-1">
          <AdminStatus status={ABUSE_FLAG} />
          <span className="te-caption">{row.abuseRule}</span>
        </span>
      ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (row) => (
      <span className="flex flex-wrap gap-2">
        <TeButton variant="secondary" aria-label={`Revoke ${row.code}`}>
          Revoke
        </TeButton>
        <TeButton variant="ghost" aria-label={`Open analytics for ${row.code}`}>
          Analytics
        </TeButton>
      </span>
    ),
  },
];

export function PlatformCoupons() {
  return (
    <AdminPage>
      <TePageHeader
        title="Platform coupons"
        description="Coupons from all creators. Revoke any coupon."
        actions={
          <AdminScreenLink slug="platform-coupon-editor" variant="primary">
            Create platform coupon
          </AdminScreenLink>
        }
      />
      <StatePreview
        emptyTitle="No coupons"
        emptyDescription="No coupons match this filter."
        loadingLabel="Loading the coupons."
      >
        <TeInlineAlert tone="info" title="Abuse thresholds">
          Thresholds are not yet set (D-216). A flag shows the rule that raised it.
        </TeInlineAlert>
        <AdminFilters>
          <AdminFilterSelect label="Status" options={STATE_OPTIONS} />
        </AdminFilters>
        <AdminPanel title="Coupons">
          <TeDataTable
            columns={COLUMNS}
            rows={COUPON_ROWS}
            getRowKey={(row) => row.id}
            caption="Platform coupons"
            emptyTitle="No coupons"
            emptyDescription="No coupons match this filter."
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
