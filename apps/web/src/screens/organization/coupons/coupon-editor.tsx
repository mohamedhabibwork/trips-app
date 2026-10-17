import { useState } from "react";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { TeSwitch } from "@trips-app/ui/components/te-switch";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const TYPE_OPTIONS: readonly TeSelectOption[] = [
  { value: "fixed-amount", label: "Fixed amount" },
  { value: "percentage", label: "Percentage" },
  { value: "program-specific", label: "Program-specific" },
  { value: "free-program", label: "Free program" },
  { value: "first-booking", label: "First booking" },
  { value: "minimum-spend", label: "Minimum spend" },
];

const AUDIENCE_OPTIONS: readonly TeSelectOption[] = [
  { value: "public", label: "Public" },
  { value: "targeted", label: "Targeted" },
];

export function CouponEditor() {
  const goTo = useOrgNavigate();
  const [couponType, setCouponType] = useState("percentage");
  const [audience, setAudience] = useState("public");
  const [stackable, setStackable] = useState(false);

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "coupons-list", label: "Back to coupons" }} />
        <TePageHeader
          title="Coupon editor"
          actions={<TeButton onClick={() => void goTo("coupons-list")}>Save</TeButton>}
        />
        <OrgSection title="Code and type">
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput
                label="Code"
                placeholder="[Code]"
                supportingText="Type a custom code or generate one."
              />
              <TeSelect
                label="Type"
                options={TYPE_OPTIONS}
                value={couponType}
                onValueChange={setCouponType}
              />
              <TeInput label="Value" placeholder="[Value]" inputMode="decimal" />
              <TeInput
                label="Scope"
                defaultValue="This organization's trips"
                readOnly
                supportingText="Coupons apply only to this organization's trips."
              />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Limits and validity">
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput label="Total limit" placeholder="[Total uses]" inputMode="numeric" />
              <TeInput label="Per-user limit" placeholder="[Uses per user]" inputMode="numeric" />
              <TeInput label="Valid from" placeholder="YYYY-MM-DD" />
              <TeInput label="Valid until" placeholder="YYYY-MM-DD" />
              <TeInput label="Minimum booking value" placeholder="[Amount]" inputMode="decimal" />
              <TeInput label="Programs" placeholder="[Programs]" />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Audience">
          <TeCard>
            <div className="flex flex-col gap-4">
              <TeSelect
                label="Audience"
                options={AUDIENCE_OPTIONS}
                value={audience}
                onValueChange={setAudience}
              />
              <TeSwitch
                checked={stackable}
                onCheckedChange={setStackable}
                label="Can be combined with other coupons"
                onLabel="Yes"
                offLabel="No"
              />
            </div>
          </TeCard>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
