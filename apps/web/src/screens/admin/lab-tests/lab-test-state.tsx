// Lab test states shared by SCR-ADM-12 (queue) and SCR-ADM-13 (detail). The admin console reads
// lab tests through the driver review queue, so the state comes from the driver application.
import { t } from "@trips-app/i18n";

import { AdminBadge, type AdminTone } from "../common/admin-ui";

export type LabState = "requested" | "pending" | "result-uploaded" | "passed" | "failed" | "missed";

export const LAB_STATES: readonly LabState[] = [
  "requested",
  "pending",
  "result-uploaded",
  "passed",
  "failed",
  "missed",
];

export function labStateOf(applicationState: string): LabState {
  if (applicationState === "Approved") return "passed";
  if (applicationState === "Rejected") return "failed";
  return "result-uploaded";
}

const STATE_TONE: Record<LabState, AdminTone> = {
  requested: "info",
  pending: "info",
  "result-uploaded": "accent",
  passed: "ok",
  failed: "bad",
  missed: "bad",
};

export function labStateLabel(state: LabState): string {
  switch (state) {
    case "requested":
      return t("screen.admin.labTests.labTestState.requested");
    case "pending":
      return t("screen.admin.labTests.labTestState.pending");
    case "result-uploaded":
      return t("screen.admin.labTests.labTestState.resultUploaded");
    case "passed":
      return t("screen.admin.labTests.labTestState.passed");
    case "failed":
      return t("screen.admin.labTests.labTestState.failed");
    case "missed":
      return t("screen.admin.labTests.labTestState.missed");
  }
}

/** State badge. An overdue open test turns red and says so, as "Pending, overdue" does. */
export function LabStateBadge({
  state,
  overdue = false,
  label,
}: {
  state: LabState;
  overdue?: boolean;
  /** Replaces the plain state name, e.g. "Result uploaded, decision needed". */
  label?: string;
}) {
  const isOpen = state !== "passed" && state !== "failed";
  if (overdue && isOpen) {
    return (
      <AdminBadge tone="bad" icon="alert">
        {t("screen.admin.labTests.labTestState.overdueState", { state: labStateLabel(state) })}
      </AdminBadge>
    );
  }
  const tone = STATE_TONE[state];
  return (
    <AdminBadge tone={tone} icon={tone === "info" || tone === "accent" ? false : undefined}>
      {label ?? labStateLabel(state)}
    </AdminBadge>
  );
}
