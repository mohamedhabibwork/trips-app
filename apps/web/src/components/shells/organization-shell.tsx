// Frame of the organization dashboard (docs/design/web/organization, SCR-ORG-01): a navy top bar
// with the logo and the account menu, a white section list on the start side, and the cream page.
import type { ReactNode } from "react";

import { useAuth } from "@/auth/auth-context";
import { AccountMenu } from "@/auth/components/account-menu";
import { ORGANIZATION_NAV } from "@/navigation/shell-nav";
import { ORGANIZATION_BASE } from "@/navigation/web-routes";

import { ShellContent, useActiveSection } from "./shell-content";
import { BrandLink, LanguageSwitch, MAIN_CONTENT_ID, SkipLink } from "./shell-parts";
import { SidebarNav } from "./sidebar-nav";

interface OrganizationShellProps {
  children: ReactNode;
}

export function OrganizationShell({ children }: OrganizationShellProps) {
  const { t, direction } = useAuth();
  const activeSection = useActiveSection("organization");

  return (
    <div
      dir={direction}
      className="flex min-h-svh flex-col bg-[var(--te-surface)] text-[var(--te-ink)]"
    >
      <SkipLink />
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-[var(--te-surface-inverse)] px-4 text-[var(--te-ink-inverse)] md:px-6">
        <BrandLink to={ORGANIZATION_BASE} onDark className="h-8" />
        <div className="flex items-center gap-3">
          <LanguageSwitch className="text-[var(--te-ink-inverse)]" />
          <AccountMenu />
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="shrink-0 border-b border-[var(--te-hairline)] bg-[var(--te-surface-raised)] px-4 py-2 md:w-[232px] md:border-e md:border-b-0 md:py-6">
          <SidebarNav
            items={ORGANIZATION_NAV}
            activeSection={activeSection}
            label={t("component.shell.org.navLabel")}
            tone="light"
          />
        </aside>
        <main id={MAIN_CONTENT_ID} className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8">
          <ShellContent>{children}</ShellContent>
        </main>
      </div>
    </div>
  );
}
