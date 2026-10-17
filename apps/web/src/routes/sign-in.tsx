import { createFileRoute } from "@tanstack/react-router";

import { requireAnonymous } from "@/auth/guard";
import { SignInScreen } from "@/auth/screens/sign-in-screen";

interface SignInSearch {
  returnTo?: string;
}

/** `/sign-in` — traveler, parent, driver and photographer (AC-2). */
export const Route = createFileRoute("/sign-in")({
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
  }),
  beforeLoad: requireAnonymous("traveler"),
  component: SignInRoute,
});

function SignInRoute() {
  const { returnTo } = Route.useSearch();
  return <SignInScreen returnTo={returnTo} />;
}
