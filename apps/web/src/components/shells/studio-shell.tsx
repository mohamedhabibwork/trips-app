// Frame of the photographer studio (docs/design/web/PhoWebHome.dc.html): a navy top bar with the
// Trips Enjoy logo, an amber "Studio" pill, one row of nav links, and the photographer's name with
// their plan line at the end. The page body is a cream column capped at the artboard width.
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/auth/auth-context";
import { AccountMenu } from "@/auth/components/account-menu";
import { STUDIO_NAV, navHref } from "@/navigation/shell-nav";
import { STUDIO_BASE } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { ShellContent, useActiveSection } from "./shell-content";
import { LanguageSwitch, MAIN_CONTENT_ID, SkipLink } from "./shell-parts";

interface StudioShellProps {
  children: ReactNode;
}

/** The plan line under the photographer's name, e.g. "Studio plan · Verified". */
function useStudioIdentity() {
  const { actor } = useAuth();
  // The name comes from the account row; the server renders without it and the client fills in.
  const profileQuery = useQuery({
    ...serverQueryOptions(orpc.traveler.getProfile, "traveler/getProfile", {
      input: undefined,
      enabled: typeof window !== "undefined",
      retry: false,
    }),
  });
  const subscriptionQuery = useQuery({
    ...serverQueryOptions(orpc.plans.getMySubscription, "plans/getMySubscription", {
      input: undefined,
      enabled: typeof window !== "undefined",
      retry: false,
    }),
  });

  const tier = subscriptionQuery.data?.tier ?? actor?.planTier ?? null;
  const isOrgPhotographer = actor?.activeRole === "org_photographer";
  return {
    name: profileQuery.data?.fullName ?? null,
    tier,
    isOrgPhotographer,
  };
}

const NAV_LINK =
  "inline-flex h-10 items-center rounded-full px-3.5 text-[15px] font-semibold no-underline transition-colors";

export function StudioShell({ children }: StudioShellProps) {
  const { t, direction } = useAuth();
  const activeSection = useActiveSection("studio");
  const identity = useStudioIdentity();

  const planLine = identity.isOrgPhotographer
    ? t("component.shell.studio.planLineOrg")
    : identity.tier
      ? t(`component.shell.studio.plan.${identity.tier}`)
      : null;

  return (
    <div
      dir={direction}
      className="flex min-h-svh flex-col bg-[var(--te-surface)] text-[var(--te-ink)]"
    >
      <SkipLink />
      <header className="bg-[#1a1c4b] text-[var(--te-ink-inverse)]">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-4 px-4 py-3 md:px-10">
          <Link to={STUDIO_BASE} className="inline-flex shrink-0 items-center gap-2.5 no-underline">
            <img
              src="/brand/trips-enjoy-horizontal-reversed.svg"
              alt={t("component.shell.brand.name")}
              className="h-8 w-auto"
            />
            <span className="rounded-full bg-[var(--te-highlight)] px-2.5 py-0.5 text-xs font-bold text-[#1a1c4b]">
              {t("component.shell.studio.badge")}
            </span>
          </Link>
          <nav
            aria-label={t("component.shell.studio.navLabel")}
            className="flex flex-1 flex-wrap gap-1"
          >
            {STUDIO_NAV.map((navItem) => {
              const active = navItem.section === activeSection;
              return (
                <Link
                  key={navItem.section}
                  to={navHref(navItem)}
                  className={`${NAV_LINK} ${
                    active
                      ? "bg-[#31367a] text-[var(--te-highlight)]"
                      : "text-[var(--te-ink-inverse)] hover:bg-[#31367a]/60"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {t(navItem.labelKey)}
                </Link>
              );
            })}
          </nav>
          <Link
            to="/studio/profile"
            className="flex items-center gap-2.5 no-underline text-[var(--te-ink-inverse)]"
          >
            <span className="flex flex-col items-end">
              <span className="text-sm font-semibold">
                {identity.name ?? t("component.shell.studio.photographerFallback")}
              </span>
              {planLine ? <span className="text-xs text-[#b8bad6]">{planLine}</span> : null}
            </span>
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full bg-[#31367a] text-[15px] font-bold text-[var(--te-highlight)]"
            >
              <TeCameraGlyph />
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitch className="text-[var(--te-ink-inverse)]" />
            <AccountMenu />
          </div>
        </div>
      </header>
      <main id={MAIN_CONTENT_ID} className="min-w-0 flex-1">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 pt-6 pb-10 md:px-10">
          <ShellContent>{children}</ShellContent>
        </div>
      </main>
    </div>
  );
}

function TeCameraGlyph() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM20 15l-5-5L5 20" />
    </svg>
  );
}
