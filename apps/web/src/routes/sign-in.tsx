import { createFileRoute } from "@tanstack/react-router";

import { requireAnonymous } from "@/auth/guard";
import { SignInScreen } from "@/auth/screens/sign-in-screen";
import { pageHead } from "@/navigation/seo";

interface SignInSearch {
  returnTo?: string;
}

/** `/sign-in` — traveler, parent, driver and photographer (AC-2). */
export const Route = createFileRoute("/sign-in")({
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
  }),
  beforeLoad: requireAnonymous("traveler"),
  head: pageHead("SCR-PUB-08"),
  component: SignInRoute,
});

function SignInRoute() {
  const { returnTo } = Route.useSearch();
  return <SignInScreen returnTo={returnTo} />;
}
