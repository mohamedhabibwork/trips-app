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
      className="border-destructive/40 bg-destructive/10 text-destructive grid gap-1 border px-2.5 py-2 text-[11px]"
    >
      <p>{message}</p>
      {hint ? <p className="text-destructive/80">{hint}</p> : null}
      {showDetails ? (
        <details className="text-destructive/70">
          <summary className="cursor-pointer">{translate("auth.common.details", locale)}</summary>
          <code className="break-all">{view.requestId}</code>
        </details>
      ) : null}
    </div>
  );
}
