// SCR-ADM-28 Settlements tracker (docs/design/web/admin/SCR-ADM-28.dc.html): amounts owed between
// organizations, suppliers and the platform until settled, with the "Mark settled" panel beside
// the table. Settling records a payout settlement for the selected amount with its payment
// reference.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { AdminButton } from "../common/admin-actions";
import { AdminInput } from "../common/admin-form";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminCard,
  AdminPage,
  AdminSplit,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";
import { formatDate, formatMinor, isPayoutCurrency } from "./finance-format";

type Party = "platform" | "organization" | "supplier";

interface SettlementRow {
  id: string;
  from: Party;
  to: Party;
  amountMinor: number;
  currency: string;
  amount: string;
  date: string;
  settled: boolean;
}

const MIN_REFERENCE_LENGTH = 3;

function partyLabel(party: Party): string {
  if (party === "platform") return t("screen.admin.finance.settlementsTracker.platform");
  if (party === "organization") return t("screen.admin.finance.settlementsTracker.organization");
  return t("screen.admin.finance.settlementsTracker.supplier");
}

function StateBadge({ settled }: { settled: boolean }) {
  return settled ? (
    <AdminBadge tone="ok" icon={false}>
      {t("screen.admin.finance.settlementsTracker.settled")}
    </AdminBadge>
  ) : (
    <AdminBadge tone="warn" icon={false}>
      {t("screen.admin.finance.settlementsTracker.open")}
    </AdminBadge>
  );
}

export function SettlementsTracker() {
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reference, setReference] = useState("");

  const ledgerQuery = useQuery({
    ...serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
      input: {},
    }),
    enabled: authStatus === "authenticated",
  });
  const settlementMutation = useMutation(
    serverMutationOptions(
      orpc.accounting.createPayoutSettlement,
      "accounting/createPayoutSettlement",
      {
        onSuccess: () => {
          setReference("");
          setSelectedId(null);
          void queryClient.invalidateQueries({ queryKey: orpc.accounting.key() });
        },
      },
    ),
  );

  const rows: readonly SettlementRow[] = (ledgerQuery.data ?? []).map((entry) => {
    const amountMinor = Math.abs(entry.netAmountMinor);
    const isCredit = entry.direction === "credit";
    return {
      id: entry.id,
      from: isCredit ? "platform" : "organization",
      to: isCredit ? "organization" : "supplier",
      amountMinor,
      currency: entry.currencyCode,
      amount: formatMinor(amountMinor, entry.currencyCode, locale),
      date: formatDate(entry.occurredAt, locale),
      settled: entry.status === "settled",
    };
  });
  const selected = rows.find((row) => row.id === selectedId) ?? rows.find((row) => !row.settled);
  const trimmedReference = reference.trim();
  const canSettle =
    selected !== undefined &&
    !selected.settled &&
    isPayoutCurrency(selected.currency) &&
    trimmedReference.length >= MIN_REFERENCE_LENGTH &&
    !settlementMutation.isPending;

  const handleMarkSettled = () => {
    if (!selected || !canSettle || !isPayoutCurrency(selected.currency)) return;
    settlementMutation.mutate({
      amountMinor: selected.amountMinor,
      currencyCode: selected.currency,
      invoiceNumber: trimmedReference,
      description: trimmedReference,
    });
  };

  const columns: readonly AdminColumn<SettlementRow>[] = [
    {
      key: "from",
      header: t("screen.admin.finance.settlementsTracker.from"),
      render: (row) => partyLabel(row.from),
    },
    {
      key: "to",
      header: t("screen.admin.finance.settlementsTracker.to"),
      render: (row) => partyLabel(row.to),
    },
    {
      key: "amount",
      header: t("screen.admin.finance.settlementsTracker.amount"),
      render: (row) => row.amount,
    },
    {
      key: "state",
      header: t("screen.admin.finance.settlementsTracker.state"),
      render: (row) => <StateBadge settled={row.settled} />,
    },
    {
      key: "date",
      header: t("screen.admin.finance.settlementsTracker.date"),
      render: (row) => row.date,
    },
    {
      key: "action",
      header: (
        <span className="te-caption">{t("screen.admin.finance.settlementsTracker.action")}</span>
      ),
      render: (row) => (
        <AdminButton
          variant="link"
          aria-pressed={row.id === selected?.id}
          aria-label={t("screen.admin.finance.settlementsTracker.selectSettlement", {
            from: partyLabel(row.from),
            to: partyLabel(row.to),
            amount: row.amount,
          })}
          onClick={() => setSelectedId(row.id)}
        >
          {row.settled
            ? t("screen.admin.finance.settlementsTracker.viewRecord")
            : t("screen.admin.finance.settlementsTracker.select")}
        </AdminButton>
      ),
    },
  ];

  const summary = selected
    ? t("screen.admin.finance.settlementsTracker.summary", {
        from: partyLabel(selected.from),
        to: partyLabel(selected.to),
        amount: selected.amount,
      })
    : t("screen.admin.finance.settlementsTracker.nothingSelected");

  return (
    <AdminPage
      title={t("screen.admin.finance.settlementsTracker.title")}
      description={t("screen.admin.finance.settlementsTracker.description")}
    >
      <AdminQueryState
        query={ledgerQuery}
        loadingLabel={t("screen.admin.finance.settlementsTracker.loading")}
      >
        <AdminSplit
          main={
            <AdminTable
              caption={t("screen.admin.finance.settlementsTracker.tableCaption")}
              columns={columns}
              rows={rows}
              getRowKey={(row) => row.id}
              empty={
                <AdminEmpty
                  title={t("screen.admin.finance.settlementsTracker.emptyTitle")}
                  description={t("screen.admin.finance.settlementsTracker.emptyBody")}
                />
              }
            />
          }
          side={
            <AdminCard title={t("screen.admin.finance.settlementsTracker.markSettled")}>
              <p className="te-body text-[var(--te-ink-muted)]">{summary}</p>
              {selected?.settled ? (
                <StateBadge settled />
              ) : (
                <>
                  <AdminInput
                    label={t("screen.admin.finance.settlementsTracker.paymentReference")}
                    placeholder={t(
                      "screen.admin.finance.settlementsTracker.paymentReferencePlaceholder",
                    )}
                    value={reference}
                    disabled={!selected}
                    onChange={(event) => setReference(event.target.value)}
                  />
                  {settlementMutation.isError ? (
                    <AdminAlert
                      tone="danger"
                      title={t("screen.admin.finance.settlementsTracker.errorTitle")}
                    >
                      {t("screen.admin.finance.settlementsTracker.errorBody")}
                    </AdminAlert>
                  ) : null}
                  <AdminButton
                    variant="primary"
                    className="self-start"
                    disabled={!canSettle}
                    onClick={handleMarkSettled}
                  >
                    {t("screen.admin.finance.settlementsTracker.markSettled")}
                  </AdminButton>
                </>
              )}
            </AdminCard>
          }
        />
      </AdminQueryState>
    </AdminPage>
  );
}
