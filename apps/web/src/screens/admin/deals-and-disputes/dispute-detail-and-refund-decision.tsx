import { useState } from "react";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { AdminDecisionForm } from "../common/admin-decision-form";
import { StatePreview } from "../common/admin-state-preview";
import { useAdminNavigate } from "../common/admin-links";
import {
  AdminFacts,
  AdminPage,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

const OPEN: AdminStatusPresentation = { tone: "warning", icon: "clock", label: "Open" };

const REFUND_OPTIONS: readonly TeSelectOption[] = [
  { value: "none", label: "No refund" },
  { value: "within-policy", label: "Refund within policy" },
  { value: "outside-policy", label: "Refund outside policy" },
];

const REFUND_NOTES: Record<string, string> = {
  none: "No refund is queued when you save.",
  "within-policy": "The refund is linked to this dispute and booking and is queued when you save.",
  "outside-policy":
    "A refund outside policy needs a reason. Your identity is recorded in the audit log.",
};

export function DisputeDetailAndRefundDecision() {
  const [refund, setRefund] = useState("none");
  const [outcome, setOutcome] = useState("");
  const goTo = useAdminNavigate();

  return (
    <AdminPage>
      <TePageHeader
        title="Dispute detail and refund decision"
        description="Record the outcome and any refund linked to this dispute."
      />
      <StatePreview
        emptyTitle="No outcome yet"
        emptyDescription="Record the outcome once both parties have been heard."
        loadingLabel="Loading the dispute."
      >
        <AdminPanel title="Parties and booking">
          <AdminStatus status={OPEN} />
          <AdminFacts
            items={[
              { label: "Traveler", value: "[Traveler name]" },
              { label: "Organization", value: "[Organization name]" },
              { label: "Booking", value: "[Booking reference]" },
              { label: "Payment", value: "[Payment reference]" },
              { label: "Amount paid", value: "[Amount]" },
            ]}
          />
        </AdminPanel>
        <AdminPanel title="Outcome and refund">
          <TeInput
            label="Outcome summary (required)"
            value={outcome}
            onChange={(event) => setOutcome(event.target.value)}
            placeholder="[Outcome of the dispute]"
          />
          <TeSelect
            label="Refund"
            options={REFUND_OPTIONS}
            value={refund}
            onValueChange={setRefund}
            supportingText="A refund stays pending until the gateway confirms it."
          />
          <TeInlineAlert tone="info" title="Refund">
            {REFUND_NOTES[refund]}
          </TeInlineAlert>
          <AdminDecisionForm
            reasonLabel="Reason for this outcome (required)"
            reasonHelp="Required for every outcome. A refund outside policy is audited with this reason."
            submitLabel="Save outcome"
            dialogTitle="Save this outcome and refund?"
            dialogDescription="A refund is queued through the original gateway. The decision is audited."
            confirmLabel="Save outcome"
            extraValid={outcome.trim() !== ""}
            dialogEffect={<p className="te-caption">{REFUND_NOTES[refund]}</p>}
            cancel={{ slug: "disputes-queue", label: "Cancel" }}
            onConfirm={() => goTo("disputes-queue")}
          />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
