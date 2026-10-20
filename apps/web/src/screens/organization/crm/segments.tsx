// SCR-ORG-56 Segments: saved customer segments and the rule builder
// (docs/design/web/OrgSegments.dc.html). No procedure stores segments, so the builder runs on
// local state with validation and the live preview shows what is and is not computable yet.
import { useState, type FormEvent, type ReactNode } from "react";

import { t } from "@trips-app/i18n";

import { OrgChips, OrgInput, OrgSelect } from "../common/org-form";
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
import { CrmConnectBadge, CrmTabs } from "./crm-parts";

const K = "screen.organization.crm.segments";

interface SegmentRule {
  id: number;
  field: string;
  operator: string;
  value: string;
}

let nextRuleId = 1;

const RULE_FIELDS: readonly { value: string; labelKey: string }[] = [
  { value: "trips", labelKey: "fieldTrips" },
  { value: "spend", labelKey: "fieldSpend" },
  { value: "lastTrip", labelKey: "fieldLastTrip" },
  { value: "type", labelKey: "fieldType" },
];

const RULE_OPERATORS: readonly { value: string; labelKey: string }[] = [
  { value: "gte", labelKey: "operatorGte" },
  { value: "lte", labelKey: "operatorLte" },
  { value: "eq", labelKey: "operatorEq" },
];

export function Segments(): ReactNode {
  const [name, setName] = useState("");
  const [join, setJoin] = useState<"and" | "or">("and");
  const [rules, setRules] = useState<readonly SegmentRule[]>([
    { id: nextRuleId++, field: "trips", operator: "gte", value: "" },
  ]);
  const [saved, setSaved] = useState(false);

  const nameMissing = name.trim().length === 0;
  const rulesIncomplete = rules.some((rule) => rule.value.trim().length === 0);
  const valid = !nameMissing && !rulesIncomplete;

  function updateRule(id: number, patch: Partial<SegmentRule>) {
    setRules((current) => current.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  }

  // No segment procedure exists yet; saving keeps the builder on screen and says so.
  function handleSave(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!valid) return;
    setSaved(true);
  }

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={t(`${K}.caption`)}
        actions={
          <OrgButtonLink slug="crm-campaign-new" variant="secondary">
            {t(`${K}.useInCampaign`)}
          </OrgButtonLink>
        }
      />
      <CrmTabs activeSlug="crm-segments" />
      <OrgKpiRow>
        <OrgKpi label={t(`${K}.kpiSavedSegments`)} value={0} hint={t(`${K}.noStoreHint`)} />
        <OrgKpi label={t(`${K}.kpiCustomers`)} value={NO_VALUE} hint={t(`${K}.previewNote`)} />
      </OrgKpiRow>
      <OrgRow align="start">
        <OrgCard title={t(`${K}.builderTitle`)} className="lg:flex-[2]">
          <form onSubmit={handleSave} className="flex flex-col gap-4" noValidate>
            <OrgInput
              label={t(`${K}.nameLabel`)}
              error={nameMissing ? t(`${K}.nameRequired`) : undefined}
              value={name}
              onChange={(change) => setName(change.target.value)}
              fieldClassName="max-w-[420px]"
            />
            <OrgChips
              label={t(`${K}.matchLabel`)}
              options={[
                { value: "and", label: t(`${K}.matchAnd`) },
                { value: "or", label: t(`${K}.matchOr`) },
              ]}
              value={join}
              onValueChange={(value) => setJoin(value === "or" ? "or" : "and")}
            />
            {rules.map((rule) => (
              <div key={rule.id} className="flex flex-wrap items-end gap-3">
                <OrgSelect
                  label={t(`${K}.fieldLabel`)}
                  options={RULE_FIELDS.map((field) => ({
                    value: field.value,
                    label: t(`${K}.${field.labelKey}`),
                  }))}
                  value={rule.field}
                  onValueChange={(value) => updateRule(rule.id, { field: value })}
                  fieldClassName="w-full sm:w-auto sm:min-w-[180px]"
                />
                <OrgSelect
                  label={t(`${K}.operatorLabel`)}
                  options={RULE_OPERATORS.map((operator) => ({
                    value: operator.value,
                    label: t(`${K}.${operator.labelKey}`),
                  }))}
                  value={rule.operator}
                  onValueChange={(value) => updateRule(rule.id, { operator: value })}
                  fieldClassName="w-full sm:w-auto sm:min-w-[140px]"
                />
                <OrgInput
                  label={t(`${K}.valueLabel`)}
                  error={rule.value.trim().length === 0 ? t(`${K}.valueRequired`) : undefined}
                  value={rule.value}
                  onChange={(change) => updateRule(rule.id, { value: change.target.value })}
                  fieldClassName="w-full sm:w-auto sm:min-w-[140px]"
                />
                {rules.length > 1 ? (
                  <OrgButton
                    variant="text"
                    aria-label={t(`${K}.removeRule`)}
                    onClick={() =>
                      setRules((current) => current.filter((entry) => entry.id !== rule.id))
                    }
                  >
                    {t(`${K}.removeRule`)}
                  </OrgButton>
                ) : null}
              </div>
            ))}
            <div>
              <OrgButton
                variant="secondary"
                onClick={() =>
                  setRules((current) => [
                    ...current,
                    {
                      id: nextRuleId++,
                      field: "trips",
                      operator: "gte",
                      value: "",
                    },
                  ])
                }
              >
                {t(`${K}.addRule`)}
              </OrgButton>
            </div>
            {saved ? (
              <OrgAlert tone="info" title={t(`${K}.notConnectedTitle`)}>
                {t(`${K}.notConnectedBody`)}
              </OrgAlert>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <OrgButton type="submit" disabled={!valid}>
                {t(`${K}.saveSegment`)}
              </OrgButton>
            </div>
          </form>
        </OrgCard>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <OrgCard title={t(`${K}.previewTitle`)}>
            <div className="flex items-center gap-3">
              <b className="text-[28px] leading-9 font-semibold">{NO_VALUE}</b>
              <OrgBadge tone="neu" icon={false}>
                {t(`${K}.previewUnit`)}
              </OrgBadge>
            </div>
            <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.previewNote`)}</p>
          </OrgCard>
          <OrgCard title={t(`${K}.savedTitle`)}>
            <OrgEmpty title={t(`${K}.noSavedTitle`)}>{t(`${K}.noSavedBody`)}</OrgEmpty>
          </OrgCard>
          <OrgCard title={t(`${K}.connectTitle`)}>
            <div className="flex flex-wrap items-center gap-3">
              <CrmConnectBadge />
            </div>
          </OrgCard>
        </div>
      </OrgRow>
    </OrgPage>
  );
}
