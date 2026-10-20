// SCR-ADM-44 Invoice detail (docs/design/web/AdmInvoice.dc.html): one invoice as a bilingual
// ZATCA-style document with the parties, line rows and totals, an actions card and the UBL
// preview. The invoice is one ledger entry found by URL param: totals and dates are real, buyer
// identity, VAT and ZATCA clearance are not recorded on entries and render as not recorded.
// Resending and issuing credit notes have no procedure, so those actions stay unavailable.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { AdminButton, AdminLink } from "../common/admin-actions";
import { AdminInput, AdminSelect, type AdminOption } from "../common/admin-form";
import { useAdminParam } from "../common/admin-actions";
import { getSelectedAdminInvoiceId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminCard,
  AdminPage,
  AdminRow,
  AdminSplit,
} from "../common/admin-ui";
import { formatDate, formatMinor } from "../finance/finance-format";

const K = "screen.admin.money.invoiceDetail";

const REASON_OPTIONS = (): readonly AdminOption[] => [
  { value: "pricing_error", label: t(`${K}.reasonPricingError`) },
  { value: "service_not_delivered", label: t(`${K}.reasonServiceNotDelivered`) },
  { value: "duplicate", label: t(`${K}.reasonDuplicate`) },
];

export function InvoiceDetail() {
  const { status: authStatus, locale } = useAuth();
  const invoiceId = useAdminParam("invoiceId", getSelectedAdminInvoiceId);

  const ledgerQuery = useQuery({
    ...serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
      input: {},
    }),
    enabled: authStatus === "authenticated",
  });

  const entry = useMemo(
    () => (ledgerQuery.data ?? []).find((row) => row.id === invoiceId) ?? null,
    [ledgerQuery.data, invoiceId],
  );

  return (
    <AdminPage
      title={entry ? entry.invoiceNumber || entry.id : t(`${K}.title`)}
      description={
        entry
          ? t(`${K}.subtitle`, {
              direction: entry.direction === "credit" ? t(`${K}.toTenant`) : t(`${K}.fromTenant`),
            })
          : t(`${K}.subtitleEmpty`)
      }
      actions={
        <AdminButton variant="secondary" disabled title={t(`${K}.noPdfProcedure`)}>
          {t(`${K}.pdfLink`)}
        </AdminButton>
      }
    >
      <AdminLink screen="SCR-ADM-43">{t(`${K}.backToInvoices`)}</AdminLink>

      <AdminQueryState query={ledgerQuery} loadingLabel={t(`${K}.loading`)}>
        {!entry ? (
          <AdminCard>
            <AdminEmpty title={t(`${K}.notFoundTitle`)} description={t(`${K}.notFoundBody`)} />
          </AdminCard>
        ) : (
          <AdminSplit
            main={
              <>
                <AdminCard label={t(`${K}.documentLabel`)}>
                  <div className="flex flex-col gap-4" dir="rtl" lang="ar">
                    <h2 className="te-h3">{t(`${K}.docTitleAr`)}</h2>
                  </div>
                  <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--te-hairline)] pb-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="te-h3">{t(`${K}.docTitleEn`)}</h2>
                      <span className="te-caption">{entry.invoiceNumber || entry.id}</span>
                    </div>
                    <AdminBadge tone="neutral" icon={false}>
                      {entry.status === "settled" ? t(`${K}.paid`) : t(`${K}.pending`)}
                    </AdminBadge>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <span className="te-label">{t(`${K}.seller`)}</span>
                      <span className="te-body">{t(`${K}.sellerName`)}</span>
                      <span className="te-caption">{t(`${K}.sellerVatNotRecorded`)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="te-label">{t(`${K}.buyer`)}</span>
                      <span className="te-body">{t(`${K}.buyerNotRecorded`)}</span>
                      <span className="te-caption">{entry.tenantId}</span>
                    </div>
                  </div>
                  <table className="w-full border-collapse text-sm leading-5">
                    <caption className="sr-only">{t(`${K}.linesCaption`)}</caption>
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="border-b border-[var(--te-hairline)] p-3 text-start"
                        >
                          {t(`${K}.lineDescription`)}
                        </th>
                        <th
                          scope="col"
                          className="border-b border-[var(--te-hairline)] p-3 text-end"
                        >
                          {t(`${K}.lineAmount`)}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border-b border-[var(--te-hairline)] p-3">
                          {t(`${K}.type.${entry.entryType}`)}
                        </td>
                        <td className="border-b border-[var(--te-hairline)] p-3 text-end">
                          {formatMinor(entry.grossAmountMinor, entry.currencyCode, locale)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border-b border-[var(--te-hairline)] p-3">
                          {t(`${K}.lineCommission`)}
                        </td>
                        <td className="border-b border-[var(--te-hairline)] p-3 text-end">
                          {formatMinor(-entry.commissionAmountMinor, entry.currencyCode, locale)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <AdminRow label={t(`${K}.totalExVat`)}>
                    {formatMinor(
                      entry.grossAmountMinor - entry.commissionAmountMinor,
                      entry.currencyCode,
                      locale,
                    )}
                  </AdminRow>
                  <AdminRow label={t(`${K}.vatAmount`)}>{t(`${K}.notRecorded`)}</AdminRow>
                  <AdminRow label={t(`${K}.totalDue`)} last>
                    <b>{formatMinor(entry.netAmountMinor, entry.currencyCode, locale)}</b>
                  </AdminRow>
                  <AdminRow label={t(`${K}.issuedOn`)}>
                    {formatDate(entry.occurredAt, locale)}
                  </AdminRow>
                  <AdminRow label={t(`${K}.recordedOn`)} last>
                    {formatDate(entry.createdAt, locale)}
                  </AdminRow>
                  <p className="te-caption">{entry.description}</p>
                </AdminCard>

                <AdminCard title={t(`${K}.ublTitle`)} caption={t(`${K}.ublCaption`)}>
                  <AdminAlert tone="info">{t(`${K}.ublNoSource`)}</AdminAlert>
                </AdminCard>
              </>
            }
            side={
              <>
                <AdminCard title={t(`${K}.actionsTitle`)}>
                  <AdminButton variant="secondary" disabled title={t(`${K}.noResendProcedure`)}>
                    {t(`${K}.resend`)}
                  </AdminButton>
                  <AdminButton variant="secondary" disabled title={t(`${K}.noCreditNoteProcedure`)}>
                    {t(`${K}.issueCreditNote`)}
                  </AdminButton>
                  <AdminAlert tone="info">{t(`${K}.creditNoteUnavailable`)}</AdminAlert>
                  <AdminInput
                    label={t(`${K}.creditAmountLabel`)}
                    disabled
                    value=""
                    onChange={() => undefined}
                  />
                  <AdminSelect
                    label={t(`${K}.creditReasonLabel`)}
                    options={REASON_OPTIONS()}
                    value="pricing_error"
                    disabled
                    onValueChange={() => undefined}
                  />
                </AdminCard>
                <AdminCard title={t(`${K}.relatedTitle`)}>
                  <AdminLink screen="SCR-ADM-43">{t(`${K}.allInvoices`)}</AdminLink>
                  <AdminLink screen="SCR-ADM-27">{t(`${K}.reconciliation`)}</AdminLink>
                  <AdminLink screen="SCR-ADM-28">{t(`${K}.settlements`)}</AdminLink>
                </AdminCard>
              </>
            }
          />
        )}
      </AdminQueryState>
    </AdminPage>
  );
}
