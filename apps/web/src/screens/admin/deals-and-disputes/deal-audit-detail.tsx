// SCR-ADM-22 Deal audit detail (docs/design/web/admin/SCR-ADM-22.dc.html): the parties of one deal,
// every offer and state change in order, and the deal cost and commission. The negotiation record
// keeps the first offer, the latest counter offer and the outcome, so those are the steps shown.
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { AdminLink, useAdminParam } from "../common/admin-actions";
import { getSelectedAdminDealId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminBadge,
  AdminCard,
  AdminPage,
  AdminRow,
  AdminSplit,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";
import { DealStateBadge, dealState, dealStateLabel } from "./deal-state";
import { formatDateTime, formatMinor, shortId } from "./deals-format";

/** Placeholder deal cost rate until the commission decision closes: 10% of the base trip price. */
const DEAL_COST_RATE = 0.1;

interface Deal {
  id: string;
  tenantId: string;
  tripId: string;
  vehicleId: string | null;
  supplierAccountId: string;
  status: string;
  initialOfferMinor: number;
  currentOfferMinor: number;
  agreedPriceMinor: number | null;
  currencyCode: string;
  lastOfferedBy: "organization" | "supplier";
  roundsCount: number;
  respondedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface StepRow {
  step: number;
  event: string;
  amount: string;
  actor: string;
  time: string;
}

function buildSteps(deal: Deal, locale: string | undefined): readonly StepRow[] {
  const money = (minor: number) => formatMinor(minor, deal.currencyCode, locale);
  const organization = shortId(deal.tenantId);
  const supplier = shortId(deal.supplierAccountId);
  const lastActor = deal.lastOfferedBy === "organization" ? organization : supplier;
  const state = dealState(deal.status);
  const firstOffer = {
    event: t("screen.admin.dealsAndDisputes.dealAuditDetail.offer"),
    amount: money(deal.initialOfferMinor),
    actor: organization,
    time: formatDateTime(deal.createdAt, locale),
  };
  const latestCounter = {
    event: t("screen.admin.dealsAndDisputes.dealAuditDetail.counterOffer"),
    amount: money(deal.currentOfferMinor),
    actor: lastActor,
    time: formatDateTime(deal.updatedAt, locale),
  };
  const outcome = {
    event: dealStateLabel(state),
    amount: deal.agreedPriceMinor !== null ? money(deal.agreedPriceMinor) : "—",
    actor: deal.lastOfferedBy === "organization" ? supplier : organization,
    time: formatDateTime(deal.respondedAt ?? deal.updatedAt, locale),
  };
  const events: readonly Omit<StepRow, "step">[] = [
    firstOffer,
    ...(deal.roundsCount > 1 ? [latestCounter] : []),
    ...(state !== "open" ? [outcome] : []),
  ];
  return events.map((event, index) => ({ ...event, step: index + 1 }));
}

const stepColumns = (): readonly AdminColumn<StepRow>[] => [
  {
    key: "step",
    header: t("screen.admin.dealsAndDisputes.dealAuditDetail.step"),
    render: (row) => row.step,
  },
  {
    key: "event",
    header: t("screen.admin.dealsAndDisputes.dealAuditDetail.event"),
    render: (row) => row.event,
  },
  {
    key: "amount",
    header: t("screen.admin.dealsAndDisputes.dealAuditDetail.amount"),
    render: (row) => row.amount,
  },
  {
    key: "actor",
    header: t("screen.admin.dealsAndDisputes.dealAuditDetail.actor"),
    render: (row) => row.actor,
  },
  {
    key: "time",
    header: t("screen.admin.dealsAndDisputes.dealAuditDetail.time"),
    render: (row) => row.time,
  },
];

function DealBody({ deal, locale }: { deal: Deal; locale: string | undefined }) {
  const baseMinor = deal.agreedPriceMinor ?? deal.currentOfferMinor;
  const vehicleOrTrip = deal.vehicleId
    ? t("screen.admin.dealsAndDisputes.dealAuditDetail.vehicleRef", {
        reference: shortId(deal.vehicleId),
      })
    : t("screen.admin.dealsAndDisputes.dealAuditDetail.tripRef", {
        reference: shortId(deal.tripId),
      });
  return (
    <AdminSplit
      main={
        <>
          <AdminCard title={t("screen.admin.dealsAndDisputes.dealAuditDetail.parties")}>
            <div>
              <AdminRow label={t("screen.admin.dealsAndDisputes.dealAuditDetail.organization")}>
                {shortId(deal.tenantId)}
              </AdminRow>
              <AdminRow label={t("screen.admin.dealsAndDisputes.dealAuditDetail.supplier")}>
                {shortId(deal.supplierAccountId)}
              </AdminRow>
              <AdminRow
                label={t("screen.admin.dealsAndDisputes.dealAuditDetail.vehicleOrTrip")}
                last
              >
                {vehicleOrTrip}
              </AdminRow>
            </div>
          </AdminCard>
          <AdminTable
            caption={t("screen.admin.dealsAndDisputes.dealAuditDetail.offersAndStateHistory")}
            title={t("screen.admin.dealsAndDisputes.dealAuditDetail.offersAndStateHistory")}
            columns={stepColumns()}
            rows={buildSteps(deal, locale)}
            getRowKey={(row) => String(row.step)}
          />
        </>
      }
      side={
        <>
          <AdminCard
            title={t("screen.admin.dealsAndDisputes.dealAuditDetail.dealCostAndCommission")}
          >
            <div>
              <AdminRow label={t("screen.admin.dealsAndDisputes.dealAuditDetail.baseTripPrice")}>
                {formatMinor(baseMinor, deal.currencyCode, locale)}
              </AdminRow>
              <AdminRow label={t("screen.admin.dealsAndDisputes.dealAuditDetail.commission")}>
                —
              </AdminRow>
              <AdminRow label={t("screen.admin.dealsAndDisputes.dealAuditDetail.dealCost")} last>
                {formatMinor(Math.round(baseMinor * DEAL_COST_RATE), deal.currencyCode, locale)}
              </AdminRow>
            </div>
            <AdminBadge tone="warn" icon={false}>
              {t("screen.admin.dealsAndDisputes.dealAuditDetail.placeholderRate")}
            </AdminBadge>
          </AdminCard>
          <AdminCard>
            <span className="te-label">
              {t("screen.admin.dealsAndDisputes.dealAuditDetail.ledger")}
            </span>
            <p className="te-body">
              {t("screen.admin.dealsAndDisputes.dealAuditDetail.dealCostEntryLinked", {
                reference: "—",
              })}
            </p>
            <AdminLink screen="SCR-ADM-25" variant="secondary" className="self-start">
              {t("screen.admin.dealsAndDisputes.dealAuditDetail.viewLedgerEntries")}
            </AdminLink>
          </AdminCard>
        </>
      }
    />
  );
}

export function DealAuditDetail() {
  const { status: authStatus, locale } = useAuth();
  const dealId = useAdminParam("dealId", getSelectedAdminDealId);
  const dealsQuery = useQuery({
    ...serverQueryOptions(
      orpc.negotiation.listOrganizationNegotiations,
      "negotiation/listOrganizationNegotiations",
      { input: {} },
    ),
    enabled: authStatus === "authenticated",
  });

  const deal = dealsQuery.data?.items.find((item) => item.id === dealId);

  return (
    <AdminPage
      title={t("screen.admin.dealsAndDisputes.dealAuditDetail.title")}
      description={t("screen.admin.dealsAndDisputes.dealAuditDetail.description")}
      actions={deal ? <DealStateBadge state={dealState(deal.status)} large /> : undefined}
    >
      <AdminQueryState
        query={dealsQuery}
        loadingLabel={t("screen.admin.dealsAndDisputes.dealAuditDetail.loading")}
      >
        {deal ? (
          <DealBody deal={deal} locale={locale} />
        ) : (
          <AdminCard>
            <AdminEmpty
              title={t("screen.admin.dealsAndDisputes.dealAuditDetail.notFoundTitle")}
              description={t("screen.admin.dealsAndDisputes.dealAuditDetail.notFoundBody")}
            />
            <AdminLink screen="SCR-ADM-21" variant="secondary" className="self-start">
              {t("screen.admin.dealsAndDisputes.dealAuditDetail.backToDeals")}
            </AdminLink>
          </AdminCard>
        )}
      </AdminQueryState>
    </AdminPage>
  );
}
