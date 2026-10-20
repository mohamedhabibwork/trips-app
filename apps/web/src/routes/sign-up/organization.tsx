import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { OrganizationSignUp } from "@/screens/public/sign-up/organization-sign-up";
import { pageHead } from "@/navigation/seo";

/** `/sign-up/organization` — SCR-PUB-06. */
export const Route = createFileRoute("/sign-up/organization")({
  loader: screenLoader("SCR-PUB-06"),
  head: pageHead("SCR-PUB-06"),
  component: OrganizationSignUp,
});
