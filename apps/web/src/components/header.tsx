import { Link } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { AccountMenu } from "@/auth/components/account-menu";

export default function Header() {
  const { t } = useAuth();

  const links = [
    { to: "/", label: t("auth.header.home") },
    { to: "/components", label: t("auth.header.components") },
  ] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex items-center gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} to={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        {/* P0-6: `/` is public and shows the account menu once a session exists. */}
        <div className="flex items-center gap-2">
          <AccountMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
