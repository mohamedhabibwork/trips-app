import {
  TeApplicationStatus,
  TE_APPLICATION_STATUS_PRESENTATION,
} from "@trips-app/ui/components/te-application-card";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeRoleBadge, type TeRole } from "@trips-app/ui/components/te-role-badge";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
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

interface ApplicationRow {
  id: string;
  role: TeRole;
  applicant: string;
  country: string;
  submitted: string;
  waiting: string;
  state: TeApplicationStatus;
  overdue: boolean;
}

const APPLICATION_ROWS: readonly ApplicationRow[] = [
  {
    id: "app-1",
    role: "driver",
    applicant: "[Applicant name]",
    country: "[Country]",
    submitted: "[Date]",
    waiting: "0",
    state: "pending",
    overdue: true,
  },
  {
    id: "app-2",
    role: "photographer",
    applicant: "[Applicant name]",
    country: "[Country]",
    submitted: "[Date]",
    waiting: "0",
    state: "changes-requested",
    overdue: false,
  },
];

const OVERDUE: AdminStatusPresentation = { tone: "danger", icon: "alert", label: "Overdue" };
const ON_TIME: AdminStatusPresentation = { tone: "info", icon: "clock", label: "On time" };

const TYPE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "All types" },
  { value: "organization", label: "Organization" },
  { value: "driver", label: "Platform driver" },
  { value: "photographer", label: "Platform photographer" },
];
const COUNTRY_OPTIONS: readonly TeSelectOption[] = [{ value: "all", label: "All countries" }];
const AGE_OPTIONS: readonly TeSelectOption[] = [
  { value: "any", label: "Any age" },
  { value: "overdue", label: "Overdue (over 2 working days)" },
];
const STATE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "Any state" },
  { value: "pending", label: "Pending review" },
  { value: "changes-requested", label: "Changes requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const COLUMNS: readonly TeDataTableColumn<ApplicationRow>[] = [
  { key: "role", header: "Type", render: (row) => <TeRoleBadge role={row.role} /> },
  { key: "applicant", header: "Applicant" },
  { key: "country", header: "Country" },
  { key: "submitted", header: "Submitted" },
  { key: "waiting", header: "Working days waiting", align: "end" },
  {
    key: "state",
    header: "State",
    render: (row) => <AdminStatus status={TE_APPLICATION_STATUS_PRESENTATION[row.state]} />,
  },
  {
    key: "overdue",
    header: "Overdue",
    render: (row) => <AdminStatus status={row.overdue ? OVERDUE : ON_TIME} />,
  },
  {
    key: "open",
    header: "Action",
    render: (row) => (
      <AdminScreenLink
        slug="application-review-detail"
        variant="secondary"
        ariaLabel={`Open application for ${row.applicant}`}
      >
        Open application
      </AdminScreenLink>
    ),
  },
];

export function ApplicationQueue() {
  return (
    <AdminPage>
      <TePageHeader
        title="Application queue"
        description="Organizations, platform drivers and platform photographers waiting for a decision."
        actions={
          <AdminActions>
            <AdminScreenLink slug="appeal-review" variant="secondary">
              Review appeals
            </AdminScreenLink>
            <AdminScreenLink slug="application-review-detail" variant="primary">
              Open next application
            </AdminScreenLink>
          </AdminActions>
        }
      />
      <StatePreview
        emptyTitle="No applications waiting"
        emptyDescription="Change the filters to see other applications."
        loadingLabel="Loading the application queue."
      >
        <AdminFilters>
          <AdminFilterSelect label="Type" options={TYPE_OPTIONS} />
          <AdminFilterSelect label="Country" options={COUNTRY_OPTIONS} />
          <AdminFilterSelect label="Age" options={AGE_OPTIONS} />
          <AdminFilterSelect label="State" options={STATE_OPTIONS} />
        </AdminFilters>
        <AdminPanel title="Applications">
          <TeDataTable
            columns={COLUMNS}
            rows={APPLICATION_ROWS}
            getRowKey={(row) => row.id}
            caption="Applications waiting for review"
            emptyTitle="No applications waiting"
            emptyDescription="Change the filters to see other applications."
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
