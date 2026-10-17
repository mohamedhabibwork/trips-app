import { createFileRoute } from "@tanstack/react-router";

import { requireAnonymous } from "@/auth/guard";
import { StaffSignInScreen } from "@/auth/screens/staff-sign-in-screen";

interface SignInSearch {
  returnTo?: string;
}

/**
 * `/business/sign-in` — organization owner or employee.
 *
 * The trailing `_` on the parent segment keeps this route out of the `/business` branch, whose guard
 * would otherwise redirect the sign-in page to itself.
 */
export const Route = createFileRoute("/business_/sign-in")({
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
  }),
  beforeLoad: requireAnonymous("business"),
  component: StaffSignInScreen,
});
