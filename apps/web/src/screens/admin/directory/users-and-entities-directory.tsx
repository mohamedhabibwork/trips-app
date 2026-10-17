import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import {
  TE_ROLES,
  TeRoleBadge,
  roleLabel,
  type TeRole,
} from "@trips-app/ui/components/te-role-badge";
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
  AdminSearch,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface EntityRow {
  id: string;
  name: string;
  role: TeRole;
  organization: string;
  status: "active" | "suspended";
}

const ENTITY_ROWS: readonly EntityRow[] = [
  {
    id: "entity-1",
    name: "[Name]",
    role: "driver",
    organization: "[Organization]",
    status: "active",
  },
  {
    id: "entity-2",
    name: "[Name]",
    role: "organization",
    organization: "[Organization]",
    status: "suspended",
  },
];

const STATUS_PRESENTATION: Record<EntityRow["status"], AdminStatusPresentation> = {
  active: { tone: "success", icon: "check", label: "Active" },
  suspended: { tone: "danger", icon: "lock", label: "Suspended" },
};

const ROLE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "All roles" },
  ...TE_ROLES.map((role) => ({ value: role, label: roleLabel(role) })),
];
const STATUS_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "deletion", label: "Deletion requested" },
];

const COLUMNS: readonly TeDataTableColumn<EntityRow>[] = [
  { key: "name", header: "Name" },
  { key: "role", header: "Role", render: (row) => <TeRoleBadge role={row.role} /> },
  { key: "organization", header: "Organization" },
  {
    key: "status",
    header: "Status",
    render: (row) => <AdminStatus status={STATUS_PRESENTATION[row.status]} />,
  },
  {
    key: "open",
    header: "Action",
    render: (row) => (
      <AdminScreenLink slug="entity-detail" variant="secondary" ariaLabel={`Open ${row.name}`}>
        Open
      </AdminScreenLink>
    ),
  },
];

export function UsersAndEntitiesDirectory() {
  return (
    <AdminPage>
      <TePageHeader
        title="Users and entities directory"
        description="Find any user, organization, driver, photographer or moderator."
        actions={
          <AdminActions>
            <AdminScreenLink slug="deletion-and-data-requests" variant="secondary">
              Deletion requests
            </AdminScreenLink>
            <AdminScreenLink slug="admin-staff-accounts" variant="secondary">
              Admin staff accounts
            </AdminScreenLink>
          </AdminActions>
        }
      />
      <StatePreview
        emptyTitle="No results"
        emptyDescription="Change the search or the filters."
        loadingLabel="Loading the directory."
      >
        <AdminFilters>
          <AdminSearch
            label="Search"
            placeholder="Name, email, phone, organization or reference"
            clearLabel="Clear search"
          />
          <AdminFilterSelect label="Role" options={ROLE_OPTIONS} />
          <AdminFilterSelect label="Status" options={STATUS_OPTIONS} />
        </AdminFilters>
        <AdminPanel title="Results">
          <TeDataTable
            columns={COLUMNS}
            rows={ENTITY_ROWS}
            getRowKey={(row) => row.id}
            caption="Users and entities"
            emptyTitle="No results"
            emptyDescription="Change the search or the filters."
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
