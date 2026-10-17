import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeRetryBanner } from "@trips-app/ui/components/te-retry-banner";
import { AdminNav } from "../common/admin-nav";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink, type AdminSlug } from "../common/admin-links";
import { AdminPage, AdminPanel } from "../common/admin-shared";

interface QueueRow {
  id: string;
  queue: string;
  count: string;
  oldest: string;
  target: AdminSlug;
}

const QUEUE_ROWS: readonly QueueRow[] = [
  {
    id: "applications",
    queue: "Applications to review",
    count: "0",
    oldest: "[Date]",
    target: "application-queue",
  },
  {
    id: "lab-tests",
    queue: "Lab tests due or overdue",
    count: "0",
    oldest: "[Date]",
    target: "lab-tests-queue",
  },
  {
    id: "disputes",
    queue: "Open disputes",
    count: "0",
    oldest: "[Date]",
    target: "disputes-queue",
  },
  {
    id: "deletions",
    queue: "Deletion requests",
    count: "0",
    oldest: "[Grace end date]",
    target: "deletion-and-data-requests",
  },
  {
    id: "coupon-flags",
    queue: "Coupon abuse flags",
    count: "0",
    oldest: "[Date]",
    target: "platform-coupons",
  },
  {
    id: "settlements",
    queue: "Open settlements",
    count: "0",
    oldest: "[Date]",
    target: "settlements-tracker",
  },
];

const COLUMNS: readonly TeDataTableColumn<QueueRow>[] = [
  { key: "queue", header: "Queue" },
  { key: "count", header: "Items", align: "end" },
  { key: "oldest", header: "Oldest item" },
  {
    key: "open",
    header: "Action",
    render: (row) => (
      <AdminScreenLink slug={row.target} variant="secondary" ariaLabel={`Open ${row.queue}`}>
        Open queue
      </AdminScreenLink>
    ),
  },
];

const MORE_AREAS: readonly { slug: AdminSlug; label: string }[] = [
  { slug: "admin-staff-accounts", label: "Admin staff accounts" },
  { slug: "subscriptions-and-overrides", label: "Subscriptions and overrides" },
  { slug: "revenue-dashboard", label: "Revenue dashboard" },
  { slug: "notification-templates", label: "Notification templates" },
];

export function AdminHome() {
  return (
    <AdminPage backHome={false}>
      <AdminNav current="admin-home" />
      <TePageHeader
        title="Admin home"
        description="Queues that need action now. Applications are flagged overdue after 2 working days."
      />
      <StatePreview
        emptyTitle="All clear"
        emptyDescription="No queue has items that need action."
        loadingLabel="Loading the queues."
      >
        <TeRetryBanner
          message="The lab tests queue could not load. The other queues are shown."
          onRetry={() => undefined}
          retryLabel="Retry lab tests"
        />
        <AdminPanel title="Queues">
          <TeDataTable
            columns={COLUMNS}
            rows={QUEUE_ROWS}
            getRowKey={(row) => row.id}
            caption="Queues that need action"
            emptyTitle="All clear"
            emptyDescription="No queue has items that need action."
          />
        </AdminPanel>
        <AdminPanel title="More areas">
          <ul className="flex flex-col gap-2">
            {MORE_AREAS.map((area) => (
              <li key={area.slug}>
                <AdminScreenLink slug={area.slug}>{area.label}</AdminScreenLink>
              </li>
            ))}
          </ul>
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
