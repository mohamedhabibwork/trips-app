import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
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
  AdminSearch,
  AdminStatus,
  setSelectedAdminDealId,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface DealRow {
  id: string;
  organization: string;
  supplier: string;
  vehicle: string;
  state: "open" | "finalized" | "rejected";
  counters: string;
  finalAmount: string;
}

const DEFAULT_DEAL_ROWS: readonly DealRow[] = [];

const STATE_PRESENTATION = (): Record<DealRow["state"], AdminStatusPresentation> => ({
  open: {
    tone: "info",
    icon: "clock",
    label: t("screen.admin.dealsAndDisputes.dealAuditList.open"),
  },
  finalized: {
    tone: "success",
    icon: "check",
    label: t("screen.admin.dealsAndDisputes.dealAuditList.finalized"),
  },
  rejected: {
    tone: "danger",
    icon: "close",
    label: t("screen.admin.dealsAndDisputes.dealAuditList.rejected"),
  },
});

const STATE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.dealsAndDisputes.dealAuditList.anyState") },
  { value: "open", label: t("screen.admin.dealsAndDisputes.dealAuditList.openLabel") },
  { value: "finalized", label: t("screen.admin.dealsAndDisputes.dealAuditList.finalizedLabel") },
  { value: "rejected", label: t("screen.admin.dealsAndDisputes.dealAuditList.rejectedLabel") },
];

export function DealAuditList() {
  const queryClient = useQueryClient();
  const dealsQuery = useQuery(
    orpc.negotiation.listOrganizationNegotiations.queryOptions({ input: {} }),
  );

  const flagMutation = useMutation(
    orpc.accounting.flagReconciliationException.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.accounting.key() });
      },
    }),
  );

  const rows: readonly DealRow[] =
    dealsQuery.data?.items && dealsQuery.data.items.length > 0
      ? dealsQuery.data.items.map((offer) => ({
          id: offer.id,
          organization: offer.tenantId.slice(0, 8),
          supplier: offer.supplierAccountId.slice(0, 8),
          vehicle: offer.vehicleId
            ? `Vehicle ${offer.vehicleId.slice(0, 8)}`
            : `Trip ${offer.tripId.slice(0, 8)}`,
          state: (offer.status === "accepted"
            ? "finalized"
            : offer.status === "declined" || offer.status === "expired"
              ? "rejected"
              : "open") as DealRow["state"],
          counters: String(Math.max(0, offer.roundsCount - 1)),
          finalAmount: `${((offer.agreedPriceMinor ?? offer.currentOfferMinor) / 100).toFixed(
            2,
          )} ${offer.currencyCode}`,
        }))
      : DEFAULT_DEAL_ROWS;

  const handleFlag = async (row: DealRow) => {
    try {
      await flagMutation.mutateAsync({
        entryId: row.id,
        reason: `Deal audit review flagged for ${row.supplier} (${row.vehicle})`,
      });
    } catch {
      // Ignore error when unauthenticated in preview
    }
  };

  const columns: readonly TeDataTableColumn<DealRow>[] = [
    { key: "organization", header: t("screen.admin.dealsAndDisputes.dealAuditList.organization") },
    { key: "supplier", header: t("screen.admin.dealsAndDisputes.dealAuditList.supplier") },
    { key: "vehicle", header: t("screen.admin.dealsAndDisputes.dealAuditList.vehicleOrTrip") },
    {
      key: "state",
      header: t("screen.admin.dealsAndDisputes.dealAuditList.state"),
      render: (row) => <AdminStatus status={STATE_PRESENTATION()[row.state]} />,
    },
    {
      key: "counters",
      header: t("screen.admin.dealsAndDisputes.dealAuditList.counterOffers"),
      align: "end",
    },
    { key: "finalAmount", header: t("screen.admin.dealsAndDisputes.dealAuditList.finalAmount") },
    {
      key: "open",
      header: t("screen.admin.dealsAndDisputes.dealAuditList.action"),
      render: (row) => (
        <span className="flex flex-wrap gap-2">
          <span onClick={() => setSelectedAdminDealId(row.id)}>
            <AdminScreenLink
              slug="deal-audit-detail"
              variant="secondary"
              ariaLabel={t("screen.admin.dealsAndDisputes.dealAuditList.openDealFor", {
                supplier: row.supplier,
              })}
            >
              {t("screen.admin.dealsAndDisputes.dealAuditList.openDeal")}
            </AdminScreenLink>
          </span>
          <TeButton
            variant="ghost"
            aria-label={t("screen.admin.dealsAndDisputes.dealAuditList.flagDealForForReview", {
              supplier: row.supplier,
            })}
            onClick={() => void handleFlag(row)}
          >
            {t("screen.admin.dealsAndDisputes.dealAuditList.flagForReview")}
          </TeButton>
        </span>
      ),
    },
  ];

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.dealsAndDisputes.dealAuditList.dealAuditList")}
        description={t("screen.admin.dealsAndDisputes.dealAuditList.findDealsAndSeeTheir")}
      />
      <StatePreview
        emptyTitle={t("screen.admin.dealsAndDisputes.dealAuditList.noDeals")}
        emptyDescription={t("screen.admin.dealsAndDisputes.dealAuditList.noDealsMatchTheseFilters")}
        loadingLabel={t("screen.admin.dealsAndDisputes.dealAuditList.loadingTheDeals")}
      >
        <AdminFilters>
          <AdminSearch
            label={t("screen.admin.dealsAndDisputes.dealAuditList.organizationOrSupplier")}
            placeholder={t("screen.admin.dealsAndDisputes.dealAuditList.nameOrDealReference")}
            clearLabel={t("screen.admin.dealsAndDisputes.dealAuditList.clearSearch")}
          />
          <AdminFilterSelect
            label={t("screen.admin.dealsAndDisputes.dealAuditList.stateLabel")}
            options={STATE_OPTIONS()}
          />
        </AdminFilters>
        <AdminPanel title={t("screen.admin.dealsAndDisputes.dealAuditList.deals")}>
          <TeDataTable
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.dealsAndDisputes.dealAuditList.dealAuditListCaption")}
            emptyTitle={t("screen.admin.dealsAndDisputes.dealAuditList.noDealsEmptyTitle")}
            emptyDescription={t(
              "screen.admin.dealsAndDisputes.dealAuditList.noDealsMatchTheseFiltersEmptyDescription",
            )}
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
