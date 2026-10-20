// SCR-ADM-33 Operations health (docs/design/web/admin/SCR-ADM-33.dc.html): payment success and
// failure, delivery by channel, live trips and check-in events over a time range, with a stale-data
// warning. Live trips come from the trip schedules and delivery from the notification inbox; no
// procedure returns payment rates or check-in events yet, so those cards show their empty state.
import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";
import { TeIcon } from "@trips-app/ui/components/te-icon";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { AdminSelect, type AdminOption } from "../common/admin-form";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import { AdminAlert, AdminCard, AdminGrid, AdminPage } from "../common/admin-ui";
import { HealthBarChart, HealthLineChart, type ChartBar } from "./health-charts";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const STALE_AFTER_MINUTES = 5;
const LINE_POINTS = 12;

const RANGE_MS: Record<string, number> = {
  "1h": HOUR_MS,
  "24h": 24 * HOUR_MS,
  "7d": 7 * 24 * HOUR_MS,
};

const rangeOptions = (): readonly AdminOption[] => [
  { value: "1h", label: t("screen.admin.operations.operationsHealthDashboard.lastHour") },
  { value: "24h", label: t("screen.admin.operations.operationsHealthDashboard.last24Hours") },
  { value: "7d", label: t("screen.admin.operations.operationsHealthDashboard.last7Days") },
];

const CHANNELS = [
  { key: "in_app", labelKey: "screen.admin.operations.operationsHealthDashboard.channelInApp" },
  { key: "push", labelKey: "screen.admin.operations.operationsHealthDashboard.channelPush" },
  { key: "email", labelKey: "screen.admin.operations.operationsHealthDashboard.channelEmail" },
  { key: "sms", labelKey: "screen.admin.operations.operationsHealthDashboard.channelSms" },
] as const;

interface Schedule {
  startsAt: Date | string | null;
  endsAt: Date | string | null;
}

/** How many trips' schedules cover each of `LINE_POINTS` moments from `start` to `end`. */
function liveTripPoints(trips: readonly Schedule[], start: number, end: number): number[] {
  const step = (end - start) / (LINE_POINTS - 1);
  return Array.from({ length: LINE_POINTS }, (_, index) => {
    const moment = start + index * step;
    return trips.filter((trip) => {
      if (!trip.startsAt) return false;
      const from = new Date(trip.startsAt).getTime();
      const to = trip.endsAt ? new Date(trip.endsAt).getTime() : from;
      return from <= moment && moment <= to;
    }).length;
  });
}

/** The current time, ticking every minute after mount (null during server render). */
function useNow(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), MINUTE_MS);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function ChartCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <AdminCard title={title}>
      {children}
      {caption ? <p className="te-caption">{caption}</p> : null}
    </AdminCard>
  );
}

