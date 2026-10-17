import { useState } from "react";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { AdminDecisionForm } from "../common/admin-decision-form";
import { StatePreview } from "../common/admin-state-preview";
import { useAdminNavigate } from "../common/admin-links";
import { AdminFacts, AdminPage, AdminPanel, AdminStatus } from "../common/admin-shared";

const ACTION_OPTIONS: readonly TeSelectOption[] = [
  { value: "suspend", label: "Suspend account" },
  { value: "reinstate", label: "Reinstate account" },
];

const ACTIVE = { tone: "success", icon: "check", label: "Active" } as const;

export function SuspendOrReinstateDecision() {
  const [action, setAction] = useState("suspend");
  const goTo = useAdminNavigate();
  const isSuspend = action === "suspend";

  return (
    <AdminPage>
      <TePageHeader
        title="Suspend or reinstate (decision)"
        description="Stop or restore access without deleting data."
      />
      <StatePreview
        emptyTitle="No account selected"
        emptyDescription="Open an account from the directory before you suspend or reinstate it."
        loadingLabel="Loading the account."
      >
        <AdminPanel title="Account">
          <AdminStatus status={ACTIVE} />
          <AdminFacts
            items={[
              { label: "Account name", value: "[Entity name]" },
              { label: "Entity type", value: "[Entity type]" },
            ]}
          />
        </AdminPanel>
        <AdminPanel title="Decision">
          <TeSelect
            label="Action"
            options={ACTION_OPTIONS}
            value={action}
            onValueChange={setAction}
          />
          <AdminDecisionForm
            reasonLabel="Reason (required)"
            reasonHelp="Reason rules are not yet defined (D-234)."
            submitLabel={isSuspend ? "Suspend account" : "Reinstate account"}
            dialogTitle={isSuspend ? "Suspend this account?" : "Reinstate this account?"}
            dialogDescription={
              isSuspend
                ? "Access stops at once. Data is kept. The action is written to the audit log."
                : "Access is restored at once. Data is unchanged. The action is written to the audit log."
            }
            confirmLabel={isSuspend ? "Suspend account" : "Reinstate account"}
            tone={isSuspend ? "danger" : "default"}
            cancel={{ slug: "entity-detail", label: "Cancel" }}
            onConfirm={() => goTo("entity-detail")}
          />
        </AdminPanel>
        <TeInlineAlert
          tone={isSuspend ? "warning" : "info"}
          title={isSuspend ? "Effect of suspending" : "Effect of reinstating"}
        >
          {isSuspend
            ? "Access stops at once. Data is kept."
            : "Access is restored at once. Data is unchanged."}
        </TeInlineAlert>
      </StatePreview>
    </AdminPage>
  );
}
