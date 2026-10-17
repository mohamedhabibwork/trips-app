import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
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

const CHANNEL_ROWS: readonly ChannelRow[] = [
  { id: "ch-1", channel: "[Channel name]", delivered: "0", failed: "0", rate: "[Percent]" },
  { id: "ch-2", channel: "[Channel name]", delivered: "0", failed: "0", rate: "[Percent]" },
];

const RANGE_OPTIONS: readonly TeSelectOption[] = [
  { value: "1h", label: "Last hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
];

const COLUMNS: readonly TeDataTableColumn<ChannelRow>[] = [
  { key: "channel", header: "Channel" },
  { key: "delivered", header: "Delivered", align: "end" },
  { key: "failed", header: "Failed", align: "end" },
  { key: "rate", header: "Delivery rate", align: "end" },
];

export function OperationsHealthDashboard() {
  return (
    <AdminPage>
      <TePageHeader
        title="Operations health dashboard"
        description="Trip operations, payment success and failure rates, and notification delivery by channel."
      />
      <StatePreview
        emptyTitle="No data"
        emptyDescription="No operations data is available for the selected range."
        loadingLabel="Loading the operations data."
      >
        <AdminFilters>
          <AdminFilterSelect label="Time range" options={RANGE_OPTIONS} />
        </AdminFilters>
        <AdminKpiGrid>
          <TeKpiTile label="Payment success rate" value="[Percent]" />
          <TeKpiTile label="Payment failure rate" value="[Percent]" />
          <TeKpiTile label="Live trips" value="0" />
          <TeKpiTile label="Check-in events" value="0" />
          <TeKpiTile label="Notifications delivered" value="[Percent]" hint="All channels" />
        </AdminKpiGrid>
        <AdminPanel title="Payment success and failure">
          <AdminChartPlaceholder label="Payment success and failure over the selected range" />
        </AdminPanel>
        <AdminPanel title="Notification delivery by channel">
          <TeDataTable
            columns={COLUMNS}
            rows={CHANNEL_ROWS}
            getRowKey={(row) => row.id}
            caption="Notification delivery by channel"
            emptyTitle="No delivery data"
            emptyDescription="No notifications were sent in the selected range."
          />
        </AdminPanel>
        <p className="te-caption">
          Critical alerts go to on-call (NFR-OBS-04). This dashboard does not replace alerting.
        </p>
      </StatePreview>
    </AdminPage>
  );
}
