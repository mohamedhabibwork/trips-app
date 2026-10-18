// The data states of an admin page. A page shows the state its data is in: loading, empty, or an
// error with Retry (SCR-ADM-01 draws the failed-queue alert this follows).
import type { ReactNode } from "react";
import { t } from "@trips-app/i18n";

import { AdminButton } from "./admin-actions";
import { AdminAlert } from "./admin-ui";

export function AdminLoading({ label }: { label?: string }) {
  return (
    <p role="status" aria-busy="true" className="te-body px-1 py-6 text-[var(--te-ink-muted)]">
      {label ?? t("screen.admin.common.adminStates.loading")}
    </p>
  );
}

export function AdminEmpty({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-2">
      <p className="te-label">{title}</p>
      {description ? <p className="te-body text-[var(--te-ink-muted)]">{description}</p> : null}
    </div>
  );
}

export function AdminLoadError({ title, onRetry }: { title?: string; onRetry: () => void }) {
  return (
    <AdminAlert
      tone="danger"
      title={title ?? t("screen.admin.common.adminStates.didNotLoad")}
      action={
        <AdminButton small onClick={onRetry}>
          {t("screen.admin.common.adminStates.retry")}
        </AdminButton>
      }
    >
      {t("screen.admin.common.adminStates.retryHelp")}
    </AdminAlert>
  );
}

interface QueryLike {
  isPending: boolean;
  isError: boolean;
  refetch: () => unknown;
}

/**
 * Shows loading or the load error for a query, else the children. A query that is disabled (no
 * session yet) counts as loading, so the page never flashes an empty table.
 */
export function AdminQueryState({
  query,
  loadingLabel,
  errorTitle,
  children,
}: {
  query: QueryLike;
  loadingLabel?: string;
  errorTitle?: string;
  children: ReactNode;
}) {
  if (query.isError) {
    return <AdminLoadError title={errorTitle} onRetry={() => void query.refetch()} />;
  }
  if (query.isPending) return <AdminLoading label={loadingLabel} />;
  return <>{children}</>;
}
