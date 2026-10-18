// Frame of the public site, sign-up, sign-in and account-state pages (docs/design/web/public-shared,
// SCR-PUB-01 header): a white bar with the logo, the language switch and Sign in, over the cream page.
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useAuth } from "@/auth/auth-context";
import { AccountMenu } from "@/auth/components/account-menu";
import { pathFor } from "@/navigation/web-routes";
import { OfflineBanner } from "@/screens/shared/offline-banner";

import { BrandLink, LanguageSwitch, MAIN_CONTENT_ID, SkipLink } from "./shell-parts";

interface PublicShellProps {
  children: ReactNode;
  /** `inverse`: the navy admin sign-in frame (SCR-PUB-09, SCR-PUB-10). */
  tone?: "default" | "inverse";
}

export function PublicShell({ children, tone = "default" }: PublicShellProps) {
  const { t, direction, status } = useAuth();
  const signedIn = status === "authenticated";

  if (tone === "inverse") {
    return (
      <div
        dir={direction}
        className="flex min-h-svh flex-col bg-[var(--te-surface-inverse)] text-[var(--te-ink)]"
      >
        <SkipLink />
        <header className="text-[var(--te-ink-inverse)]">
          <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-3 md:px-12 md:py-5">
            <span className="flex items-center gap-2">
              <BrandLink to="/" onDark />
              <span className="text-sm font-semibold opacity-80">
                {t("component.shell.admin.signInLabel")}
              </span>
            </span>
            <LanguageSwitch />
          </div>
        </header>
        <main id={MAIN_CONTENT_ID} className="flex flex-1 flex-col">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div
      dir={direction}
      className="flex min-h-svh flex-col bg-[var(--te-surface)] text-[var(--te-ink)]"
    >
      <SkipLink />
      <header className="border-b border-[var(--te-hairline)] bg-[var(--te-surface-raised)]">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-3 md:px-12 md:py-5">
          <BrandLink to="/" />
          <nav
            aria-label={t("component.shell.public.primaryNav")}
            className="flex items-center gap-3 md:gap-6"
          >
            <LanguageSwitch />
            {signedIn ? (
              <AccountMenu />
            ) : (
              <Link
                to={pathFor("SCR-PUB-08")}
                className="inline-flex min-h-11 items-center rounded-[var(--te-radius-md)] border-2 border-[var(--te-ink)] px-5 text-sm font-semibold text-[var(--te-ink)] no-underline"
              >
                {t("component.shell.public.signIn")}
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main id={MAIN_CONTENT_ID} className="flex flex-1 flex-col">
        <OfflineBanner />
        {children}
      </main>
    </div>
  );
}
