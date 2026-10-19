// Pieces every shell shares: the logo, the language switch and the skip link.
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";

const LOGO_ON_LIGHT = "/brand/trips-enjoy-horizontal-fullcolor.svg";
const LOGO_ON_DARK = "/brand/trips-enjoy-horizontal-reversed.svg";

interface BrandLinkProps {
  to: string;
  onDark?: boolean;
  className?: string;
}

export function BrandLink({ to, onDark = false, className = "h-9" }: BrandLinkProps) {
  const { t } = useAuth();
  // The surfaces swap in dark mode (inverse turns cream), so each theme gets the logo that reads
  // on it: full colour on a light surface, reversed on a dark one.
  const lightThemeLogo = onDark ? LOGO_ON_DARK : LOGO_ON_LIGHT;
  const darkThemeLogo = onDark ? LOGO_ON_LIGHT : LOGO_ON_DARK;
  return (
    <Link to={to} className="inline-flex shrink-0 items-center">
      <img
        src={lightThemeLogo}
        alt={t("component.shell.brand.name")}
        className={`${className} w-auto dark:hidden`}
      />
      <img
        src={darkThemeLogo}
        alt={t("component.shell.brand.name")}
        className={`${className} hidden w-auto dark:inline`}
      />
    </Link>
  );
}

interface LanguageSwitchProps {
  className?: string;
}

/** Shows the other language by its own name; switching keeps the page and its form state. */
export function LanguageSwitch({ className = "" }: LanguageSwitchProps) {
  const { t, locale, setLocale } = useAuth();
  const next = locale === "ar" ? "en" : "ar";
  return (
    <button
      type="button"
      lang={next}
      onClick={() => setLocale(next)}
      className={`min-h-11 px-2 text-sm font-semibold underline-offset-4 hover:underline ${className}`}
    >
      {next === "ar" ? t("component.shell.language.arabic") : t("component.shell.language.english")}
    </button>
  );
}

export const MAIN_CONTENT_ID = "main-content";

export function SkipLink() {
  const { t } = useAuth();
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only z-50 rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] px-4 py-2 font-semibold text-[var(--te-ink)] focus:not-sr-only focus:absolute focus:start-4 focus:top-4"
    >
      {t("component.shell.skipToContent")}
    </a>
  );
}
