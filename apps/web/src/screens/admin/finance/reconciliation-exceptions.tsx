// SCR-ADM-27 Reconciliation exceptions (docs/design/web/admin/SCR-ADM-27.dc.html): gateway records
// that do not match the ledger, filtered by type and state, with the resolve panel beside the
// table. A note is required to resolve an exception.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { AdminButton } from "../common/admin-actions";
import { AdminSelect, AdminTextarea, type AdminOption } from "../common/admin-form";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminCard,
  AdminFilterBar,
  AdminPage,
  AdminRow,
  AdminSplit,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";
import { formatMinor } from "./finance-format";

type ExceptionType = "missing" | "mismatch";
type ExceptionState = "open" | "resolved";

interface ExceptionRow {
  id: string;
  reference: string;
  amount: string;
  type: ExceptionType;
  state: ExceptionState;
}

const REFERENCE_ID_LENGTH = 8;

const typeOptions = (): readonly AdminOption[] => [
  { value: "all", label: t("screen.admin.finance.reconciliationExceptions.allTypes") },
  { value: "missing", label: t("screen.admin.finance.reconciliationExceptions.missingFromLedger") },
  { value: "mismatch", label: t("screen.admin.finance.reconciliationExceptions.mismatch") },
];

const stateOptions = (): readonly AdminOption[] => [
  { value: "open", label: t("screen.admin.finance.reconciliationExceptions.open") },
  { value: "resolved", label: t("screen.admin.finance.reconciliationExceptions.resolved") },
  { value: "all", label: t("screen.admin.finance.reconciliationExceptions.allStates") },
];

function typeLabel(type: ExceptionType): string {
  return type === "missing"
    ? t("screen.admin.finance.reconciliationExceptions.missingFromLedger")
    : t("screen.admin.finance.reconciliationExceptions.mismatch");
}

function StateBadge({ state }: { state: ExceptionState }) {
  return state === "resolved" ? (
    <AdminBadge tone="ok" icon={false}>
      {t("screen.admin.finance.reconciliationExceptions.resolved")}
    </AdminBadge>
  ) : (
    <AdminBadge tone="warn" icon={false}>
      {t("screen.admin.finance.reconciliationExceptions.open")}
    </AdminBadge>
  );
}

