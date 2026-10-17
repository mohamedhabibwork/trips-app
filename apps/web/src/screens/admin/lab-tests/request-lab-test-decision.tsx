import { useState } from "react";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { AdminDecisionForm } from "../common/admin-decision-form";
import { StatePreview } from "../common/admin-state-preview";
import { useAdminNavigate } from "../common/admin-links";
import { AdminFacts, AdminPage, AdminPanel, AdminStatus } from "../common/admin-shared";

const MIN_DEADLINE_DAYS = 1;
const MAX_DEADLINE_DAYS = 7;
const DEFAULT_DEADLINE_DAYS = 3;

const TEST_OPTIONS: readonly TeSelectOption[] = [
  { value: "drug-screening", label: "Drug screening" },
  { value: "medical-fitness", label: "Medical fitness" },
  { value: "both", label: "Both" },
];

const DEADLINE_OPTIONS: readonly TeSelectOption[] = Array.from(
  { length: MAX_DEADLINE_DAYS - MIN_DEADLINE_DAYS + 1 },
  (_, index) => {
    const days = MIN_DEADLINE_DAYS + index;
    return { value: String(days), label: days === 1 ? "1 day" : `${days} days` };
  },
);

const ACTIVE = { tone: "success", icon: "check", label: "Active" } as const;

export function RequestLabTestDecision() {
  const [testType, setTestType] = useState("drug-screening");
  const [deadline, setDeadline] = useState(String(DEFAULT_DEADLINE_DAYS));
  const goTo = useAdminNavigate();

  return (
    <AdminPage>
      <TePageHeader
        title="Request lab test (decision)"
        description="Request a lab test for a driver. This pauses the driver at once."
      />
      <StatePreview
        emptyTitle="No driver selected"
        emptyDescription="Open a driver from the directory before you request a lab test."
        loadingLabel="Loading the driver."
      >
        <AdminPanel title="Driver">
          <AdminStatus status={ACTIVE} />
          <AdminFacts items={[{ label: "Driver", value: "[Driver name]" }]} />
        </AdminPanel>
        <AdminPanel title="Test request">
          <TeSelect
            label="Test type"
            options={TEST_OPTIONS}
            value={testType}
            onValueChange={setTestType}
          />
          <TeSelect
            label="Deadline"
            options={DEADLINE_OPTIONS}
            value={deadline}
            onValueChange={setDeadline}
            supportingText="Between 1 and 7 days. The default is 3 days (D-21)."
          />
          <AdminDecisionForm
            reasonLabel="Reason for the lab test (required)"
            reasonHelp="Recorded with the request in the audit log."
            submitLabel="Request test and pause driver"
            dialogTitle="Pause this driver now?"
            dialogDescription="The driver is paused at once and cannot take trips until the result passes."
            confirmLabel="Request test and pause"
            tone="danger"
            dialogEffect={
              <p className="te-caption">
                Upcoming trips return to organizers. Four actions stay open to the driver: book lab,
                upload result, support and sign out.
              </p>
            }
            cancel={{ slug: "lab-tests-queue", label: "Cancel" }}
            onConfirm={() => goTo("lab-tests-queue")}
          />
        </AdminPanel>
        <TeInlineAlert tone="warning" title="Effect on the driver">
          The driver is paused at once. Only the four allowed actions stay available. Upcoming trips
          return to organizers. Per-market legal review applies (NFR-COM-05).
        </TeInlineAlert>
      </StatePreview>
    </AdminPage>
  );
}
