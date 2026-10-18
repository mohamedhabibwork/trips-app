import { useState, type ReactNode } from "react";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeEmptyState } from "@trips-app/ui/components/te-empty-state";
import { TeErrorState } from "@trips-app/ui/components/te-error-state";
import { TeTabs, type TeTab } from "@trips-app/ui/components/te-tabs";
import { t } from "@trips-app/i18n";

const STATE_TABS = (): readonly TeTab[] => [
  { id: "main", label: t("screen.admin.common.adminStatePreview.main") },
  { id: "loading", label: t("screen.admin.common.adminStatePreview.loading") },
  { id: "empty", label: t("screen.admin.common.adminStatePreview.empty") },
  { id: "error", label: t("screen.admin.common.adminStatePreview.error") },
];

const DEFAULT_LOADING_LABEL = "Loading the details. This can take a few seconds.";

export interface StatePreviewProps {
  /** The main state of the screen. Shown on the Main tab. */
  children: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  loadingLabel?: string;
}

/** Switches a screen between its main, loading, empty and error states, for review. */
export function StatePreview({
  children,
  emptyTitle,
  emptyDescription,
  loadingLabel = DEFAULT_LOADING_LABEL,
}: StatePreviewProps) {
  const [activeId, setActiveId] = useState("main");

  return (
    <section
      aria-label={t("screen.admin.common.adminStatePreview.screenStates")}
      className="flex flex-col gap-4"
    >
      <TeTabs
        tabs={STATE_TABS()}
        activeId={activeId}
        onSelect={setActiveId}
        ariaLabel={t("screen.admin.common.adminStatePreview.chooseAScreenStateTo")}
      />
      {activeId === "main" ? children : null}
      {activeId === "loading" ? (
        <TeCard
          as="section"
          header={<h2 className="te-h3">{t("screen.admin.common.adminStatePreview.loading2")}</h2>}
        >
          <p role="status" aria-busy="true" className="te-body">
            {loadingLabel}
          </p>
        </TeCard>
      ) : null}
      {activeId === "empty" ? (
        <TeEmptyState title={emptyTitle} description={emptyDescription} />
      ) : null}
      {activeId === "error" ? <TeErrorState kind="server" /> : null}
    </section>
  );
}
