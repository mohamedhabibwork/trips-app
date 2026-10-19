// Screen states shared by the traveler surface: loading, empty, error (SCR-SHR-05 tone) and
// not-found (SCR-SHR-03 tone, used for revoked album links).
import type { ReactNode } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice } from "@/components/kit/controls";
import { TextLink } from "@/components/kit/controls";

interface ScreenStateProps {
  title?: string;
  body?: ReactNode;
  action?: ReactNode;
}

export function ScreenLoading({ label }: { label?: string }) {
  const { t } = useAuth();
  return (
    <div role="status" className="flex flex-col gap-3 px-1 py-10">
      <div className="h-5 w-2/3 animate-pulse rounded bg-[var(--te-hairline)]" />
      <div className="h-24 animate-pulse rounded-[var(--te-radius-md)] bg-[var(--te-hairline)]" />
      <div className="h-24 animate-pulse rounded-[var(--te-radius-md)] bg-[var(--te-hairline)]" />
      <span className="sr-only">{label ?? t("screen.traveler.common.loading")}</span>
    </div>
  );
}

export function ScreenEmpty({ title, body, action }: ScreenStateProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] p-6 shadow-[var(--te-card-shadow)]">
      <p className="m-0 text-base font-semibold">{title}</p>
      {body ? <p className="m-0 text-sm text-[var(--te-ink-muted)]">{body}</p> : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

/** The in-screen server error (SCR-SHR-05): retry stays on the page, data is not lost. */
export function ScreenError({ body, onRetry }: { body?: ReactNode; onRetry?: () => void }) {
  const { t } = useAuth();
  return (
    <div className="flex flex-col gap-3">
      <Notice tone="danger" strong>
        {t("screen.traveler.common.errorTitle")}
      </Notice>
      {body ? <p className="m-0 text-sm text-[var(--te-ink-muted)]">{body}</p> : null}
      <div className="flex flex-wrap gap-3">
        {onRetry ? (
          <Button tone="outline" onClick={onRetry}>
            {t("screen.traveler.common.retry")}
          </Button>
        ) : null}
        <TextLink to="/" className="self-center">
          {t("screen.traveler.common.goHome")}
        </TextLink>
      </div>
    </div>
  );
}

export function ScreenNotFound({ title, body }: ScreenStateProps) {
  const { t } = useAuth();
  return (
    <ScreenEmpty
      title={title ?? t("screen.traveler.common.notFoundTitle")}
      body={body ?? t("screen.traveler.common.notFoundBody")}
      action={<TextLink to="/trips">{t("screen.traveler.common.backToBrowse")}</TextLink>}
    />
  );
}
