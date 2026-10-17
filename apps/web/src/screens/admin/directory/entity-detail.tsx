import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeTimeline, type TeTimelineItem } from "@trips-app/ui/components/te-timeline";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminActions,
  AdminFacts,
  AdminPage,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface TripRow {
  id: string;
  trip: string;
  state: string;
  dates: string;
}

const TRIP_ROWS: readonly TripRow[] = [
  { id: "trip-1", trip: "[Trip reference]", state: "[Trip state]", dates: "[Dates]" },
];

const HISTORY: readonly TeTimelineItem[] = [
  { id: "h1", time: "[Date and time]", label: "[Admin action from the audit log]", state: "done" },
  { id: "h2", time: "[Date and time]", label: "[Admin action from the audit log]", state: "done" },
];

const ACTIVE: AdminStatusPresentation = { tone: "success", icon: "check", label: "Active" };

const TRIP_COLUMNS: readonly TeDataTableColumn<TripRow>[] = [
  { key: "trip", header: "Trip" },
  { key: "state", header: "State" },
  { key: "dates", header: "Dates" },
];

export function EntityDetail() {
  return (
    <AdminPage>
      <TePageHeader
        title="Entity detail"
        description="[Entity name]. Profile, plan, trips, bookings and history."
        actions={
          <AdminActions>
            <AdminScreenLink slug="deletion-and-data-requests" variant="ghost">
              Handle deletion
            </AdminScreenLink>
            <AdminScreenLink slug="subscriptions-and-overrides" variant="secondary">
              Grant or override plan
            </AdminScreenLink>
            <AdminScreenLink slug="request-lab-test-decision" variant="secondary">
              Request lab test
            </AdminScreenLink>
            <AdminScreenLink slug="suspend-or-reinstate-decision" variant="primary">
              Suspend or reinstate
            </AdminScreenLink>
          </AdminActions>
        }
      />
      <StatePreview
        emptyTitle="No trips or bookings"
        emptyDescription="This account has no trips or bookings yet."
        loadingLabel="Loading the account."
      >
        <TeInlineAlert tone="warning" title="Suspended">
          Sign-in is refused while the account is suspended. Data is kept.
        </TeInlineAlert>
        <AdminPanel title="Profile">
          <AdminStatus status={ACTIVE} />
          <AdminFacts
            items={[
              { label: "Name", value: "[Entity name]" },
              { label: "Email", value: "[Email]" },
              { label: "Phone", value: "[Phone]" },
              { label: "Country", value: "[Country]" },
              { label: "Entity type", value: "[Entity type]" },
              { label: "Deletion request", value: "[None, or grace end date]" },
            ]}
          />
          <AdminScreenLink slug="users-and-entities-directory">Back to directory</AdminScreenLink>
        </AdminPanel>
        <AdminPanel title="Role assignments">
          <p>[Role assignments]</p>
        </AdminPanel>
        <AdminPanel title="Plan and subscription">
          <AdminFacts
            items={[
              { label: "Plan", value: "[Plan name]" },
              { label: "Billing status", value: "[Billing status]" },
              { label: "Renewal date", value: "[Date]" },
            ]}
          />
        </AdminPanel>
        <AdminPanel title="Trips and bookings">
          <TeDataTable
            columns={TRIP_COLUMNS}
            rows={TRIP_ROWS}
            getRowKey={(row) => row.id}
            caption="Trips and bookings"
            emptyTitle="No trips or bookings"
            emptyDescription="This account has no trips or bookings yet."
          />
        </AdminPanel>
        <AdminPanel title="Audit history">
          <TeTimeline items={HISTORY} ariaLabel="Audit history for this account" />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
