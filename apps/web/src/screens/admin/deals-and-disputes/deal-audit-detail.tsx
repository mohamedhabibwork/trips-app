import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeTimeline, type TeTimelineItem } from "@trips-app/ui/components/te-timeline";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminActions,
  AdminFacts,
  AdminPage,
  AdminPanel,
  AdminStatus,
  getSelectedAdminDealId,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface OfferRow {
  id: string;
  step: string;
  amount: string;
  actor: string;
  time: string;
}

const DEFAULT_OFFER_ROWS: readonly OfferRow[] = [];

const DEFAULT_HISTORY = (): readonly TeTimelineItem[] => [
  {
    id: "open",
    time: "-",
    label: t("screen.admin.dealsAndDisputes.dealAuditDetail.dealOpened"),
    state: "done",
  },
  {
    id: "counter",
    time: "-",
    label: t("screen.admin.dealsAndDisputes.dealAuditDetail.counterOfferMade"),
    state: "done",
  },
  {
    id: "final",
    time: "-",
    label: t("screen.admin.dealsAndDisputes.dealAuditDetail.dealFinalizedOrRejected"),
    state: "upcoming",
  },
];

const OPEN = (): AdminStatusPresentation => ({
  tone: "info",
  icon: "clock",
  label: t("screen.admin.dealsAndDisputes.dealAuditDetail.open"),
});

const OFFER_COLUMNS = (): readonly TeDataTableColumn<OfferRow>[] => [
  { key: "step", header: t("screen.admin.dealsAndDisputes.dealAuditDetail.step") },
  { key: "amount", header: t("screen.admin.dealsAndDisputes.dealAuditDetail.amount") },
  { key: "actor", header: t("screen.admin.dealsAndDisputes.dealAuditDetail.actor") },
  { key: "time", header: t("screen.admin.dealsAndDisputes.dealAuditDetail.time") },
];

