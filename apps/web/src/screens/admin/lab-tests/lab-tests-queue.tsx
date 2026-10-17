import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
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
  AdminToggle,
  type AdminStatusPresentation,
} from "../common/admin-shared";

type LabState = "requested" | "pending" | "result-uploaded" | "passed" | "failed" | "missed";

interface LabTestRow {
  id: string;
  driver: string;
  track: string;
  requested: string;
  deadline: string;
  state: LabState;
  overdue: boolean;
}

const LAB_TEST_ROWS: readonly LabTestRow[] = [
  {
    id: "lab-1",
    driver: "[Driver name]",
    track: "[Test type]",
    requested: "[Date]",
    deadline: "[Date]",
    state: "result-uploaded",
    overdue: false,
  },
  {
    id: "lab-2",
    driver: "[Driver name]",
    track: "[Test type]",
    requested: "[Date]",
    deadline: "[Date]",
    state: "missed",
    overdue: true,
  },
];

const STATE_PRESENTATION: Record<LabState, AdminStatusPresentation> = {
  requested: { tone: "info", icon: "clock", label: "Requested" },
  pending: { tone: "info", icon: "clock", label: "Pending" },
  "result-uploaded": { tone: "highlight", icon: "file", label: "Result uploaded" },
  passed: { tone: "success", icon: "check", label: "Passed" },
  failed: { tone: "danger", icon: "close", label: "Failed" },
  missed: { tone: "danger", icon: "alert", label: "Missed" },
};

const OVERDUE: AdminStatusPresentation = { tone: "danger", icon: "alert", label: "Overdue" };

const STATE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "Any state" },
  { value: "requested", label: "Requested" },
  { value: "pending", label: "Pending" },
  { value: "result-uploaded", label: "Result uploaded" },
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
  { value: "missed", label: "Missed" },
];

const COLUMNS: readonly TeDataTableColumn<LabTestRow>[] = [
  { key: "driver", header: "Driver" },
  { key: "track", header: "Track" },
  { key: "requested", header: "Requested" },
  { key: "deadline", header: "Deadline" },
  {
    key: "state",
    header: "State",
    render: (row) => <AdminStatus status={STATE_PRESENTATION[row.state]} />,
  },
  {
    key: "overdue",
    header: "Overdue",
    render: (row) => (row.overdue ? <AdminStatus status={OVERDUE} /> : <span>Not overdue</span>),
  },
  {
    key: "open",
    header: "Action",
    render: (row) => (
      <AdminScreenLink
        slug="lab-test-detail-and-decision"
        variant="secondary"
        ariaLabel={`Open lab test for ${row.driver}`}
      >
        Open test
      </AdminScreenLink>
    ),
  },
];

export function LabTestsQueue() {
  return (
    <AdminPage>
      <TePageHeader
        title="Lab tests queue"
        description="Track lab tests by state and deadline."
        actions={
          <AdminActions>
            <AdminScreenLink slug="request-lab-test-decision" variant="secondary">
              Request lab test
            </AdminScreenLink>
            <AdminScreenLink slug="lab-test-detail-and-decision" variant="primary">
              Open next due test
            </AdminScreenLink>
          </AdminActions>
        }
      />
      <StatePreview
        emptyTitle="No lab tests"
        emptyDescription="No lab tests match these filters."
        loadingLabel="Loading the lab tests."
      >
        <AdminFilters>
          <AdminToggle label="Overdue only" />
          <AdminFilterSelect label="State" options={STATE_OPTIONS} />
        </AdminFilters>
        <AdminPanel title="Lab tests">
          <TeDataTable
            columns={COLUMNS}
            rows={LAB_TEST_ROWS}
            getRowKey={(row) => row.id}
            caption="Lab tests"
            emptyTitle="No lab tests"
            emptyDescription="No lab tests match these filters."
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