export function ReconciliationExceptions() {
  const { status: authStatus, locale } = useAuth();
  const [typeFilter, setTypeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("open");
  // Resolution is recorded on this page only: the API has no resolve procedure yet.
  const [resolvedIds, setResolvedIds] = useState<ReadonlySet<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const exceptionsQuery = useQuery({
    ...orpc.accounting.listAdminReconciliationExceptions.queryOptions(),
    enabled: authStatus === "authenticated",
  });

  const allRows: readonly ExceptionRow[] = (exceptionsQuery.data ?? []).map((entry) => ({
    id: entry.id,
    reference:
      entry.invoiceNumber ??
      `${entry.entryType.toUpperCase()}-${(entry.bookingId ?? entry.tripId ?? entry.id).slice(0, REFERENCE_ID_LENGTH)}`,
    amount: formatMinor(Math.abs(entry.grossAmountMinor), entry.currencyCode, locale),
    type: entry.grossAmountMinor === 0 ? "missing" : "mismatch",
    state: resolvedIds.has(entry.id) || entry.status === "settled" ? "resolved" : "open",
  }));
  const rows = allRows.filter(
    (row) =>
      (typeFilter === "all" || row.type === typeFilter) &&
      (stateFilter === "all" || row.state === stateFilter),
  );
  const selected =
    allRows.find((row) => row.id === selectedId) ?? rows.find((row) => row.state === "open");
  const canResolve = selected?.state === "open" && note.trim() !== "";

  const handleResolve = () => {
    if (!selected || !canResolve) return;
    setResolvedIds((previous) => new Set([...previous, selected.id]));
    setNote("");
  };

  const columns: readonly AdminColumn<ExceptionRow>[] = [
    {
      key: "reference",
      header: t("screen.admin.finance.reconciliationExceptions.gatewayReference"),
      render: (row) => row.reference,
    },
    {
      key: "amount",
      header: t("screen.admin.finance.reconciliationExceptions.amount"),
      render: (row) => row.amount,
    },
    {
      key: "type",
      header: t("screen.admin.finance.reconciliationExceptions.type"),
      render: (row) => typeLabel(row.type),
    },
    {
      key: "state",
      header: t("screen.admin.finance.reconciliationExceptions.state"),
      render: (row) => <StateBadge state={row.state} />,
    },
    {
      key: "action",
      header: (
        <span className="te-caption">
          {t("screen.admin.finance.reconciliationExceptions.action")}
        </span>
      ),
      render: (row) => (
        <AdminButton
          variant="link"
          aria-pressed={row.id === selected?.id}
          aria-label={t("screen.admin.finance.reconciliationExceptions.selectException", {
            reference: row.reference,
          })}
          onClick={() => setSelectedId(row.id)}
        >
          {row.state === "open"
            ? t("screen.admin.finance.reconciliationExceptions.select")
            : t("screen.admin.finance.reconciliationExceptions.view")}
        </AdminButton>
      ),
    },
  ];

  return (
    <AdminPage
      title={t("screen.admin.finance.reconciliationExceptions.title")}
      description={t("screen.admin.finance.reconciliationExceptions.description")}
    >
      <AdminFilterBar label={t("screen.admin.finance.reconciliationExceptions.filters")}>
        <AdminSelect
          label={t("screen.admin.finance.reconciliationExceptions.type")}
          options={typeOptions()}
          value={typeFilter}
          onValueChange={setTypeFilter}
        />
        <AdminSelect
          label={t("screen.admin.finance.reconciliationExceptions.state")}
          options={stateOptions()}
          value={stateFilter}
          onValueChange={setStateFilter}
        />
      </AdminFilterBar>
      <AdminQueryState
        query={exceptionsQuery}
        loadingLabel={t("screen.admin.finance.reconciliationExceptions.loading")}
      >
        <AdminSplit
          main={
            <AdminTable
              caption={t("screen.admin.finance.reconciliationExceptions.tableCaption")}
              columns={columns}
              rows={rows}
              getRowKey={(row) => row.id}
              empty={
                <AdminEmpty
                  title={t("screen.admin.finance.reconciliationExceptions.emptyTitle")}
                  description={t("screen.admin.finance.reconciliationExceptions.emptyBody")}
                />
              }
            />
          }
          side={
            <AdminCard title={t("screen.admin.finance.reconciliationExceptions.resolveException")}>
              <AdminRow
                label={t("screen.admin.finance.reconciliationExceptions.gatewayReference")}
                last={selected?.state !== "resolved"}
              >
                {selected?.reference ?? "—"}
              </AdminRow>
              {selected?.state === "resolved" ? (
                <AdminRow label={t("screen.admin.finance.reconciliationExceptions.state")} last>
                  <StateBadge state="resolved" />
                </AdminRow>
              ) : (
                <>
                  <AdminTextarea
                    label={t("screen.admin.finance.reconciliationExceptions.resolutionNote")}
                    placeholder={t("screen.admin.finance.reconciliationExceptions.notePlaceholder")}
                    rows={4}
                    value={note}
                    disabled={!selected}
                    onChange={(event) => setNote(event.target.value)}
                  />
                  <AdminButton
                    variant="primary"
                    className="self-start"
                    disabled={!canResolve}
                    onClick={handleResolve}
                  >
                    {t("screen.admin.finance.reconciliationExceptions.markResolved")}
                  </AdminButton>
                </>
              )}
            </AdminCard>
          }
        />
      </AdminQueryState>
      <AdminAlert tone="info">
        {t("screen.admin.finance.reconciliationExceptions.typesNote")}
      </AdminAlert>
    </AdminPage>
  );
}
