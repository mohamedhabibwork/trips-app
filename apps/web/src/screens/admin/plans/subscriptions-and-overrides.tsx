import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminActions,
  AdminFilterSelect,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface SubscriptionRow {
  id: string;
  account: string;
  role: string;
  plan: string;
  billing: "active" | "past-due" | "cancelled";
  renewal: string;
}

const SUBSCRIPTION_ROWS: readonly SubscriptionRow[] = [
  {
    id: "sub-1",
    account: "[Account name]",
    role: "[Role]",
    plan: "[Plan name]",
    billing: "active",
    renewal: "[Date]",
  },
  {
    id: "sub-2",
    account: "[Account name]",
    role: "[Role]",
    plan: "[Plan name]",
    billing: "past-due",
    renewal: "[Date]",
  },
];

const BILLING_PRESENTATION: Record<SubscriptionRow["billing"], AdminStatusPresentation> = {
  active: { tone: "success", icon: "check", label: "Active" },
  "past-due": { tone: "warning", icon: "alert", label: "Past due (grace shown)" },
  cancelled: { tone: "neutral", icon: "close", label: "Cancelled" },
};

const ROLE_OPTIONS: readonly TeSelectOption[] = [{ value: "all", label: "All roles" }];
const PLAN_OPTIONS: readonly TeSelectOption[] = [{ value: "all", label: "All plans" }];
const BILLING_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "Any billing status" },
  { value: "active", label: "Active" },
  { value: "past-due", label: "Past due" },
  { value: "cancelled", label: "Cancelled" },
];
const OVERRIDE_PLAN_OPTIONS: readonly TeSelectOption[] = [
  { value: "", label: "Select a plan" },
  { value: "plan", label: "[Plan name]" },
];

const COLUMNS: readonly TeDataTableColumn<SubscriptionRow>[] = [
  { key: "account", header: "Account" },
  { key: "role", header: "Role" },
  { key: "plan", header: "Plan" },
  {
    key: "billing",
    header: "Billing status",
    render: (row) => <AdminStatus status={BILLING_PRESENTATION[row.billing]} />,
  },
  { key: "renewal", header: "Renewal date" },
  {
    key: "open",
    header: "Action",
    render: (row) => (
      <AdminScreenLink slug="entity-detail" variant="secondary" ariaLabel={`Open ${row.account}`}>
        Open account
      </AdminScreenLink>
    ),
  },
];

export function SubscriptionsAndOverrides() {
  const [overridePlan, setOverridePlan] = useState("");
  const [reason, setReason] = useState("");
  const canSave = overridePlan !== "" && reason.trim() !== "";

  return (
    <AdminPage>
      <TePageHeader
        title="Subscriptions and overrides"
        description="Find subscriptions and grant, revoke or change a plan for one account."
      />
      <StatePreview
        emptyTitle="No subscriptions"
        emptyDescription="No subscriptions match these filters."
        loadingLabel="Loading the subscriptions."
      >
        <AdminFilters>
          <AdminFilterSelect label="Role" options={ROLE_OPTIONS} />
          <AdminFilterSelect label="Plan" options={PLAN_OPTIONS} />
          <AdminFilterSelect label="Billing status" options={BILLING_OPTIONS} />
          <TeInput label="Renewal before" placeholder="YYYY-MM-DD" />
        </AdminFilters>
        <AdminPanel title="Subscriptions">
          <TeDataTable
            columns={COLUMNS}
            rows={SUBSCRIPTION_ROWS}
            getRowKey={(row) => row.id}
            caption="Subscriptions"
            emptyTitle="No subscriptions"
            emptyDescription="No subscriptions match these filters."
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
        <AdminPanel title="Override plan for one account">
          <TeInput label="Account" placeholder="[Account name or reference]" required />
          <TeSelect
            label="Plan"
            options={OVERRIDE_PLAN_OPTIONS}
            value={overridePlan}
            onValueChange={setOverridePlan}
          />
          <TeInput
            label="Reason (required)"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="[Reason for the override]"
          />
          <TeInput label="End date" placeholder="YYYY-MM-DD" />
        </AdminPanel>
        <TeInlineAlert tone="warning" title="Before you save">
          An override applies at once and is audited. Conflicts with billing are shown before you
          save (D-227).
        </TeInlineAlert>
        <AdminActions>
          <TeButton variant="secondary">Cancel</TeButton>
          <TeButton disabled={!canSave}>Save override</TeButton>
        </AdminActions>
      </StatePreview>
    </AdminPage>
  );
}
