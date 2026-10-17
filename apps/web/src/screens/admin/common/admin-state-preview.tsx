import { useState, type ReactNode } from "react";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeEmptyState } from "@trips-app/ui/components/te-empty-state";
import { TeErrorState } from "@trips-app/ui/components/te-error-state";
import { TeTabs, type TeTab } from "@trips-app/ui/components/te-tabs";

const STATE_TABS: readonly TeTab[] = [
  { id: "main", label: "Main" },
  { id: "loading", label: "Loading" },
  { id: "empty", label: "Empty" },
  { id: "error", label: "Error" },
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
    <section aria-label="Screen states" className="flex flex-col gap-4">
      <TeTabs
        tabs={STATE_TABS}
        activeId={activeId}
        onSelect={setActiveId}
        ariaLabel="Choose a screen state to preview"
      />
      {activeId === "main" ? children : null}
      {activeId === "loading" ? (
        <TeCard as="section" header={<h2 className="te-h3">Loading</h2>}>
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
