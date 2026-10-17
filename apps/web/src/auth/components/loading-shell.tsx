// The loading shell used while the session hydrates (ARCHITECTURE §4.3).
import { t as translate } from "@trips-app/i18n";
import type { AuthLocale } from "@trips-app/auth";

export interface LoadingShellProps {
  locale?: AuthLocale;
  label?: string;
}

/** Rendered on the server, on the first client paint, and while `status === "loading"`. */
export function LoadingShell({ locale = "ar", label }: LoadingShellProps) {
  const text = label ?? translate("auth.loading.session", locale);

  return (
    <div
      className="flex min-h-40 items-center justify-center px-4 py-10"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span className="border-muted-foreground/40 border-t-foreground size-4 animate-spin rounded-full border-2" />
        <span className="text-muted-foreground text-xs">{text}</span>
      </div>
    </div>
  );
}
