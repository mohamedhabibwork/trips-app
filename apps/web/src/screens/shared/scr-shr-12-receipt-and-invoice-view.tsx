import { TeBadge } from "@trips-app/ui/components/te-badge";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeMoney } from "@trips-app/ui/components/te-money";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { buttonLinkClass } from "./button-link";
import { ScreenLink } from "./screen-link";
import { goBack } from "./screen-actions";
import { StateLoading, StatePreview } from "./state-preview";

interface ReceiptLine {
  id: string;
  description: string;
  amount: number;
}

const DEFAULT_CURRENCY = "SAR";
const DEFAULT_RECEIPT_LINES = (): readonly ReceiptLine[] => [
  {
    id: "line-1",
    description: t("screen.shared.scrShr12ReceiptAndInvoiceView.lineDescription"),
    amount: 0,
  },
];

function ReceiptBody() {
  const ledgerQuery = useQuery(orpc.accounting.listLedgerEntries.queryOptions({ input: {} }));
  const items = ledgerQuery.data ?? [];
  const currency = items[0]?.currencyCode ?? DEFAULT_CURRENCY;
  const lines: readonly ReceiptLine[] =
    items.length > 0
      ? items.slice(0, 5).map((entry) => ({
          id: entry.id,
          description: entry.description || entry.entryType,
          amount: Math.abs(entry.netAmountMinor) / 100,
        }))
      : DEFAULT_RECEIPT_LINES();

  const totalAmount = lines.reduce((sum, l) => sum + l.amount, 0);

  const columns: readonly TeDataTableColumn<ReceiptLine>[] = [
    { key: "description", header: t("screen.shared.scrShr12ReceiptAndInvoiceView.description") },
    {
      key: "amount",
      header: t("screen.shared.scrShr12ReceiptAndInvoiceView.amount"),
      align: "end",
      render: (line) => <TeMoney amount={line.amount} currency={currency} />,
    },
  ];

  return (
    <TeCard padding="6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <TeBadge tone="success">
            <TeIcon name="check" />
            {t("screen.shared.scrShr12ReceiptAndInvoiceView.issued")}
          </TeBadge>
          <p className="te-body">
            {t("screen.shared.scrShr12ReceiptAndInvoiceView.receiptNumberIssueDateAnd")}
          </p>
        </div>
        <TeDataTable
          columns={columns}
          rows={lines}
          getRowKey={(line) => line.id}
          caption={t("screen.shared.scrShr12ReceiptAndInvoiceView.receiptLines")}
          emptyTitle={t("screen.shared.scrShr12ReceiptAndInvoiceView.noLines")}
        />
        <dl className="ms-auto grid grid-cols-[auto_auto] gap-x-6 gap-y-2">
          <dt className="te-label">{t("screen.shared.scrShr12ReceiptAndInvoiceView.tax")}</dt>
          <dd>
            <TeMoney amount={0} currency={currency} />
          </dd>
          <dt className="te-label">{t("screen.shared.scrShr12ReceiptAndInvoiceView.total")}</dt>
          <dd>
            <TeMoney amount={totalAmount} currency={currency} />
          </dd>
        </dl>
        <div className="flex flex-col gap-3">
          <p className="te-body">
            {t("screen.shared.scrShr12ReceiptAndInvoiceView.exportIsLockedOnThe")}
          </p>
          <div>
            <ScreenLink
              surface="shared"
              slug="plan-limit-upgrade-prompt"
              className={buttonLinkClass("secondary")}
            >
              {t("screen.shared.scrShr12ReceiptAndInvoiceView.upgradeToExport")}
            </ScreenLink>
          </div>
        </div>
      </div>
    </TeCard>
  );
}

/** One receipt or invoice with its number, lines, tax and totals. */
export function ScrShr12ReceiptAndInvoiceView() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <TePageHeader
        title={t("screen.shared.scrShr12ReceiptAndInvoiceView.receiptAndInvoiceView")}
        description={t("screen.shared.scrShr12ReceiptAndInvoiceView.numberDateBuyerLinesTax")}
        actions={
          <TeButton variant="ghost" onClick={goBack}>
            {t("screen.shared.scrShr12ReceiptAndInvoiceView.back")}
          </TeButton>
        }
      />
      <StatePreview
        main={<ReceiptBody />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert
            tone="error"
            title={t("screen.shared.scrShr12ReceiptAndInvoiceView.receiptCouldNotLoad")}
          >
            {t("screen.shared.scrShr12ReceiptAndInvoiceView.tryAgainLaterTheReceipt")}
          </TeInlineAlert>
        }
      />
    </div>
  );
}
