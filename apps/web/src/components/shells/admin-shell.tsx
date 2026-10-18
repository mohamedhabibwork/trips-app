// Frame of the admin console (docs/design/web/admin, SCR-ADM-01): a navy sidebar with the logo and
// the section list, a white top bar with the breadcrumb and the account menu, and the cream page.
import type { ReactNode } from "react";

import { useAuth } from "@/auth/auth-context";
import { AccountMenu } from "@/auth/components/account-menu";
import { ADMIN_NAV } from "@/navigation/shell-nav";
import { ADMIN_BASE } from "@/navigation/web-routes";

import { ShellContent, useActiveSection } from "./shell-content";
import { BrandLink, LanguageSwitch, MAIN_CONTENT_ID, SkipLink } from "./shell-parts";
import { SidebarNav } from "./sidebar-nav";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { t, direction } = useAuth();
  const activeSection = useActiveSection("admin");
  const activeItem = ADMIN_NAV.find((navItem) => navItem.section === activeSection);

  return (
    <div
      dir={direction}
      className="flex min-h-svh flex-col bg-[var(--te-surface)] text-[var(--te-ink)] md:flex-row"
    >
      <SkipLink />
      <aside className="flex shrink-0 flex-col gap-4 bg-[var(--te-surface-inverse)] px-4 py-4 text-[var(--te-ink-inverse)] md:w-[232px] md:gap-6 md:py-6">
        <div className="px-3">
          <BrandLink to={ADMIN_BASE} onDark className="h-8" />
          <p className="mt-1 text-[13px] leading-[18px] font-medium">
            {t("component.shell.admin.consoleName")}
          </p>
        </div>
        <SidebarNav
          items={ADMIN_NAV}
          activeSection={activeSection}
          label={t("component.shell.admin.navLabel")}
          tone="dark"
        />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[var(--te-hairline)] bg-[var(--te-surface-raised)] px-4 md:px-8">
          <p className="truncate text-sm font-semibold text-[var(--te-ink-muted)]">
            {t("component.shell.admin.consoleName")}
            {activeItem ? ` / ${t(activeItem.labelKey)}` : null}
          </p>
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <AccountMenu />
          </div>
        </header>
        <main id={MAIN_CONTENT_ID} className="min-w-0 flex-1 px-4 py-6 md:p-8">
          <ShellContent>{children}</ShellContent>
        </main>
      </div>
    </div>
  );
}
