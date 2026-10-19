// E2: a blocking notice above the current route when the session ends (never a toast, never a
// redirect loop). Drafts stay mounted because the route is not unmounted by this component.
// Laid out as SCR-PUB-14: a card on the dimmed page.
import { useLocation, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Notice, StatusPill } from "@/components/kit/controls";

import { useAuth } from "../auth-context";

interface SessionEndedCardProps {
  /** The 12-hour cap has its own wording (F2). */
  maxSession: boolean;
  /** The sign-in control: a button in the dialog, a link on the page. */
  action: ReactNode;
  /** The in-app dialog is modal; the `/session-expired` page is a plain alert. */
  modal?: boolean;
}

/** The SCR-PUB-14 card, shared by the dialog and the `/session-expired` page. */
export function SessionEndedCard({ maxSession, action, modal = true }: SessionEndedCardProps) {
  const { t } = useAuth();
  return (
    <section
      role={modal ? "alertdialog" : "alert"}
      aria-modal={modal || undefined}
      aria-labelledby="session-expired-title"
      aria-describedby="session-expired-body"
      className="flex w-full max-w-[480px] flex-col gap-4 rounded-[var(--te-radius-lg)] bg-[var(--te-surface-raised)] p-6 text-[var(--te-ink)] shadow-[var(--te-card-shadow)] md:p-8"
    >
      <StatusPill tone="warning" icon="clock">
        {t("screen.auth.sessionExpired.badge")}
      </StatusPill>
      <h2 id="session-expired-title" className="m-0 text-[28px] leading-9 font-bold">
        {t("screen.auth.sessionExpired.title")}
      </h2>
      <p id="session-expired-body" className="m-0 text-base leading-6 text-[var(--te-ink-muted)]">
        {maxSession
          ? t("screen.auth.sessionExpired.bodyMax")
          : t("screen.auth.sessionExpired.body")}
      </p>
      <Notice tone="info">{t("screen.auth.sessionExpired.drafts")}</Notice>
      {action}
    </section>
  );
}

export function SessionExpiredDialog() {
  const { status, controller, t } = useAuth();
  const router = useRouter();
  const location = useLocation();

  if (status !== "sessionExpired") return null;

  const signInAgain = async (): Promise<void> => {
    controller.clearSession("anonymous");
    await router.navigate({ to: "/sign-in", search: { returnTo: location.href }, replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--te-glass-dim)] p-4">
      <SessionEndedCard
        maxSession={controller.expiredByMaxSession}
        action={
          <button
            type="button"
            autoFocus
            onClick={() => void signInAgain()}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[var(--te-radius-md)] border-0 bg-[var(--te-primary)] px-7 py-3 text-base font-semibold text-[var(--te-on-primary)]"
          >
            {t("screen.auth.signIn.submit")}
          </button>
        }
      />
    </div>
  );
}
