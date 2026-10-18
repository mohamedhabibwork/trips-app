import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeRetryBanner } from "@trips-app/ui/components/te-retry-banner";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
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

const INITIAL_QUEUE_ROWS: readonly QueueRow[] = [
  {
    id: "applications",
    queue: "Applications to review",
    count: "0",
    oldest: "-",
    target: "application-queue",
  },
  {
    id: "lab-tests",
    queue: "Lab tests due or overdue",
    count: "0",
    oldest: "-",
    target: "lab-tests-queue",
  },
  {
    id: "disputes",
    queue: "Open disputes",
    count: "0",
    oldest: "-",
    target: "disputes-queue",
  },
  {
    id: "deletions",
    queue: "Deletion requests",
    count: "0",
    oldest: "-",
    target: "deletion-and-data-requests",
  },
  {
    id: "coupon-flags",
    queue: "Coupon abuse flags",
    count: "0",
    oldest: "-",
    target: "platform-coupons",
  },
  {
    id: "settlements",
    queue: "Open settlements",
    count: "0",
    oldest: "-",
    target: "settlements-tracker",
  },
];

const COLUMNS = (): readonly TeDataTableColumn<QueueRow>[] => [
  { key: "queue", header: t("screen.admin.home.adminHome.queue") },
  { key: "count", header: t("screen.admin.home.adminHome.items"), align: "end" },
  { key: "oldest", header: t("screen.admin.home.adminHome.oldestItem") },
  {
    key: "open",
    header: t("screen.admin.home.adminHome.action"),
    render: (row) => (
      <AdminScreenLink
        slug={row.target}
        variant="secondary"
        ariaLabel={t("screen.admin.home.adminHome.open", { queue: row.queue })}
      >
        {t("screen.admin.home.adminHome.openQueue")}
      </AdminScreenLink>
    ),
  },
];

const MORE_AREAS = (): readonly { slug: AdminSlug; label: string }[] => [
  { slug: "admin-staff-accounts", label: t("screen.admin.home.adminHome.adminStaffAccounts") },
  {
    slug: "subscriptions-and-overrides",
    label: t("screen.admin.home.adminHome.subscriptionsAndOverrides"),
  },
  { slug: "revenue-dashboard", label: t("screen.admin.home.adminHome.revenueDashboard") },
  { slug: "notification-templates", label: t("screen.admin.home.adminHome.notificationTemplates") },
];

export function AdminHome() {
  const { status: authStatus } = useAuth();
  const queueQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });
  const exceptionsQuery = useQuery({
    ...orpc.accounting.listAdminReconciliationExceptions.queryOptions(),
    enabled: authStatus === "authenticated",
  });
  const couponsQuery = useQuery({
    ...orpc.coupons.listPlatformCoupons.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });

  const loadFailed = queueQuery.isError || exceptionsQuery.isError || couponsQuery.isError;

  const handleRetry = useCallback(() => {
    void queueQuery.refetch();
    void exceptionsQuery.refetch();
    void couponsQuery.refetch();
  }, [queueQuery, exceptionsQuery, couponsQuery]);

  const apps = queueQuery.data ?? [];
  const exceptions = exceptionsQuery.data ?? [];
  const coupons = couponsQuery.data ?? { items: [] };

  const driverApps = apps.filter((a) => a.applicationType === "platform_driver");
  const closedApps = apps.filter((a) => a.state === "Closed");
  const formatDate = (d: Date | string | undefined) =>
    d ? new Date(d).toISOString().slice(0, 10) : "-";

  const queueRows: readonly QueueRow[] =
    queueQuery.data || exceptionsQuery.data || couponsQuery.data
      ? [
          {
            id: "applications",
            queue: "Applications to review",
            count: String(apps.length),
            oldest: formatDate(apps[apps.length - 1]?.createdAt),
            target: "application-queue",
          },
          {
            id: "lab-tests",
            queue: "Lab tests due or overdue",
            count: String(driverApps.length),
            oldest: formatDate(driverApps[driverApps.length - 1]?.createdAt),
            target: "lab-tests-queue",
          },
          {
            id: "disputes",
            queue: "Open disputes",
            count: String(exceptions.length),
            oldest: formatDate(exceptions[exceptions.length - 1]?.createdAt),
            target: "disputes-queue",
          },
          {
            id: "deletions",
            queue: "Deletion requests",
            count: String(closedApps.length),
            oldest: formatDate(closedApps[closedApps.length - 1]?.updatedAt),
            target: "deletion-and-data-requests",
          },
          {
            id: "coupon-flags",
            queue: "Coupon abuse flags",
            count: String(coupons.items.filter((c) => c.status === "paused").length),
            oldest: formatDate(coupons.items[0]?.createdAt),
            target: "platform-coupons",
          },
          {
            id: "settlements",
            queue: "Open settlements",
            count: String(exceptions.length),
            oldest: formatDate(exceptions[0]?.createdAt),
            target: "settlements-tracker",
          },
        ]
      : INITIAL_QUEUE_ROWS;

  return (
    <AdminPage backHome={false}>
      <AdminNav current="admin-home" />
      <TePageHeader
        title={t("screen.admin.home.adminHome.adminHome")}
        description={t("screen.admin.home.adminHome.queuesThatNeedActionNow")}
      />
      <StatePreview
        emptyTitle={t("screen.admin.home.adminHome.allClear")}
        emptyDescription={t("screen.admin.home.adminHome.noQueueHasItemsThat")}
        loadingLabel={t("screen.admin.home.adminHome.loadingTheQueues")}
      >
        {loadFailed ? (
          <TeRetryBanner
            message={t("screen.admin.home.adminHome.theLabTestsQueueCould")}
            onRetry={handleRetry}
            retryLabel={t("screen.admin.home.adminHome.retryLabTests")}
          />
        ) : null}
        <AdminPanel title={t("screen.admin.home.adminHome.queues")}>
          <TeDataTable
            columns={COLUMNS()}
            rows={queueRows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.home.adminHome.queuesThatNeedAction")}
            emptyTitle={t("screen.admin.home.adminHome.allClearEmptyTitle")}
            emptyDescription={t("screen.admin.home.adminHome.noQueueHasItemsThatEmptyDescription")}
          />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.home.adminHome.moreAreas")}>
          <ul className="flex flex-col gap-2">
            {MORE_AREAS().map((area) => (
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
