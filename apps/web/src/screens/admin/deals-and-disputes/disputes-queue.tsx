import { useQuery } from "@tanstack/react-query";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminFilterSelect,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminStatus,
  setSelectedAdminDisputeId,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface DisputeRow {
  id: string;
  parties: string;
  reference: string;
  type: string;
  age: string;
  state: "awaiting" | "acknowledged" | "resolved";
}

const DEFAULT_DISPUTE_ROWS: readonly DisputeRow[] = [];

const STATE_PRESENTATION = (): Record<DisputeRow["state"], AdminStatusPresentation> => ({
  awaiting: {
    tone: "warning",
    icon: "clock",
    label: t("screen.admin.dealsAndDisputes.disputesQueue.awaitingAcknowledgement"),
  },
  acknowledged: {
    tone: "info",
    icon: "check",
    label: t("screen.admin.dealsAndDisputes.disputesQueue.acknowledged"),
  },
  resolved: {
    tone: "success",
    icon: "check",
    label: t("screen.admin.dealsAndDisputes.disputesQueue.resolved"),
  },
});

const TYPE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.dealsAndDisputes.disputesQueue.allTypes") },
  {
    value: "placeholder",
    label: t("screen.admin.dealsAndDisputes.disputesQueue.disputeTypesPendingD251"),
  },
];
const STATE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.dealsAndDisputes.disputesQueue.anyState") },
  {
    value: "awaiting",
    label: t("screen.admin.dealsAndDisputes.disputesQueue.awaitingAcknowledgementLabel"),
  },
  {
    value: "acknowledged",
    label: t("screen.admin.dealsAndDisputes.disputesQueue.acknowledgedLabel"),
  },
  { value: "resolved", label: t("screen.admin.dealsAndDisputes.disputesQueue.resolvedLabel") },
];

const COLUMNS = (): readonly TeDataTableColumn<DisputeRow>[] => [
  { key: "parties", header: t("screen.admin.dealsAndDisputes.disputesQueue.parties") },
  { key: "reference", header: t("screen.admin.dealsAndDisputes.disputesQueue.bookingOrTrip") },
  { key: "type", header: t("screen.admin.dealsAndDisputes.disputesQueue.type") },
  { key: "age", header: t("screen.admin.dealsAndDisputes.disputesQueue.age"), align: "end" },
  {
    key: "state",
    header: t("screen.admin.dealsAndDisputes.disputesQueue.state"),
    render: (row) => <AdminStatus status={STATE_PRESENTATION()[row.state]} />,
  },
  {
    key: "open",
    header: t("screen.admin.dealsAndDisputes.disputesQueue.action"),
    render: (row) => (
      <span onClick={() => setSelectedAdminDisputeId(row.id)}>
        <AdminScreenLink
          slug="dispute-detail-and-refund-decision"
          variant="secondary"
          ariaLabel={t("screen.admin.dealsAndDisputes.disputesQueue.openDispute", {
            reference: row.reference,
          })}
        >
          {t("screen.admin.dealsAndDisputes.disputesQueue.openDispute2")}
        </AdminScreenLink>
      </span>
    ),
  },
];

export function DisputesQueue() {
  const exceptionsQuery = useQuery(
    orpc.accounting.listAdminReconciliationExceptions.queryOptions(),
  );

  const rows: readonly DisputeRow[] =
    exceptionsQuery.data && exceptionsQuery.data.length > 0
      ? exceptionsQuery.data.map((exc) => {
          const refId = exc.bookingId ?? exc.tripId ?? exc.id;
          return {
            id: exc.id,
            parties: `Tenant ${exc.tenantId.slice(0, 8)}`,
            reference: `${exc.entryType.toUpperCase()}-${refId.slice(0, 8)}`,
            type: exc.description || exc.entryType,
            age: new Date(exc.createdAt).toISOString().slice(0, 10),
            state: (exc.status === "settled" ? "resolved" : "awaiting") as DisputeRow["state"],
          };
        })
      : DEFAULT_DISPUTE_ROWS;

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.dealsAndDisputes.disputesQueue.disputesQueue")}
        description={t("screen.admin.dealsAndDisputes.disputesQueue.workDisputesBetweenParties")}
      />
      <StatePreview
        emptyTitle={t("screen.admin.dealsAndDisputes.disputesQueue.noOpenDisputes")}
        emptyDescription={t(
          "screen.admin.dealsAndDisputes.disputesQueue.noDisputesMatchTheseFilters",
        )}
        loadingLabel={t("screen.admin.dealsAndDisputes.disputesQueue.loadingTheDisputes")}
      >
        <TeInlineAlert
          tone="info"
          title={t("screen.admin.dealsAndDisputes.disputesQueue.deadlines")}
        >
          {t("screen.admin.dealsAndDisputes.disputesQueue.acknowledgeADisputeWithin2")}
        </TeInlineAlert>
        <AdminFilters>
          <AdminFilterSelect
            label={t("screen.admin.dealsAndDisputes.disputesQueue.typeLabel")}
            options={TYPE_OPTIONS()}
          />
          <AdminFilterSelect
            label={t("screen.admin.dealsAndDisputes.disputesQueue.stateLabel")}
            options={STATE_OPTIONS()}
          />
        </AdminFilters>
        <AdminPanel title={t("screen.admin.dealsAndDisputes.disputesQueue.disputes")}>
          <TeDataTable
            columns={COLUMNS()}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.dealsAndDisputes.disputesQueue.disputesQueueCaption")}
            emptyTitle={t("screen.admin.dealsAndDisputes.disputesQueue.noOpenDisputesEmptyTitle")}
            emptyDescription={t(
              "screen.admin.dealsAndDisputes.disputesQueue.noDisputesMatchTheseFiltersEmptyDescription",
            )}
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
