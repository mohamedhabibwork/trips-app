import { createFileRoute } from "@tanstack/react-router";

import { requireAnonymous } from "@/auth/guard";
import { AdminSignInScreen } from "@/auth/screens/admin-sign-in-screen";
import { pageHead } from "@/navigation/seo";

interface SignInSearch {
  returnTo?: string;
}

/**
 * `/admin/sign-in` — password then mandatory TOTP (AC-2).
 *
 * The trailing `_` keeps this route out of the guarded `/admin` branch.
 */
export const Route = createFileRoute("/admin_/sign-in")({
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
  }),
  beforeLoad: requireAnonymous("admin"),
  head: pageHead("SCR-PUB-09"),
  component: AdminSignInScreen,
});
