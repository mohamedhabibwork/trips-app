// Section list of a dashboard shell. On desktop it is a column; below `md` it becomes one row that
// scrolls sideways, so the page keeps its full width at phone size.
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { navHref } from "@/navigation/shell-nav";
import type { ShellNavItem } from "@/navigation/shell-nav";

type Tone = "light" | "dark";

interface SidebarNavProps {
  items: readonly ShellNavItem[];
  activeSection: string | undefined;
  label: string;
  tone: Tone;
}

const ITEM_TONE: Record<Tone, { idle: string; active: string }> = {
  light: {
    idle: "text-[var(--te-ink)] hover:bg-[var(--te-glass-selection)]",
    active: "bg-[var(--te-accent)] text-[var(--te-brand-navy)]",
  },
  dark: {
    idle: "font-medium text-[var(--te-ink-inverse)] hover:bg-white/10",
    active: "bg-[var(--te-accent)] font-semibold text-[var(--te-brand-navy)]",
  },
};

export function SidebarNav({ items, activeSection, label, tone }: SidebarNavProps) {
  const { t } = useAuth();
  const styles = ITEM_TONE[tone];

  return (
    <nav aria-label={label} className="overflow-x-auto md:overflow-visible">
      <ul className="flex gap-1 md:flex-col">
        {items.map((navItem) => {
          const isActive = navItem.section === activeSection;
          return (
            <li key={navItem.section} className="shrink-0">
              <Link
                to={navHref(navItem)}
                activeOptions={{ exact: true }}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-11 items-center whitespace-nowrap rounded-[var(--te-radius-sm)] px-3 text-sm font-semibold no-underline ${
                  isActive ? styles.active : styles.idle
                }`}
              >
                {t(navItem.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
