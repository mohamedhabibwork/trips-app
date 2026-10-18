import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminActions,
  AdminFilterSelect,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface ExceptionRow {
  id: string;
  reference: string;
  amount: string;
  type: "missing" | "mismatch";
  state: "open" | "resolved";
}

const DEFAULT_EXCEPTION_ROWS: readonly ExceptionRow[] = [];

const TYPE_PRESENTATION = (): Record<ExceptionRow["type"], AdminStatusPresentation> => ({
  missing: {
    tone: "warning",
    icon: "alert",
    label: t("screen.admin.finance.reconciliationExceptions.missingFromLedger"),
  },
  mismatch: {
    tone: "danger",
    icon: "alert",
    label: t("screen.admin.finance.reconciliationExceptions.amountMismatch"),
  },
});

const STATE_PRESENTATION = (): Record<ExceptionRow["state"], AdminStatusPresentation> => ({
  open: {
    tone: "warning",
    icon: "clock",
    label: t("screen.admin.finance.reconciliationExceptions.open"),
  },
  resolved: {
    tone: "success",
    icon: "check",
    label: t("screen.admin.finance.reconciliationExceptions.resolved"),
  },
});

const STATE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.finance.reconciliationExceptions.anyState") },
  { value: "open", label: t("screen.admin.finance.reconciliationExceptions.openLabel") },
  { value: "resolved", label: t("screen.admin.finance.reconciliationExceptions.resolvedLabel") },
];

export function ReconciliationExceptions() {
  const exceptionsQuery = useQuery(
    orpc.accounting.listAdminReconciliationExceptions.queryOptions(),
  );
  const [resolvedIds, setResolvedIds] = useState<ReadonlySet<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const canResolve = note.trim() !== "";

  const rows: readonly ExceptionRow[] =
    exceptionsQuery.data && exceptionsQuery.data.length > 0
      ? exceptionsQuery.data.map((exc) => {
          const refId = exc.bookingId ?? exc.tripId ?? exc.id;
          const isLocallyResolved = resolvedIds.has(exc.id);
          return {
            id: exc.id,
            reference: `${exc.entryType.toUpperCase()}-${refId.slice(0, 8)}`,
            amount: `${(Math.abs(exc.grossAmountMinor) / 100).toFixed(2)} ${exc.currencyCode}`,
            type: exc.grossAmountMinor === 0 ? "missing" : "mismatch",
            state: (isLocallyResolved || exc.status === "settled"
              ? "resolved"
              : "open") as ExceptionRow["state"],
          };
        })
      : DEFAULT_EXCEPTION_ROWS;

  const handleResolve = (id?: string) => {
    const targetId = id ?? selectedId ?? rows[0]?.id;
    if (!targetId) return;
    setResolvedIds((prev) => new Set([...prev, targetId]));
    setNote("");
  };

  const columns: readonly TeDataTableColumn<ExceptionRow>[] = [
    {
      key: "reference",
      header: t("screen.admin.finance.reconciliationExceptions.gatewayReference"),
    },
    { key: "amount", header: t("screen.admin.finance.reconciliationExceptions.amount") },
    {
      key: "type",
      header: t("screen.admin.finance.reconciliationExceptions.type"),
      render: (row) => <AdminStatus status={TYPE_PRESENTATION()[row.type]} />,
    },
    {
      key: "state",
      header: t("screen.admin.finance.reconciliationExceptions.state"),
      render: (row) => <AdminStatus status={STATE_PRESENTATION()[row.state]} />,
    },
    {
      key: "open",
      header: t("screen.admin.finance.reconciliationExceptions.action"),
      render: (row) => (
        <TeButton
          variant="secondary"
          aria-label={t("screen.admin.finance.reconciliationExceptions.resolveException", {
            reference: row.reference,
          })}
          onClick={() => {
            setSelectedId(row.id);
            handleResolve(row.id);
          }}
        >
          {t("screen.admin.finance.reconciliationExceptions.resolve")}
        </TeButton>
      ),
    },
  ];

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.finance.reconciliationExceptions.reconciliationExceptions")}
        description={t("screen.admin.finance.reconciliationExceptions.gatewayRecordsThatDoNot")}
      />
      <StatePreview
        emptyTitle={t("screen.admin.finance.reconciliationExceptions.noExceptions")}
        emptyDescription={t(
          "screen.admin.finance.reconciliationExceptions.gatewayRecordsMatchTheLedger",
        )}
        loadingLabel={t("screen.admin.finance.reconciliationExceptions.loadingTheExceptions")}
      >
        <TeInlineAlert
          tone="info"
          title={t("screen.admin.finance.reconciliationExceptions.schedule")}
        >
          {t("screen.admin.finance.reconciliationExceptions.reconciliationRunsDailyD29")}
        </TeInlineAlert>
        <AdminFilters>
          <AdminFilterSelect
            label={t("screen.admin.finance.reconciliationExceptions.stateLabel")}
            options={STATE_OPTIONS()}
          />
        </AdminFilters>
        <AdminPanel title={t("screen.admin.finance.reconciliationExceptions.exceptions")}>
          <TeDataTable
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t(
              "screen.admin.finance.reconciliationExceptions.reconciliationExceptionsCaption",
            )}
            emptyTitle={t("screen.admin.finance.reconciliationExceptions.noExceptionsEmptyTitle")}
            emptyDescription={t(
              "screen.admin.finance.reconciliationExceptions.gatewayRecordsMatchTheLedgerEmptyDescription",
            )}
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
        <AdminPanel
          title={t("screen.admin.finance.reconciliationExceptions.resolveSelectedException")}
        >
          <TeInput
            label={t("screen.admin.finance.reconciliationExceptions.resolutionNoteRequired")}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("screen.admin.finance.reconciliationExceptions.whatWasCheckedAndWhy")}
          />
          <AdminActions>
            <AdminScreenLink slug="platform-financial-view" variant="secondary">
              {t("screen.admin.finance.reconciliationExceptions.backToFinancialView")}
            </AdminScreenLink>
            <TeButton disabled={!canResolve} onClick={() => handleResolve()}>
              {t("screen.admin.finance.reconciliationExceptions.resolveException2")}
            </TeButton>
          </AdminActions>
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
