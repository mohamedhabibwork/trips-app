import { createFileRoute } from "@tanstack/react-router";

import { requireAnonymous } from "@/auth/guard";
import { CrewSignInScreen } from "@/auth/screens/crew-sign-in-screen";

interface SignInSearch {
  returnTo?: string;
}

/**
 * `/crew/sign-in` — vehicle moderator with a staff code.
 *
 * The trailing `_` keeps this route out of the guarded `/crew` branch.
 */
export const Route = createFileRoute("/crew_/sign-in")({
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
  }),
  beforeLoad: requireAnonymous("crew"),
  component: CrewSignInScreen,
});
