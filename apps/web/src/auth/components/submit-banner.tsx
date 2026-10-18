// The single inline banner above the submit button (M2). Never a toast, so it cannot be missed.
import { messageFor } from "@trips-app/auth";
import type { AuthErrorView, AuthLocale } from "@trips-app/auth";
import { t as translate } from "@trips-app/i18n";

export interface SubmitBannerProps {
  view: AuthErrorView | null;
  locale: AuthLocale;
  /** Extra copy under the message, e.g. the support hint for `staff_2fa_setup_required`. */
  hint?: string;
}

export function SubmitBanner({ view, locale, hint }: SubmitBannerProps) {
  if (!view) return null;

  const message = messageFor(view, locale);
  // M1: the raw reference lives in a collapsed block, never in the main sentence.
  const showDetails = Boolean(view.requestId);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="grid gap-1 rounded-[var(--te-radius-md)] bg-[var(--te-danger-soft)] px-3.5 py-3 text-sm leading-5 text-[var(--te-danger)]"
    >
      <p className="m-0 font-semibold">{message}</p>
      {hint ? <p className="m-0 text-[var(--te-ink)]">{hint}</p> : null}
      {showDetails ? (
        <details className="text-[13px] text-[var(--te-ink-muted)]">
          <summary className="cursor-pointer">{translate("auth.common.details", locale)}</summary>
          <code className="break-all">{view.requestId}</code>
        </details>
      ) : null}
    </div>
  );
}
