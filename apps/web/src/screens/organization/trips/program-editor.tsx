import { useState } from "react";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeCheckbox } from "@trips-app/ui/components/te-checkbox";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const FLAG_IDS = ["optional", "preRequired", "capacityLimited", "vipOnly"] as const;

type FlagId = (typeof FLAG_IDS)[number];

const FLAG_LABELS: Record<FlagId, string> = {
  optional: "Optional",
  preRequired: "Pre-required",
  capacityLimited: "Capacity-limited (with cap)",
  vipOnly: "VIP-only",
};

const PRICING_OPTIONS: readonly TeSelectOption[] = [
  { value: "free", label: "Free" },
  { value: "per-person", label: "Per person" },
  { value: "by-quantity", label: "By quantity" },
  { value: "per-group", label: "Per group" },
  { value: "tiered", label: "Tiered" },
];

const INITIAL_FLAGS: Record<FlagId, boolean> = {
  optional: false,
  preRequired: false,
  capacityLimited: false,
  vipOnly: false,
};

export function ProgramEditor() {
  const goTo = useOrgNavigate();
  const [pricingModel, setPricingModel] = useState("per-person");
  const [flags, setFlags] = useState(INITIAL_FLAGS);

  const setFlag = (flag: FlagId, checked: boolean) => {
    setFlags((current) => ({ ...current, [flag]: checked }));
  };

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{ slug: "trip-wizard-step-5-programs", label: "Back to programs" }}
        />
        <TePageHeader
          title="Program editor"
          actions={
            <TeButton onClick={() => void goTo("trip-wizard-step-5-programs")}>Save</TeButton>
          }
        />
        <OrgSection title="Details">
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput label="Program name" placeholder="[Program name]" dir="auto" />
              <TeSelect
                label="Pricing model"
                options={PRICING_OPTIONS}
                value={pricingModel}
                onValueChange={setPricingModel}
                supportingText="Choose exactly one pricing model."
              />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Type flags">
          <TeCard>
            <div className="flex flex-col gap-4">
              {FLAG_IDS.map((flag) => (
                <TeCheckbox
                  key={flag}
                  label={FLAG_LABELS[flag]}
                  checked={flags[flag]}
                  onCheckedChange={(checked) => setFlag(flag, checked)}
                />
              ))}
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Prices">
          <div className="grid gap-4 sm:grid-cols-2">
            <TeInput label="Price" placeholder="[Amount]" inputMode="decimal" />
            <TeInput label="Currency" placeholder="[Currency code]" />
          </div>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