export function DealAuditDetail() {
  const queryClient = useQueryClient();
  const selectedId = getSelectedAdminDealId();
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

  const deal =
    (selectedId
      ? dealsQuery.data?.items.find((item) => item.id === selectedId)
      : dealsQuery.data?.items[0]) ?? dealsQuery.data?.items[0];

  const effectiveMinor = deal ? (deal.agreedPriceMinor ?? deal.currentOfferMinor) : 0;
  const createdStr = deal
    ? new Date(deal.createdAt).toISOString().slice(0, 16).replace("T", " ")
    : "-";
  const updatedStr = deal
    ? new Date(deal.updatedAt).toISOString().slice(0, 16).replace("T", " ")
    : "-";

  const organization = deal ? deal.tenantId.slice(0, 8) : "-";
  const supplier = deal ? deal.supplierAccountId.slice(0, 8) : "-";
  const vehicle = deal
    ? deal.vehicleId
      ? `Vehicle ${deal.vehicleId.slice(0, 8)}`
      : `Trip ${deal.tripId.slice(0, 8)}`
    : "-";
  const finalAmount = deal
    ? `${(effectiveMinor / 100).toFixed(2)} ${deal.currencyCode}`
    : "0.00 EGP";
  const dealCost = finalAmount;
  const commission = deal
    ? `${(Math.round(effectiveMinor * 0.1) / 100).toFixed(2)} ${deal.currencyCode}`
    : "0.00 EGP";

  const offers: readonly OfferRow[] = deal
    ? [
        {
          id: `${deal.id}-1`,
          step: "Offer",
          amount: `${(deal.initialOfferMinor / 100).toFixed(2)} ${deal.currencyCode}`,
          actor: deal.tenantId.slice(0, 8),
          time: createdStr,
        },
        ...(deal.roundsCount > 1
          ? [
              {
                id: `${deal.id}-2`,
                step: "Counter offer",
                amount: `${(deal.currentOfferMinor / 100).toFixed(2)} ${deal.currencyCode}`,
                actor: deal.supplierAccountId.slice(0, 8),
                time: updatedStr,
              },
            ]
          : []),
      ]
    : DEFAULT_OFFER_ROWS;

  const history: readonly TeTimelineItem[] = deal
    ? [
        {
          id: "open",
          time: createdStr,
          label: t("screen.admin.dealsAndDisputes.dealAuditDetail.dealOpened"),
          state: "done",
        },
        {
          id: "counter",
          time: updatedStr,
          label: t("screen.admin.dealsAndDisputes.dealAuditDetail.counterOfferMade"),
          state: deal.roundsCount > 1 ? "done" : "upcoming",
        },
        {
          id: "final",
          time: deal.status === "accepted" || deal.status === "declined" ? updatedStr : "Pending",
          label: t("screen.admin.dealsAndDisputes.dealAuditDetail.dealFinalizedOrRejected"),
          state: deal.status === "accepted" || deal.status === "declined" ? "done" : "upcoming",
        },
      ]
    : DEFAULT_HISTORY();

  const handleFlag = async () => {
    try {
      await flagMutation.mutateAsync({
        entryId: getSelectedAdminDealId() ?? "00000000-0000-0000-0000-000000000001",
        reason: `Admin flagged deal for ${supplier} (${vehicle})`,
      });
    } catch {
      // Ignore error when unauthenticated
    }
  };

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.dealsAndDisputes.dealAuditDetail.dealAuditDetail")}
        description={t("screen.admin.dealsAndDisputes.dealAuditDetail.dealReferenceEveryOfferAnd")}
        actions={
          <TeButton variant="secondary" onClick={() => void handleFlag()}>
            {t("screen.admin.dealsAndDisputes.dealAuditDetail.flagForReview")}
          </TeButton>
        }
      />
      <StatePreview
        emptyTitle={t("screen.admin.dealsAndDisputes.dealAuditDetail.noOffers")}
        emptyDescription={t("screen.admin.dealsAndDisputes.dealAuditDetail.thisDealHasNoOffers")}
        loadingLabel={t("screen.admin.dealsAndDisputes.dealAuditDetail.loadingTheDeal")}
      >
        <AdminPanel
          title={t("screen.admin.dealsAndDisputes.dealAuditDetail.partiesAndVehicleOrTrip")}
        >
          <AdminStatus status={OPEN()} />
          <AdminFacts
            items={[
              {
                label: t("screen.admin.dealsAndDisputes.dealAuditDetail.organization"),
                value: organization,
              },
              {
                label: t("screen.admin.dealsAndDisputes.dealAuditDetail.supplier"),
                value: supplier,
              },
              {
                label: t("screen.admin.dealsAndDisputes.dealAuditDetail.vehicleOrTrip"),
                value: vehicle,
              },
              {
                label: t("screen.admin.dealsAndDisputes.dealAuditDetail.finalAmount"),
                value: finalAmount,
              },
            ]}
          />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.dealsAndDisputes.dealAuditDetail.offersInOrder")}>
          <TeDataTable
            columns={OFFER_COLUMNS()}
            rows={offers}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.dealsAndDisputes.dealAuditDetail.offersInOrderCaption")}
            emptyTitle={t("screen.admin.dealsAndDisputes.dealAuditDetail.noOffersEmptyTitle")}
            emptyDescription={t(
              "screen.admin.dealsAndDisputes.dealAuditDetail.thisDealHasNoOffersEmptyDescription",
            )}
          />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.dealsAndDisputes.dealAuditDetail.stateHistory")}>
          <TeTimeline
            items={history}
            ariaLabel={t("screen.admin.dealsAndDisputes.dealAuditDetail.dealStateHistory")}
          />
        </AdminPanel>
        <AdminPanel
          title={t("screen.admin.dealsAndDisputes.dealAuditDetail.dealCostAndCommission")}
        >
          <AdminFacts
            items={[
              {
                label: t("screen.admin.dealsAndDisputes.dealAuditDetail.dealCost"),
                value: dealCost,
              },
              {
                label: t("screen.admin.dealsAndDisputes.dealAuditDetail.commission"),
                value: commission,
              },
            ]}
          />
          <TeInlineAlert
            tone="warning"
            title={t("screen.admin.dealsAndDisputes.dealAuditDetail.placeholderRate")}
          >
            {t("screen.admin.dealsAndDisputes.dealAuditDetail.theDealCostIs10")}
          </TeInlineAlert>
        </AdminPanel>
        <AdminActions>
          <AdminScreenLink slug="platform-financial-view" variant="ghost">
            {t("screen.admin.dealsAndDisputes.dealAuditDetail.viewLedgerEntries")}
          </AdminScreenLink>
          <AdminScreenLink slug="deal-audit-list" variant="secondary">
            {t("screen.admin.dealsAndDisputes.dealAuditDetail.backToDealList")}
          </AdminScreenLink>
        </AdminActions>
      </StatePreview>
    </AdminPage>
  );
}
