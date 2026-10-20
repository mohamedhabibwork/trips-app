// SCR-ADM-01 Admin home (docs/design/web/admin/SCR-ADM-01.dc.html): six KPI cards, one per queue
// that needs action now, each with its count and a link to the queue. A queue whose source failed
// to load shows "—" and a warning alert with Retry; the other queues keep their counts.
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { AdminButton, AdminLink, type AdminScreenId } from "../common/admin-actions";
import { AdminAlert, AdminGrid, AdminKpi, AdminPage } from "../common/admin-ui";

/** Applications an admin still has to act on. */
const WAITING_STATES: ReadonlySet<string> = new Set(["Submitted", "Pending Review", "Appealed"]);
/** Driver applications with no decision yet: their lab test is due or overdue. */
const UNDECIDED_STATES: ReadonlySet<string> = new Set(["Submitted", "Pending Review"]);

type QueueSource = "applications" | "exceptions" | "coupons";

interface QueueCard {
  id: string;
  label: string;
  caption: string;
  linkLabel: string;
  screen: AdminScreenId;
  /** The query the count comes from; `null` when no endpoint backs this queue yet. */
  source: QueueSource | null;
  count: number | null;
}

interface QueryLike {
  isError: boolean;
  isPending: boolean;
  isFetching: boolean;
  refetch: () => unknown;
}

function sourceLabel(source: QueueSource): string {
  if (source === "applications") return t("screen.admin.home.adminHome.sourceApplications");
  if (source === "exceptions") return t("screen.admin.home.adminHome.sourceDisputes");
  return t("screen.admin.home.adminHome.sourceCoupons");
}

function KpiValue({ card, query }: { card: QueueCard; query: QueryLike | null }) {
  const unavailable = !query || query.isError || query.isPending || card.count === null;
  if (unavailable) {
    return (
      <span aria-busy={query?.isPending ? "true" : undefined}>
        {t("screen.admin.home.adminHome.noValue")}
      </span>
    );
  }
  return <>{card.count}</>;
}

export function AdminHome() {
  const { status: authStatus } = useAuth();
  const queueQuery = useQuery({
    ...serverQueryOptions(orpc.onboarding.listReviewQueue, "onboarding/listReviewQueue", {
      input: {},
    }),
    enabled: authStatus === "authenticated",
  });
  const exceptionsQuery = useQuery({
    ...serverQueryOptions(
      orpc.accounting.listAdminReconciliationExceptions,
      "accounting/listAdminReconciliationExceptions",
      { input: undefined },
    ),
    enabled: authStatus === "authenticated",
  });
  const couponsQuery = useQuery({
    ...serverQueryOptions(orpc.coupons.listPlatformCoupons, "coupons/listPlatformCoupons", {
      input: {},
    }),
    enabled: authStatus === "authenticated",
  });

  const queries: Record<QueueSource, QueryLike> = {
    applications: queueQuery,
    exceptions: exceptionsQuery,
    coupons: couponsQuery,
  };

  const applications = queueQuery.data ?? [];
  const waiting = applications.filter((app) => WAITING_STATES.has(app.state));
  const overdue = waiting.filter((app) => app.isSlaOverdue).length;
  const labTestsDue = applications.filter(
    (app) => app.applicationType === "platform_driver" && UNDECIDED_STATES.has(app.state),
  ).length;
  const deletionRequests = applications.filter((app) => app.state === "Closed").length;
  // Same rule as the coupons screen: a coupon that hit its usage limit is flagged.
  const couponFlags = (couponsQuery.data?.items ?? []).filter(
    (coupon) => coupon.maxRedemptions !== null && coupon.redemptionsCount >= coupon.maxRedemptions,
  ).length;

  const cards: readonly QueueCard[] = [
    {
      id: "applications",
      label: t("screen.admin.home.adminHome.applicationsWaiting"),
      caption: t("screen.admin.home.adminHome.overdueAfterTwoDays", {
        count: queueQuery.isSuccess ? String(overdue) : t("screen.admin.home.adminHome.noValue"),
      }),
      linkLabel: t("screen.admin.home.adminHome.openApplications"),
      screen: "SCR-ADM-02",
      source: "applications",
      count: waiting.length,
    },
    {
      id: "lab-tests",
      label: t("screen.admin.home.adminHome.labTests"),
      caption: t("screen.admin.home.adminHome.dueOrOverdue"),
      linkLabel: t("screen.admin.home.adminHome.openLabTests"),
      screen: "SCR-ADM-12",
      source: "applications",
      count: labTestsDue,
    },
    {
      id: "disputes",
      label: t("screen.admin.home.adminHome.openDisputes"),
      caption: t("screen.admin.home.adminHome.awaitingAcknowledgement"),
      linkLabel: t("screen.admin.home.adminHome.openDisputesLink"),
      screen: "SCR-ADM-23",
      source: "exceptions",
      count: exceptionsQuery.data?.length ?? null,
    },
    {
      id: "deletions",
      label: t("screen.admin.home.adminHome.deletionRequests"),
      caption: t("screen.admin.home.adminHome.withGraceEndDates"),
      linkLabel: t("screen.admin.home.adminHome.openRequests"),
      screen: "SCR-ADM-10",
      source: "applications",
      count: deletionRequests,
    },
    {
      id: "coupon-flags",
      label: t("screen.admin.home.adminHome.couponAbuseFlags"),
      caption: t("screen.admin.home.adminHome.raisedByAbuseRules"),
      linkLabel: t("screen.admin.home.adminHome.openCoupons"),
      screen: "SCR-ADM-19",
      source: "coupons",
      count: couponFlags,
    },
    {
      id: "settlements",
      label: t("screen.admin.home.adminHome.openSettlements"),
      caption: t("screen.admin.home.adminHome.owedBetweenParties"),
      linkLabel: t("screen.admin.home.adminHome.openSettlementsLink"),
      screen: "SCR-ADM-28",
      // No settlements count is loaded on this page; the tracker owns that data.
      source: null,
      count: null,
    },
  ];

  const failedSources = (Object.keys(queries) as QueueSource[]).filter(
    (source) => queries[source].isError,
  );
  const isRefreshing = Object.values(queries).some((query) => query.isFetching);

  function refreshQueues() {
    void queueQuery.refetch();
    void exceptionsQuery.refetch();
    void couponsQuery.refetch();
  }

  return (
    <AdminPage
      title={t("screen.admin.home.adminHome.title")}
      description={t("screen.admin.home.adminHome.description")}
      actions={
        <AdminButton onClick={refreshQueues} disabled={isRefreshing} aria-busy={isRefreshing}>
          {t("screen.admin.home.adminHome.refreshQueues")}
        </AdminButton>
      }
    >
      <AdminGrid columns={3}>
        {cards.map((card) => (
          <AdminKpi
            key={card.id}
            label={card.label}
            value={<KpiValue card={card} query={card.source ? queries[card.source] : null} />}
            caption={card.caption}
            action={
              <AdminLink screen={card.screen} className="self-start">
                {card.linkLabel}
              </AdminLink>
            }
          />
        ))}
      </AdminGrid>
      {failedSources.map((source) => (
        <AdminAlert
          key={source}
          tone="warning"
          title={t("screen.admin.home.adminHome.queueFailed", { queue: sourceLabel(source) })}
          action={
            <AdminButton small onClick={() => void queries[source].refetch()}>
              {t("screen.admin.home.adminHome.retry")}
            </AdminButton>
          }
        >
          {t("screen.admin.home.adminHome.queueFailedBody")}
        </AdminAlert>
      ))}
    </AdminPage>
  );
}
