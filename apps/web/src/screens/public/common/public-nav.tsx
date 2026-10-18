import { Link } from "@tanstack/react-router";
import { t } from "@trips-app/i18n";
import { AUTH_ROUTES } from "./auth-routes";

export type PublicNavKey = "landing" | "sign-up" | "sign-in" | "status";

type NavItem =
  | { key: PublicNavKey; label: string; kind: "screen"; slug: string }
  | { key: PublicNavKey; label: string; kind: "route"; to: typeof AUTH_ROUTES.signIn };

const NAV_ITEMS = (): readonly NavItem[] => [
  {
    key: "landing",
    label: t("screen.public.common.publicNav.start"),
    kind: "screen",
    slug: "landing",
  },
  {
    key: "sign-up",
    label: t("screen.public.common.publicNav.signUp"),
    kind: "screen",
    slug: "sign-up-chooser",
  },
  {
    key: "sign-in",
    label: t("screen.public.common.publicNav.signIn"),
    kind: "route",
    to: AUTH_ROUTES.signIn,
  },
  {
    key: "status",
    label: t("screen.public.common.publicNav.applicationStatus"),
    kind: "screen",
    slug: "application-status-and-changes-response",
  },
];

interface NavEntryProps {
  item: NavItem;
  current: PublicNavKey;
}

function NavEntry({ item, current }: NavEntryProps) {
  const ariaCurrent = item.key === current ? "page" : undefined;

  if (item.kind === "route") {
    return (
      <Link to={item.to} className="te-link" aria-current={ariaCurrent}>
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      to="/screens/$surface/$slug"
      params={{ surface: "public", slug: item.slug }}
      className="te-link"
      aria-current={ariaCurrent}
    >
      {item.label}
    </Link>
  );
}

interface PublicNavProps {
  current: PublicNavKey;
}

/** Top navigation for public screens. The entry for the current screen gets aria-current="page". */
export function PublicNav({ current }: PublicNavProps) {
  return (
    <nav
      aria-label={t("screen.public.common.publicNav.public")}
      className="flex flex-wrap items-center gap-4"
    >
      {NAV_ITEMS().map((item) => (
        <NavEntry key={item.key} item={item} current={current} />
      ))}
    </nav>
  );
}
