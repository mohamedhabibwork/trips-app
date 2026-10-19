// The deal state shared by the deal audit list and detail (SCR-ADM-21, SCR-ADM-22): negotiation
// statuses fold into Open, Finalized and Rejected, each drawn as the artboards' badge.
import { t } from "@trips-app/i18n";

import { AdminBadge, type AdminTone } from "../common/admin-ui";

export type DealState = "open" | "finalized" | "rejected";

const CLOSED_WITHOUT_DEAL = new Set(["declined", "expired", "cancelled"]);

export function dealState(status: string): DealState {
  if (status === "accepted") return "finalized";
  if (CLOSED_WITHOUT_DEAL.has(status)) return "rejected";
  return "open";
}

const STATE_PRESENTATION: Record<DealState, { key: string; tone: AdminTone }> = {
  open: { key: "screen.admin.dealsAndDisputes.dealState.open", tone: "info" },
  finalized: { key: "screen.admin.dealsAndDisputes.dealState.finalized", tone: "ok" },
  rejected: { key: "screen.admin.dealsAndDisputes.dealState.rejected", tone: "bad" },
};

export function dealStateLabel(state: DealState): string {
  return t(STATE_PRESENTATION[state].key);
}

/** `large` is the header badge of the detail page; the list draws it without the icon. */
export function DealStateBadge({ state, large = false }: { state: DealState; large?: boolean }) {
  const presentation = STATE_PRESENTATION[state];
  return (
    <AdminBadge
      tone={presentation.tone}
      icon={large ? undefined : false}
      className={large ? "px-3.5 py-1.5 text-sm leading-5" : undefined}
    >
      {t(presentation.key)}
    </AdminBadge>
  );
}
