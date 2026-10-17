import { useState } from "react";

import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";

import { OrgButtonLink, WorkspaceBackLink } from "../common/org-link";
import { StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface InvoiceRow {
  id: string;
  number: string;
  type: "B2B" | "B2C";
  buyer: string;
  amount: string;
}

const INVOICE_ROWS: readonly InvoiceRow[] = [
  {
    id: "invoice-1",
    number: "[Invoice number]",
    type: "B2B",
    buyer: "[Buyer name]",
    amount: "[Amount and currency]",
  },
  {
    id: "invoice-2",
    number: "[Invoice number]",
    type: "B2C",
    buyer: "[Buyer name]",
    amount: "[Amount and currency]",
  },
];

const COLUMNS: readonly TeDataTableColumn<InvoiceRow>[] = [
  { key: "number", header: "Number" },
  { key: "type", header: "Type" },
  { key: "buyer", header: "Buyer" },
  { key: "amount", header: "Amount", align: "end" },
  {
    key: "status",
    header: "Status",
    render: () => <StateBadge tone="success" icon="check" label="Issued" />,
  },
  {
    key: "open",
    header: "Open",
    align: "end",
    render: () => (
      <OrgButtonLink slug="issue-invoice-b2b-or-b2c" variant="ghost">
        Open invoice
      </OrgButtonLink>
    ),
  },
];

export function InvoicesList() {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = INVOICE_ROWS.filter(
    (row) =>
      row.number.toLowerCase().includes(normalizedQuery) ||
      row.buyer.toLowerCase().includes(normalizedQuery),
  );

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink />
        <TePageHeader
          title="Invoices list"
          actions={<OrgButtonLink slug="issue-invoice-b2b-or-b2c">Issue invoice</OrgButtonLink>}
        />
        <TeSearchField
          label="Search invoices"
          value={query}
          onValueChange={setQuery}
          clearLabel="Clear search"
        />
        <TeDataTable
          columns={COLUMNS}
          rows={visibleRows}
          getRowKey={(row) => row.id}
          caption="Issued invoices"
          emptyTitle="No invoices yet"
          emptyDescription="Issue an invoice for a trip or booking."
        />
      </div>
    </StatePreview>
  );
}
