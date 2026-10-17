import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { StatePreview } from "../common/admin-state-preview";
import {
  AdminActions,
  AdminPage,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface AdminRow {
  id: string;
  name: string;
  email: string;
  state: "active" | "setup-required";
  authenticator: string;
}

const ADMIN_ROWS: readonly AdminRow[] = [
  {
    id: "admin-1",
    name: "[Admin name]",
    email: "[Email]",
    state: "active",
    authenticator: "Set up",
  },
  {
    id: "admin-2",
    name: "[Admin name]",
    email: "[Email]",
    state: "setup-required",
    authenticator: "Not set up",
  },
];

const STATE_PRESENTATION: Record<AdminRow["state"], AdminStatusPresentation> = {
  active: { tone: "success", icon: "check", label: "Active" },
  "setup-required": { tone: "warning", icon: "clock", label: "Set-up required" },
};

const COLUMNS: readonly TeDataTableColumn<AdminRow>[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  {
    key: "state",
    header: "Status",
    render: (row) => <AdminStatus status={STATE_PRESENTATION[row.state]} />,
  },
  { key: "authenticator", header: "Authenticator" },
  {
    key: "reset",
    header: "Action",
    render: (row) => (
      <TeButton variant="ghost" aria-label={`Reset authenticator for ${row.name}`}>
        Reset authenticator
      </TeButton>
    ),
  },
];

export function AdminStaffAccounts() {
  return (
    <AdminPage>
      <TePageHeader
        title="Admin staff accounts"
        description="Create admin accounts and see their set-up state."
      />
      <StatePreview
        emptyTitle="No admin accounts"
        emptyDescription="Create the first admin account above."
        loadingLabel="Loading the admin accounts."
      >
        <AdminPanel title="Create admin account">
          <TeInput label="Full name" placeholder="[Full name]" required />
          <TeInput label="Email" type="email" placeholder="[Email]" required />
          <TeInput
            label="Country"
            placeholder="[Country]"
            supportingText="Country is proposed in D-49."
          />
          <AdminActions>
            <TeButton>Create admin account</TeButton>
          </AdminActions>
        </AdminPanel>
        <TeInlineAlert tone="info" title="How admin accounts start">
          A new admin must set up an authenticator at first sign-in. Only an existing admin can
          create an admin account. There is no self-registration.
        </TeInlineAlert>
        <AdminPanel title="Admin accounts">
          <TeDataTable
            columns={COLUMNS}
            rows={ADMIN_ROWS}
            getRowKey={(row) => row.id}
            caption="Admin staff accounts"
            emptyTitle="No admin accounts"
            emptyDescription="Create the first admin account above."
          />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
