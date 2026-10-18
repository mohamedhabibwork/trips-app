import { useState, type ReactNode } from "react";

import { Skeleton } from "@trips-app/ui/components/skeleton";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeEmptyState } from "@trips-app/ui/components/te-empty-state";
import { TeErrorState } from "@trips-app/ui/components/te-error-state";
import { TeTabs, type TeTab } from "@trips-app/ui/components/te-tabs";
import { t } from "@trips-app/i18n";

const STATE_IDS = ["main", "loading", "empty", "error"] as const;

type StateId = (typeof STATE_IDS)[number];

const STATE_TABS = (): readonly TeTab[] => [
  { id: "main", label: t("screen.organization.common.organizationStatePreview.main") },
  { id: "loading", label: t("screen.organization.common.organizationStatePreview.loading") },
  { id: "empty", label: t("screen.organization.common.organizationStatePreview.empty") },
  { id: "error", label: t("screen.organization.common.organizationStatePreview.error") },
];

function isStateId(value: string): value is StateId {
  return (STATE_IDS as readonly string[]).includes(value);
}

function LoadingCard() {
  return (
    <div role="status" aria-live="polite">
      <span className="te-visually-hidden">
        {t("screen.organization.common.organizationStatePreview.loading2")}
      </span>
      <TeCard>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </TeCard>
    </div>
  );
}

interface StatePreviewProps {
  children: ReactNode;
}

/** Switches a screen between its main content and its loading, empty and error states. */
export function StatePreview({ children }: StatePreviewProps) {
  const [activeId, setActiveId] = useState<StateId>("main");

  const handleSelect = (id: string) => {
    if (isStateId(id)) {
      setActiveId(id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <TeTabs
        tabs={STATE_TABS()}
        activeId={activeId}
        onSelect={handleSelect}
        ariaLabel={t("screen.organization.common.organizationStatePreview.previewState")}
      />
      {activeId === "main" ? children : null}
      {activeId === "loading" ? <LoadingCard /> : null}
      {activeId === "empty" ? (
        <TeEmptyState
          title={t("screen.organization.common.organizationStatePreview.nothingHereYet")}
          description={t("screen.organization.common.organizationStatePreview.thisAreaHasNoItems")}
        />
      ) : null}
      {activeId === "error" ? <TeErrorState kind="server" /> : null}
    </div>
  );
}
