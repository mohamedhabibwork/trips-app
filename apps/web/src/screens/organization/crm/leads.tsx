// SCR-ORG-52 Leads pipeline: group, school and corporate inquiries
// (docs/design/web/OrgLeads.dc.html). No procedure stores leads yet, so the pipeline renders its
// structure — search, filters and stage columns — with an honest empty state, and adding a lead
// says it is not connected instead of pretending to save.
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { t } from "@trips-app/i18n";

import { OrgChips, OrgInput, OrgSelect } from "../common/org-form";
import {
  NO_VALUE,
  OrgAlert,
  OrgButton,
  OrgCard,
  OrgKpi,
  OrgKpiRow,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { CrmConnectBadge, CrmTabs } from "./crm-parts";

const K = "screen.organization.crm.leads";

const STAGES: readonly { id: string; labelKey: string }[] = [
  { id: "new", labelKey: "stageNew" },
  { id: "qualifying", labelKey: "stageQualifying" },
  { id: "quoting", labelKey: "stageQuoting" },
  { id: "negotiating", labelKey: "stageNegotiating" },
  { id: "won", labelKey: "stageWon" },
  { id: "lost", labelKey: "stageLost" },
];

export function Leads(): ReactNode {
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("everyone");
  const [type, setType] = useState("all");
  const [source, setSource] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [leadName, setLeadName] = useState("");

  const needle = search.trim().toLowerCase();

  function handleAdd(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    // No lead procedure exists yet; the alert under the form says so.
    setAddOpen(true);
  }

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={t(`${K}.caption`)}
        actions={
          <OrgButton onClick={() => setAddOpen((open) => !open)} aria-expanded={addOpen}>
            {t(`${K}.addLead`)}
          </OrgButton>
        }
      />
      <CrmTabs activeSlug="crm-leads" />
      <OrgKpiRow>
        <OrgKpi label={t(`${K}.kpiOpenLeads`)} value={0} hint={t(`${K}.noStoreHint`)} />
        <OrgKpi label={t(`${K}.kpiPipelineValue`)} value={NO_VALUE} hint={t(`${K}.noStoreHint`)} />
        <OrgKpi label={t(`${K}.kpiWonThisMonth`)} value={0} />
      </OrgKpiRow>
      {addOpen ? (
        <OrgCard title={t(`${K}.addLeadTitle`)}>
          <form onSubmit={handleAdd} className="flex flex-col gap-4" noValidate>
            <OrgInput
              label={t(`${K}.leadNameLabel`)}
              hint={t(`${K}.leadNameHint`)}
              value={leadName}
              onChange={(change) => setLeadName(change.target.value)}
              fieldClassName="max-w-[560px]"
            />
            <OrgAlert tone="info" title={t(`${K}.notConnectedTitle`)}>
              {t(`${K}.notConnectedBody`)}
            </OrgAlert>
            <div>
              <OrgButton type="submit" disabled={leadName.trim().length === 0}>
                {t(`${K}.saveLead`)}
              </OrgButton>
            </div>
          </form>
        </OrgCard>
      ) : null}
      <OrgCard title={t(`${K}.pipelineTitle`)}>
        <div className="flex flex-col gap-4">
          <OrgInput
            label={t(`${K}.searchLabel`)}
            type="search"
            placeholder={t(`${K}.searchPlaceholder`)}
            value={search}
            onChange={(change) => setSearch(change.target.value)}
            fieldClassName="max-w-[420px]"
          />
          <OrgRow align="start">
            <OrgSelect
              label={t(`${K}.ownerLabel`)}
              options={[
                { value: "everyone", label: t(`${K}.ownerEveryone`) },
                { value: "unassigned", label: t(`${K}.ownerUnassigned`) },
              ]}
              value={owner}
              onValueChange={setOwner}
              className="lg:flex-1"
            />
            <OrgChips
              label={t(`${K}.typeLabel`)}
              options={[
                { value: "all", label: t(`${K}.typeAll`) },
                { value: "school", label: t(`${K}.type.school`) },
                { value: "company", label: t(`${K}.type.company`) },
                { value: "event", label: t(`${K}.type.event`) },
              ]}
              value={type}
              onValueChange={setType}
            />
            <OrgSelect
              label={t(`${K}.sourceLabel`)}
              options={[
                { value: "all", label: t(`${K}.sourceAll`) },
                { value: "website", label: t(`${K}.source.website`) },
                { value: "referral", label: t(`${K}.source.referral`) },
                { value: "phone", label: t(`${K}.source.phone`) },
                { value: "inbox", label: t(`${K}.source.inbox`) },
              ]}
              value={source}
              onValueChange={setSource}
              className="lg:flex-1"
            />
          </OrgRow>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {STAGES.map((stage) => (
              <div
                key={stage.id}
                className="flex flex-col gap-3 rounded-xl border border-[var(--te-hairline)] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <b className="text-sm leading-5 font-semibold">{t(`${K}.${stage.labelKey}`)}</b>
                  <span className="te-caption text-[var(--te-ink-muted)]">0</span>
                </div>
                <span className="te-caption text-[var(--te-ink-muted)]">
                  {needle || owner !== "everyone" || type !== "all" || source !== "all"
                    ? t(`${K}.emptyFiltered`)
                    : t(`${K}.stageEmpty`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </OrgCard>
      <OrgCard title={t(`${K}.connectTitle`)}>
        <div className="flex flex-wrap items-center gap-4">
          <CrmConnectBadge />
          <p className="m-0 text-sm leading-5 text-[var(--te-ink-muted)]">
            {t(`${K}.connectBody`)}
          </p>
        </div>
      </OrgCard>
    </OrgPage>
  );
}
