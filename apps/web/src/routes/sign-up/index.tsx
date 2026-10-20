import { createFileRoute } from "@tanstack/react-router";

import { requireAnonymous } from "@/auth/guard";
import { SignUpScreen } from "@/auth/screens/sign-up-screen";
import { pageHead } from "@/navigation/seo";

interface SignUpSearch {
  returnTo?: string;
}

/** `/sign-up` — traveler and supplier self-registration (AC-1). */
export const Route = createFileRoute("/sign-up/")({
  validateSearch: (search: Record<string, unknown>): SignUpSearch => ({
    returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
  }),
  beforeLoad: requireAnonymous("traveler"),
  head: pageHead("SCR-PUB-02"),
  component: SignUpRoute,
});

function SignUpRoute() {
  const { returnTo } = Route.useSearch();
  return <SignUpScreen returnTo={returnTo} />;
}