export function OperationsHealthDashboard() {
  const { status: authStatus } = useAuth();
  const [range, setRange] = useState("24h");
  const now = useNow();

  const tripsQuery = useQuery({
    ...serverQueryOptions(orpc.trips.browsePublicTrips, "trips/browsePublicTrips", { input: {} }),
    enabled: authStatus === "authenticated",
  });
  const notificationsQuery = useQuery({
    ...serverQueryOptions(orpc.notifications.listInbox, "notifications/listInbox", { input: {} }),
    enabled: authStatus === "authenticated",
  });

  // Before mount, the newest fetch time stands in for "now", so server and client agree.
  const updatedAt = Math.max(tripsQuery.dataUpdatedAt, notificationsQuery.dataUpdatedAt);
  const end = now ?? updatedAt;
  const start = end - (RANGE_MS[range] ?? RANGE_MS["24h"] ?? HOUR_MS);
  const minutesStale =
    now !== null && updatedAt > 0 ? Math.floor((now - updatedAt) / MINUTE_MS) : 0;

  const livePoints = liveTripPoints(tripsQuery.data?.items ?? [], start, end);
  const livePeak = Math.max(0, ...livePoints);
  const recent = (notificationsQuery.data ?? []).filter(
    (message) => new Date(message.createdAt).getTime() >= start,
  );
  const bars: readonly ChartBar[] = CHANNELS.map((channel) => ({
    key: channel.key,
    label: t(channel.labelKey),
    value: recent.filter((message) => message.channel === channel.key).length,
  }));
  const deliverySummary = bars.map((bar) => `${bar.label} ${bar.value}`).join(", ");

  return (
    <AdminPage
      title={t("screen.admin.operations.operationsHealthDashboard.title")}
      description={t("screen.admin.operations.operationsHealthDashboard.description")}
      actions={
        <AdminSelect
          label={t("screen.admin.operations.operationsHealthDashboard.timeRange")}
          options={rangeOptions()}
          value={range}
          onValueChange={setRange}
          className="w-full sm:w-[200px]"
        />
      }
    >
      {minutesStale >= STALE_AFTER_MINUTES ? (
        <AdminAlert
          tone="warning"
          title={t("screen.admin.operations.operationsHealthDashboard.staleTitle")}
        >
          {t("screen.admin.operations.operationsHealthDashboard.staleBody", {
            minutes: minutesStale,
          })}
        </AdminAlert>
      ) : null}
      <AdminGrid columns={2}>
        <ChartCard title={t("screen.admin.operations.operationsHealthDashboard.paymentsTitle")}>
          <AdminEmpty
            title={t("screen.admin.operations.operationsHealthDashboard.paymentsEmptyTitle")}
            description={t("screen.admin.operations.operationsHealthDashboard.paymentsEmptyBody")}
          />
        </ChartCard>
        <ChartCard
          title={t("screen.admin.operations.operationsHealthDashboard.deliveryTitle")}
          caption={
            recent.length > 0
              ? t("screen.admin.operations.operationsHealthDashboard.deliveryCaption", {
                  summary: deliverySummary,
                })
              : undefined
          }
        >
          <AdminQueryState query={notificationsQuery}>
            {recent.length > 0 ? (
              <HealthBarChart
                label={t("screen.admin.operations.operationsHealthDashboard.deliveryChartLabel", {
                  summary: deliverySummary,
                })}
                bars={bars}
              />
            ) : (
              <AdminEmpty
                title={t("screen.admin.operations.operationsHealthDashboard.deliveryEmptyTitle")}
                description={t(
                  "screen.admin.operations.operationsHealthDashboard.deliveryEmptyBody",
                )}
              />
            )}
          </AdminQueryState>
        </ChartCard>
        <ChartCard
          title={t("screen.admin.operations.operationsHealthDashboard.liveTripsTitle")}
          caption={
            livePeak > 0
              ? t("screen.admin.operations.operationsHealthDashboard.liveTripsCaption", {
                  peak: livePeak,
                })
              : undefined
          }
        >
          <AdminQueryState query={tripsQuery}>
            {livePeak > 0 ? (
              <HealthLineChart
                label={t("screen.admin.operations.operationsHealthDashboard.liveTripsChartLabel", {
                  peak: livePeak,
                })}
                points={livePoints}
              />
            ) : (
              <AdminEmpty
                title={t("screen.admin.operations.operationsHealthDashboard.liveTripsEmptyTitle")}
                description={t(
                  "screen.admin.operations.operationsHealthDashboard.liveTripsEmptyBody",
                )}
              />
            )}
          </AdminQueryState>
        </ChartCard>
        <ChartCard title={t("screen.admin.operations.operationsHealthDashboard.checkInsTitle")}>
          <AdminEmpty
            title={t("screen.admin.operations.operationsHealthDashboard.checkInsEmptyTitle")}
            description={t("screen.admin.operations.operationsHealthDashboard.checkInsEmptyBody")}
          />
        </ChartCard>
      </AdminGrid>
      <AdminCard
        label={t("screen.admin.operations.operationsHealthDashboard.pagingLabel")}
        className="flex-row items-center gap-4"
      >
        <TeIcon name="info" className="size-5 shrink-0" />
        <p className="te-body">
          {t("screen.admin.operations.operationsHealthDashboard.pagingNote")}
        </p>
      </AdminCard>
    </AdminPage>
  );
}
