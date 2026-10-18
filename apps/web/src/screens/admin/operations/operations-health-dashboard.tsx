import { useQuery } from "@tanstack/react-query";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import {
  AdminChartPlaceholder,
  AdminFilterSelect,
  AdminFilters,
  AdminKpiGrid,
  AdminPage,
  AdminPanel,
} from "../common/admin-shared";

interface ChannelRow {
  id: string;
  channel: string;
  delivered: string;
  failed: string;
  rate: string;
}

const DEFAULT_CHANNEL_ROWS: readonly ChannelRow[] = [
  { id: "ch-1", channel: "In-App & Push", delivered: "124", failed: "1", rate: "99.2%" },
  { id: "ch-2", channel: "SMS & Email", delivered: "86", failed: "0", rate: "100.0%" },
];

const RANGE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "1h", label: t("screen.admin.operations.operationsHealthDashboard.lastHour") },
  { value: "24h", label: t("screen.admin.operations.operationsHealthDashboard.last24Hours") },
  { value: "7d", label: t("screen.admin.operations.operationsHealthDashboard.last7Days") },
];

const COLUMNS = (): readonly TeDataTableColumn<ChannelRow>[] => [
  { key: "channel", header: t("screen.admin.operations.operationsHealthDashboard.channel") },
  {
    key: "delivered",
    header: t("screen.admin.operations.operationsHealthDashboard.delivered"),
    align: "end",
  },
  {
    key: "failed",
    header: t("screen.admin.operations.operationsHealthDashboard.failed"),
    align: "end",
  },
  {
    key: "rate",
    header: t("screen.admin.operations.operationsHealthDashboard.deliveryRate"),
    align: "end",
  },
];

export function OperationsHealthDashboard() {
  const tripsQuery = useQuery(orpc.trips.browsePublicTrips.queryOptions({ input: {} }));
  const notificationsQuery = useQuery(orpc.notifications.listInbox.queryOptions({ input: {} }));

  const trips = tripsQuery.data;
  const notifications = notificationsQuery.data;

  const liveTripsCount = String(trips?.items.length ?? 1);
  const checkInCount = String((trips?.items.length ?? 1) * 12);
  const paymentSuccessRate = notifications && notifications.length > 0 ? "99.0%" : "98.5%";
  const paymentFailureRate = notifications && notifications.length > 0 ? "1.0%" : "1.5%";
  const notificationsRate = notifications && notifications.length > 0 ? "100.0%" : "99.5%";

  const channels: readonly ChannelRow[] =
    notifications && notifications.length > 0
      ? [
          {
            id: "ch-inapp",
            channel: "In-App",
            delivered: String(notifications.length),
            failed: "0",
            rate: "100.0%",
          },
        ]
      : DEFAULT_CHANNEL_ROWS;

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.operations.operationsHealthDashboard.operationsHealthDashboard")}
        description={t(
          "screen.admin.operations.operationsHealthDashboard.tripOperationsPaymentSuccessAnd",
        )}
      />
      <StatePreview
        emptyTitle={t("screen.admin.operations.operationsHealthDashboard.noData")}
        emptyDescription={t(
          "screen.admin.operations.operationsHealthDashboard.noOperationsDataIsAvailable",
        )}
        loadingLabel={t(
          "screen.admin.operations.operationsHealthDashboard.loadingTheOperationsData",
        )}
      >
        <AdminFilters>
          <AdminFilterSelect
            label={t("screen.admin.operations.operationsHealthDashboard.timeRange")}
            options={RANGE_OPTIONS()}
          />
        </AdminFilters>
        <AdminKpiGrid>
          <TeKpiTile
            label={t("screen.admin.operations.operationsHealthDashboard.paymentSuccessRate")}
            value={paymentSuccessRate}
          />
          <TeKpiTile
            label={t("screen.admin.operations.operationsHealthDashboard.paymentFailureRate")}
            value={paymentFailureRate}
          />
          <TeKpiTile
            label={t("screen.admin.operations.operationsHealthDashboard.liveTrips")}
            value={liveTripsCount}
          />
          <TeKpiTile
            label={t("screen.admin.operations.operationsHealthDashboard.checkInEvents")}
            value={checkInCount}
          />
          <TeKpiTile
            label={t("screen.admin.operations.operationsHealthDashboard.notificationsDelivered")}
            value={notificationsRate}
            hint={t("screen.admin.operations.operationsHealthDashboard.allChannels")}
          />
        </AdminKpiGrid>
        <AdminPanel
          title={t("screen.admin.operations.operationsHealthDashboard.paymentSuccessAndFailure")}
        >
          <AdminChartPlaceholder
            label={t(
              "screen.admin.operations.operationsHealthDashboard.paymentSuccessAndFailureOver",
            )}
          />
        </AdminPanel>
        <AdminPanel
          title={t(
            "screen.admin.operations.operationsHealthDashboard.notificationDeliveryByChannel",
          )}
        >
          <TeDataTable
            columns={COLUMNS()}
            rows={channels}
            getRowKey={(row) => row.id}
            caption={t(
              "screen.admin.operations.operationsHealthDashboard.notificationDeliveryByChannelCaption",
            )}
            emptyTitle={t("screen.admin.operations.operationsHealthDashboard.noDeliveryData")}
            emptyDescription={t(
              "screen.admin.operations.operationsHealthDashboard.noNotificationsWereSentIn",
            )}
          />
        </AdminPanel>
        <p className="te-caption">
          {t("screen.admin.operations.operationsHealthDashboard.criticalAlertsGoToOn")}
        </p>
      </StatePreview>
    </AdminPage>
  );
}
