import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const TYPE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "b2b", label: t("screen.organization.billing.issueInvoiceB2bOrB2c.businessB2b") },
  { value: "b2c", label: t("screen.organization.billing.issueInvoiceB2bOrB2c.consumerB2c") },
];

interface InvoiceLineRow {
  id: string;
  description: string;
  quantity: string;
  amount: string;
  amountMinor: number;
  currencyCode: string;
}

const LINE_COLUMNS = (): readonly TeDataTableColumn<InvoiceLineRow>[] => [
  { key: "description", header: t("screen.organization.billing.issueInvoiceB2bOrB2c.line") },
  {
    key: "quantity",
    header: t("screen.organization.billing.issueInvoiceB2bOrB2c.quantity"),
    align: "end",
  },
  {
    key: "amount",
    header: t("screen.organization.billing.issueInvoiceB2bOrB2c.amount"),
    align: "end",
  },
];

export function IssueInvoiceB2bOrB2c() {
  const goTo = useOrgNavigate();
  const queryClient = useQueryClient();
  const { status: authStatus } = useAuth();
  const [invoiceType, setInvoiceType] = useState("b2c");
  const [buyerName, setBuyerName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [taxAmount, setTaxAmount] = useState("");

  const bookingsQuery = useQuery(
    orpc.booking.listOrganizationBookings.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const lines = useMemo<readonly InvoiceLineRow[]>(() => {
    if (!bookingsQuery.data) return [];
    return bookingsQuery.data.map((b) => ({
      id: b.id,
      description: b.bookingReference,
      quantity: String(b.passengersCount),
      amount: `${(b.subtotalMinor / 100).toFixed(2)} ${b.currencyCode}`,
      amountMinor: b.subtotalMinor,
      currencyCode: b.currencyCode,
    }));
  }, [bookingsQuery.data]);

  const createPayoutSettlementMutation = useMutation(
    orpc.accounting.createPayoutSettlement.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.accounting.key() });
      },
    }),
  );

  const canIssue = buyerName.trim().length > 0;
  const subtotalMinor = lines.reduce((sum, l) => sum + l.amountMinor, 0);
  const parsedTaxMajor = Number.parseFloat(taxAmount);
  const taxMinor =
    Number.isFinite(parsedTaxMajor) && parsedTaxMajor > 0 ? Math.round(parsedTaxMajor * 100) : 0;
  const totalMinor = subtotalMinor + taxMinor;
  const currency = lines[0]?.currencyCode ?? "EGP";

  const handleIssue = async () => {
    if (authStatus === "authenticated" && canIssue) {
      try {
        await createPayoutSettlementMutation.mutateAsync({
          amountMinor: Math.max(100, totalMinor || 10000),
          currencyCode: currency === "SAR" || currency === "AED" ? currency : "EGP",
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          description: `${invoiceType.toUpperCase()}: ${buyerName.trim()}${taxNumber.trim() ? ` (${taxNumber.trim()})` : ""}`,
        });
      } catch {
        // Navigate back to invoices list
      }
    }
    void goTo("invoices-list");
  };

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "invoices-list",
            label: t("screen.organization.billing.issueInvoiceB2bOrB2c.backToInvoices"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.billing.issueInvoiceB2bOrB2c.issueInvoiceB2bOrB2c")}
          actions={
            <TeButton disabled={!canIssue} onClick={() => void handleIssue()}>
              {t("screen.organization.billing.issueInvoiceB2bOrB2c.issueInvoice")}
            </TeButton>
          }
        />
        <OrgSection title={t("screen.organization.billing.issueInvoiceB2bOrB2c.invoice")}>
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeSelect
                label={t("screen.organization.billing.issueInvoiceB2bOrB2c.invoiceType")}
                options={TYPE_OPTIONS()}
                value={invoiceType}
                onValueChange={setInvoiceType}
              />
              <TeInput
                label={t("screen.organization.billing.issueInvoiceB2bOrB2c.invoiceNumber")}
                placeholder={t("screen.organization.billing.issueInvoiceB2bOrB2c.generatedNumber")}
                readOnly
              />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title={t("screen.organization.billing.issueInvoiceB2bOrB2c.buyer")}>
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput
                label={t("screen.organization.billing.issueInvoiceB2bOrB2c.buyerName")}
                placeholder={t(
                  "screen.organization.billing.issueInvoiceB2bOrB2c.buyerNamePlaceholder",
                )}
                dir="auto"
                value={buyerName}
                onChange={(event) => setBuyerName(event.target.value)}
              />
              {invoiceType === "b2b" ? (
                <TeInput
                  label={t("screen.organization.billing.issueInvoiceB2bOrB2c.buyerTaxNumber")}
                  placeholder={t("screen.organization.billing.issueInvoiceB2bOrB2c.taxNumber")}
                  value={taxNumber}
                  onChange={(event) => setTaxNumber(event.target.value)}
                />
              ) : null}
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title={t("screen.organization.billing.issueInvoiceB2bOrB2c.lines")}>
          <TeDataTable
            columns={LINE_COLUMNS()}
            rows={lines}
            getRowKey={(row) => row.id}
            caption={t("screen.organization.billing.issueInvoiceB2bOrB2c.invoiceLines")}
            emptyTitle={t("screen.organization.billing.issueInvoiceB2bOrB2c.noLines")}
            emptyDescription={t(
              "screen.organization.billing.issueInvoiceB2bOrB2c.addLinesFromABooking",
            )}
          />
        </OrgSection>
        <OrgSection title={t("screen.organization.billing.issueInvoiceB2bOrB2c.tax")}>
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput
                label={t("screen.organization.billing.issueInvoiceB2bOrB2c.taxLabel")}
                placeholder={t("screen.organization.billing.issueInvoiceB2bOrB2c.taxAmount")}
                value={taxAmount}
                onChange={(event) => setTaxAmount(event.target.value)}
              />
              <TeInput
                label={t("screen.organization.billing.issueInvoiceB2bOrB2c.total")}
                placeholder={t("screen.organization.billing.issueInvoiceB2bOrB2c.totalAndCurrency")}
                value={`${(totalMinor / 100).toFixed(2)} ${currency}`}
                readOnly
              />
            </div>
          </TeCard>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
