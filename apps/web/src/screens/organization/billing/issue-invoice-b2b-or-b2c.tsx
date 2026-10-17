import { useState } from "react";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const TYPE_OPTIONS: readonly TeSelectOption[] = [
  { value: "b2b", label: "Business (B2B)" },
  { value: "b2c", label: "Consumer (B2C)" },
];

interface InvoiceLineRow {
  id: string;
  description: string;
  quantity: string;
  amount: string;
}

const LINE_ROWS: readonly InvoiceLineRow[] = [
  {
    id: "line-1",
    description: "[Line description]",
    quantity: "0",
    amount: "[Amount and currency]",
  },
];

const LINE_COLUMNS: readonly TeDataTableColumn<InvoiceLineRow>[] = [
  { key: "description", header: "Line" },
  { key: "quantity", header: "Quantity", align: "end" },
  { key: "amount", header: "Amount", align: "end" },
];

export function IssueInvoiceB2bOrB2c() {
  const goTo = useOrgNavigate();
  const [invoiceType, setInvoiceType] = useState("b2c");
  const [buyerName, setBuyerName] = useState("");

  const canIssue = buyerName.trim().length > 0;

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "invoices-list", label: "Back to invoices" }} />
        <TePageHeader
          title="Issue invoice (B2B or B2C)"
          actions={
            <TeButton disabled={!canIssue} onClick={() => void goTo("invoices-list")}>
              Issue invoice
            </TeButton>
          }
        />
        <OrgSection title="Invoice">
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeSelect
                label="Invoice type"
                options={TYPE_OPTIONS}
                value={invoiceType}
                onValueChange={setInvoiceType}
              />
              <TeInput label="Invoice number" placeholder="[Generated number]" readOnly />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Buyer">
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput
                label="Buyer name"
                placeholder="[Buyer name]"
                dir="auto"
                value={buyerName}
                onChange={(event) => setBuyerName(event.target.value)}
              />
              {invoiceType === "b2b" ? (
                <TeInput label="Buyer tax number" placeholder="[Tax number]" />
              ) : null}
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Lines">
          <TeDataTable
            columns={LINE_COLUMNS}
            rows={LINE_ROWS}
            getRowKey={(row) => row.id}
            caption="Invoice lines"
            emptyTitle="No lines"
            emptyDescription="Add lines from a booking or a trip."
          />
        </OrgSection>
        <OrgSection title="Tax">
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput label="Tax" placeholder="[Tax amount]" />
              <TeInput label="Total" placeholder="[Total and currency]" readOnly />
            </div>
          </TeCard>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
