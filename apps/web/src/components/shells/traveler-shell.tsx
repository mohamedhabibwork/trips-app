// Frame of the traveler app, in the landing's language (SCR-PUB-01 artboard): a cream header with
// the full-colour logo, semibold nav links that warm to #c93a00, a primary orange "Book a trip"
// CTA, and a navy footer on desktop. On phones the header drops its nav into the bottom tab bar
// (cream, orange active tab). Colours come from the --te-* tokens, which carry this palette.
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useAuth } from "@/auth/auth-context";
import { AccountMenu } from "@/auth/components/account-menu";
import { pathFor } from "@/navigation/web-routes";
import { OfflineBanner } from "@/screens/shared/offline-banner";

import { BrandLink, LanguageSwitch, MAIN_CONTENT_ID, SkipLink } from "./shell-parts";

const TOP_TABS = [
  { id: "SCR-TRV-01", key: "browse" },
  { id: "SCR-TRV-10", key: "bookings" },
  { id: "SCR-TRV-15", key: "albums" },
  { id: "SCR-TRV-14", key: "receipts" },
  { id: "SCR-TRV-18", key: "plans" },
  { id: "SCR-TRV-19", key: "profile" },
] as const;

const BOTTOM_TABS = [
  { id: "SCR-TRV-01", key: "browse" },
  { id: "SCR-TRV-10", key: "bookings" },
  { id: "SCR-TRV-19", key: "profile" },
] as const;

export function TravelerShell({ children }: { children: ReactNode }) {
  const { t, direction } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function tabPath(id: string): string {
    return id === "SCR-TRV-01" ? "/trips" : pathFor(id);
  }

  function isCurrent(id: string): boolean {
    const path = tabPath(id);
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  return (
    <div
      dir={direction}
      className="flex min-h-svh flex-col bg-[var(--te-page)] text-[var(--te-ink)]"
    >
      <SkipLink />
      <header className="border-b border-[var(--te-hairline)] bg-[var(--te-page)]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-3.5 max-md:px-4">
          <BrandLink to="/trips" className="h-10" />
          <nav
            aria-label={t("component.shell.traveler.primaryNav")}
            className="grow flex-wrap gap-x-6 max-lg:hidden lg:flex"
          >
            {TOP_TABS.map((tab) => (
              <Link
                key={tab.id}
                to={tabPath(tab.id)}
                aria-current={isCurrent(tab.id) ? "page" : undefined}
                className={`px-0 py-2.5 text-[15px] font-semibold no-underline hover:text-[var(--te-primary-text)] ${
                  isCurrent(tab.id) ? "text-[var(--te-primary-text)]" : "text-[var(--te-ink)]"
                }`}
              >
                {t(`component.shell.traveler.tab.${tab.key}`)}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitch className="hover:text-[var(--te-primary-text)]" />
            <AccountMenu />
            <Link
              to="/trips"
              className="inline-flex h-12 items-center rounded-[var(--te-radius-md)] bg-[var(--te-primary)] px-5 text-[15px] font-bold text-[var(--te-on-primary)] no-underline hover:bg-[var(--te-primary-strong)]"
            >
              {t("screen.public.landing.bookTrip")}
            </Link>
          </div>
        </div>
      </header>

      <main id={MAIN_CONTENT_ID} className="flex flex-1 flex-col pb-20 md:pb-0">
        <OfflineBanner />
        {children}
      </main>

      {/* Bottom tabs on phones (touch-first, 48px+ targets), cream with the orange active tab. */}
      <nav
        aria-label={t("component.shell.traveler.bottomNav")}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--te-hairline)] bg-[var(--te-page)] md:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-3">
          {BOTTOM_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-current={isCurrent(tab.id) ? "page" : undefined}
              className={`flex min-h-14 cursor-pointer flex-col items-center justify-center gap-0.5 border-0 border-t-2 border-transparent bg-transparent text-xs font-semibold ${
                isCurrent(tab.id)
                  ? "border-t-[var(--te-primary)] text-[var(--te-primary-text)]"
                  : "text-[var(--te-ink)]"
              }`}
              onClick={() => void navigate({ to: tabPath(tab.id) })}
            >
              {t(`component.shell.traveler.tab.${tab.key}`)}
            </button>
          ))}
        </div>
      </nav>

      <TravelerFooter topTabs={TOP_TABS} />
    </div>
  );
}

/* Footer ------------------------------------------------------------------------ */

/** The landing's navy footer, desktop only (phones keep the tab bar). */
function TravelerFooter({ topTabs }: { topTabs: readonly { id: string; key: string }[] }) {
  const { t } = useAuth();
  return (
    <footer className="hidden bg-[var(--te-navy)] text-[var(--te-ink-inverse)] md:block">
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-x-12 gap-y-6 px-6 py-8 max-md:px-4">
        <div className="flex items-center gap-8">
          <BrandLink to="/trips" onDark className="h-9" />
          <span className="max-w-[320px] text-[15px] leading-[22px] text-[#b8bad6]">
            {t("screen.public.landing.footer.tagline")}
          </span>
        </div>
        <nav
          aria-label={t("component.shell.traveler.primaryNav")}
          className="flex flex-wrap items-center gap-x-6 gap-y-2"
        >
          {topTabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.id === "SCR-TRV-01" ? "/trips" : pathFor(tab.id)}
              className="text-sm leading-7 text-[#b8bad6] no-underline hover:text-[#f6f3e4]"
            >
              {t(`component.shell.traveler.tab.${tab.key}`)}
            </Link>
          ))}
          <LanguageSwitch className="text-sm text-[#b8bad6] no-underline hover:text-[#f6f3e4]" />
        </nav>
      </div>
      <div className="mx-auto w-full max-w-[1200px] border-t border-[#31367a] px-6 pt-5 pb-6 text-[13px] text-[#b8bad6] max-md:px-4">
        {t("screen.public.landing.footer.copyright")}
      </div>
    </footer>
  );
}
