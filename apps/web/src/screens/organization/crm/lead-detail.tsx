// SCR-ORG-53 Lead and quote: the lead's contact, requirements and the quote builder
// (docs/design/web/OrgLead.dc.html). Leads are not stored yet, so the quote lives in local state
// with validation and sending says it is not connected; the totals are computed from the numbers
// typed in, never invented.
import { useState, type FormEvent, type ReactNode } from "react";

import { t } from "@trips-app/i18n";

import { OrgButtonLink } from "../common/org-link";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgEmpty,
  OrgKpi,
  OrgKpiRow,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { OrgChips, OrgInput, OrgSelect } from "../common/org-form";
import { CrmConnectBadge, CrmTabs } from "./crm-parts";

const K = "screen.organization.crm.leadDetail";

type PaymentTerm = "net30" | "net15" | "deposit50" | "onReceipt";

/** Minor units of a major-unit amount typed into the form. */
function toMinor(value: string): number {
  return Math.max(0, Math.round((Number.parseFloat(value) || 0) * 100));
}

export function LeadDetail(): ReactNode {
  const [students, setStudents] = useState("");
  const [buses, setBuses] = useState("");
  const [pricePerStudent, setPricePerStudent] = useState("");
  const [teachersFree, setTeachersFree] = useState("0");
  const [term, setTerm] = useState<PaymentTerm>("net30");
  const [poNumber, setPoNumber] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [sent, setSent] = useState(false);

  const studentCount = Number.parseInt(students, 10) || 0;
  const freeCount = Number.parseInt(teachersFree, 10) || 0;
  const billableStudents = Math.max(0, studentCount - freeCount);
  const subtotalMinor = toMinor(pricePerStudent) * billableStudents;
  // VAT at the 15% rate the designs show; the lead store carries no tax table of its own.
  const vatMinor = Math.round(subtotalMinor * 0.15);
  const totalMinor = subtotalMinor + vatMinor;
  const perStudentMinor = studentCount > 0 ? Math.round(totalMinor / studentCount) : 0;
  const quoteComplete = studentCount > 0 && toMinor(pricePerStudent) > 0;

  function sendQuote(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!quoteComplete) return;
    // No lead or quote procedure exists yet; the alert under the form says so.
    setSent(true);
  }

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={t(`${K}.caption`)}
        badge={<OrgBadge tone="warn">{t(`${K}.draftBadge`)}</OrgBadge>}
        actions={
          <OrgButtonLink slug="crm-leads" variant="secondary">
            {t(`${K}.backToLeads`)}
          </OrgButtonLink>
        }
      />
      <CrmTabs activeSlug="crm-leads" />
      <OrgCard title={t(`${K}.contactTitle`)}>
        <OrgEmpty title={t(`${K}.contactUnknownTitle`)}>{t(`${K}.contactUnknownBody`)}</OrgEmpty>
      </OrgCard>
      <OrgKpiRow>
        <OrgKpi label={t(`${K}.kpiTravelers`)} value={studentCount || NO_VALUE} />
        <OrgKpi
          label={t(`${K}.kpiTotal`)}
          value={quoteComplete ? (totalMinor / 100).toFixed(2) : NO_VALUE}
          hint={t(`${K}.vatIncluded`)}
        />
        <OrgKpi
          label={t(`${K}.kpiPerStudent`)}
          value={quoteComplete ? (perStudentMinor / 100).toFixed(2) : NO_VALUE}
        />
      </OrgKpiRow>
      <form onSubmit={sendQuote} className="flex flex-col gap-6" noValidate>
        <OrgCard title={t(`${K}.requirementsTitle`)}>
          <div className="flex flex-col gap-4">
            <OrgRow align="start">
              <OrgInput
                label={t(`${K}.studentsLabel`)}
                type="number"
                min={0}
                value={students}
                onChange={(change) => setStudents(change.target.value)}
                className="lg:flex-1"
              />
              <OrgInput
                label={t(`${K}.busesLabel`)}
                type="number"
                min={0}
                value={buses}
                onChange={(change) => setBuses(change.target.value)}
                className="lg:flex-1"
              />
            </OrgRow>
            <OrgRow align="start">
              <OrgInput
                label={t(`${K}.priceLabel`)}
                type="number"
                min={0}
                step="0.01"
                hint={t(`${K}.priceHint`)}
                value={pricePerStudent}
                onChange={(change) => setPricePerStudent(change.target.value)}
                className="lg:flex-1"
              />
              <OrgInput
                label={t(`${K}.teachersFreeLabel`)}
                type="number"
                min={0}
                hint={t(`${K}.teachersFreeHint`)}
                value={teachersFree}
                onChange={(change) => setTeachersFree(change.target.value)}
                className="lg:flex-1"
              />
            </OrgRow>
          </div>
        </OrgCard>
        <OrgCard title={t(`${K}.termsTitle`)}>
          <div className="flex flex-col gap-4">
            <OrgChips
              label={t(`${K}.paymentTermsLabel`)}
              options={[
                { value: "net30", label: t(`${K}.terms.net30`) },
                { value: "net15", label: t(`${K}.terms.net15`) },
                { value: "deposit50", label: t(`${K}.terms.deposit50`) },
                { value: "onReceipt", label: t(`${K}.terms.onReceipt`) },
              ]}
              value={term}
              onValueChange={(value) => setTerm(value as PaymentTerm)}
            />
            <OrgRow align="start">
              <OrgInput
                label={t(`${K}.poLabel`)}
                value={poNumber}
                onChange={(change) => setPoNumber(change.target.value)}
                className="lg:flex-1"
              />
              <OrgInput
                label={t(`${K}.validUntilLabel`)}
                type="date"
                value={validUntil}
                onChange={(change) => setValidUntil(change.target.value)}
                className="lg:flex-1"
              />
            </OrgRow>
          </div>
        </OrgCard>
        <OrgCard title={t(`${K}.totalsTitle`)}>
          <dl className="m-0 flex flex-col gap-2 text-sm leading-5">
            <div className="flex justify-between gap-3">
              <dt>{t(`${K}.subtotal`)}</dt>
              <dd className="m-0">{(subtotalMinor / 100).toFixed(2)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>{t(`${K}.vat`)}</dt>
              <dd className="m-0">{(vatMinor / 100).toFixed(2)}</dd>
            </div>
            <div className="flex justify-between gap-3 text-base leading-6 font-semibold">
              <dt>{t(`${K}.total`)}</dt>
              <dd className="m-0">{(totalMinor / 100).toFixed(2)}</dd>
            </div>
          </dl>
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.totalsNote`)}</p>
        </OrgCard>
        {sent ? (
          <OrgAlert tone="info" title={t(`${K}.notConnectedTitle`)}>
            {t(`${K}.notConnectedBody`)}
          </OrgAlert>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <OrgButton type="submit" disabled={!quoteComplete}>
            {t(`${K}.sendQuote`)}
          </OrgButton>
          <OrgButton type="button" variant="secondary" disabled={!quoteComplete}>
            {t(`${K}.previewPdf`)}
          </OrgButton>
        </div>
      </form>
      <OrgCard title={t(`${K}.convertTitle`)}>
        <div className="flex flex-col gap-3">
          <p className="m-0 text-sm leading-5">{t(`${K}.convertBody`)}</p>
          <OrgSelect
            label={t(`${K}.convertLabel`)}
            options={[
              { value: "", label: t(`${K}.convertPick`) },
              { value: "private-trip", label: t(`${K}.convertPrivateTrip`) },
              { value: "b2b-invoice", label: t(`${K}.convertInvoice`) },
            ]}
            value=""
            onValueChange={() => {
              // Converting needs the trips/invoice wizards; the pick stays until a store exists.
            }}
            hint={t(`${K}.convertHint`)}
            fieldClassName="max-w-[420px]"
          />
          <div className="flex flex-wrap items-center gap-3">
            <CrmConnectBadge />
          </div>
        </div>
      </OrgCard>
    </OrgPage>
  );
}
