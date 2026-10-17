import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink, useAdminNavigate } from "../common/admin-links";
import {
  AdminActions,
  AdminFacts,
  AdminPage,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

const APPEALED: AdminStatusPresentation = {
  tone: "warning",
  icon: "clock",
  label: "Appealed (pending)",
};

const DECISION_OPTIONS: readonly TeSelectOption[] = [
  { value: "", label: "Select a decision" },
  { value: "uphold-appeal", label: "Uphold appeal (application becomes Approved)" },
  { value: "uphold-rejection", label: "Uphold rejection (application stays Rejected)" },
];

export function AppealReview() {
  const [decision, setDecision] = useState("");
  const [reason, setReason] = useState("");
  const goTo = useAdminNavigate();
  const canSave = decision !== "" && reason.trim() !== "";

  return (
    <AdminPage>
      <TePageHeader
        title="Appeal review"
        description="Decide an appeal from a rejected applicant."
      />
      <StatePreview
        emptyTitle="No appeal statement"
        emptyDescription="The applicant has not added a statement to this appeal."
        loadingLabel="Loading the appeal."
      >
        <AdminPanel title="Original application">
          <AdminStatus status={APPEALED} />
          <AdminFacts
            items={[
              { label: "Applicant name", value: "[Applicant name]" },
              { label: "Application type", value: "[Application type]" },
              { label: "Rejected on", value: "[Date]" },
              { label: "Rejection reason", value: "[Reason code]" },
            ]}
          />
          <AdminScreenLink slug="application-review-detail">
            Open original application
          </AdminScreenLink>
        </AdminPanel>
        <AdminPanel title="Appeal statement">
          <p>[Appeal statement from the applicant]</p>
          <AdminFacts
            items={[
              { label: "Appeal received", value: "[Date]" },
              { label: "Appeal window closes", value: "[Date]" },
            ]}
          />
        </AdminPanel>
        <AdminPanel title="Decision">
          <TeSelect
            label="Decision (required)"
            options={DECISION_OPTIONS}
            value={decision}
            onValueChange={setDecision}
          />
          <TeInput
            label="Reason (required)"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="[Reason for the decision]"
            supportingText="Recorded with the decision in the audit log."
          />
        </AdminPanel>
        <TeInlineAlert tone="info" title="Appeal window">
          A decision can be saved only while the appeal window is open.
        </TeInlineAlert>
        <AdminActions>
          <AdminScreenLink slug="application-review-detail" variant="secondary">
            Cancel
          </AdminScreenLink>
          <TeButton disabled={!canSave} onClick={() => goTo("application-review-detail")}>
            Save decision
          </TeButton>
        </AdminActions>
      </StatePreview>
    </AdminPage>
  );
}
