import { TeBadge } from "@trips-app/ui/components/te-badge";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeMoney } from "@trips-app/ui/components/te-money";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { buttonLinkClass } from "./button-link";
import { ScreenLink } from "./screen-link";
import { goBack } from "./screen-actions";
import { StateLoading, StatePreview } from "./state-preview";

interface ReceiptLine {
  id: string;
  description: string;
  amount: number;
}

// Placeholder amounts. Real figures come from the issued receipt.
const CURRENCY = "SAR";
const RECEIPT_LINES: readonly ReceiptLine[] = [
  { id: "line-1", description: "Line description", amount: 0 },
];

const LINE_COLUMNS: readonly TeDataTableColumn<ReceiptLine>[] = [
  { key: "description", header: "Description" },
  {
    key: "amount",
    header: "Amount",
    align: "end",
    render: (line) => <TeMoney amount={line.amount} currency={CURRENCY} />,
  },
];

function ReceiptBody() {
  return (
    <TeCard padding="6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <TeBadge tone="success">
            <TeIcon name="check" />
            Issued
          </TeBadge>
          <p className="te-body">Receipt number, issue date and buyer details appear here.</p>
        </div>
        <TeDataTable
          columns={LINE_COLUMNS}
          rows={RECEIPT_LINES}
          getRowKey={(line) => line.id}
          caption="Receipt lines"
          emptyTitle="No lines"
        />
        <dl className="ms-auto grid grid-cols-[auto_auto] gap-x-6 gap-y-2">
          <dt className="te-label">Tax</dt>
          <dd>
            <TeMoney amount={0} currency={CURRENCY} />
          </dd>
          <dt className="te-label">Total</dt>
          <dd>
            <TeMoney amount={0} currency={CURRENCY} />
          </dd>
        </dl>
        <div className="flex flex-col gap-3">
          <p className="te-body">Export is locked on the Free plan.</p>
          <div>
            <ScreenLink
              surface="shared"
              slug="plan-limit-upgrade-prompt"
              className={buttonLinkClass("secondary")}
            >
              Upgrade to export
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
        title="Receipt and invoice view"
        description="Number, date, buyer, lines, tax and totals."
        actions={
          <TeButton variant="ghost" onClick={goBack}>
            Back
          </TeButton>
        }
      />
      <StatePreview
        main={<ReceiptBody />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert tone="error" title="Receipt could not load">
            Try again later. The receipt stays available from your bookings.
          </TeInlineAlert>
        }
      />
    </div>
  );
}
