import { useState, type ReactNode } from "react";
import { Skeleton } from "@trips-app/ui/components/skeleton";
import { TeTabs, type TeTab } from "@trips-app/ui/components/te-tabs";
import { t } from "@trips-app/i18n";

export const DEFAULT_LOADING_LINES = 3;

type PreviewView = "main" | "loading" | "empty" | "error";

const VIEW_LABELS: Readonly<Record<PreviewView, string>> = {
  get main() {
    return t("screen.shared.statePreview.labels.main");
  },
  get loading() {
    return t("screen.shared.statePreview.labels.loading");
  },
  get empty() {
    return t("screen.shared.statePreview.labels.empty");
  },
  get error() {
    return t("screen.shared.statePreview.labels.error");
  },
};

const PREVIEW_VIEWS: readonly PreviewView[] = ["main", "loading", "empty", "error"];

export interface StatePreviewProps {
  /** The screen as it normally looks. */
  main: ReactNode;
  loading?: ReactNode;
  empty?: ReactNode;
  error?: ReactNode;
}

function isPreviewView(id: string): id is PreviewView {
  return PREVIEW_VIEWS.some((view) => view === id);
}

/**
 * Shows a screen with tabs that swap in its loading, empty, or error view. A tab appears only for
 * a state the spec names, so every screen lists just its own states.
 */
export function StatePreview({ main, loading, empty, error }: StatePreviewProps) {
  const [active, setActive] = useState<PreviewView>("main");
  const views: Readonly<Record<PreviewView, ReactNode | undefined>> = {
    main,
    loading,
    empty,
    error,
  };
  const tabs: readonly TeTab[] = PREVIEW_VIEWS.filter(
    (view) => view === "main" || views[view] !== undefined,
  ).map((view) => ({ id: view, label: VIEW_LABELS[view] }));

  function handleSelect(id: string) {
    if (isPreviewView(id)) {
      setActive(id);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <TeTabs
        tabs={tabs}
        activeId={active}
        onSelect={handleSelect}
        ariaLabel={t("screen.shared.statePreview.previewState")}
      />
      {views[active] ?? main}
    </div>
  );
}

/** Placeholder rows shown while a screen waits for data or for a submit to finish. */
export function StateLoading({ lines = DEFAULT_LOADING_LINES }: { lines?: number }) {
  return (
    <div
      role="status"
      aria-label={t("screen.shared.statePreview.loading")}
      className="flex flex-col gap-3"
    >
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
