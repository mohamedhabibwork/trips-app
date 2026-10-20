import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { TravelerSignUp } from "@/screens/public/sign-up/traveler-sign-up";
import { pageHead } from "@/navigation/seo";

/** `/sign-up/traveler` — SCR-PUB-03. */
export const Route = createFileRoute("/sign-up/traveler")({
  loader: screenLoader("SCR-PUB-03"),
  head: pageHead("SCR-PUB-03"),
  component: TravelerSignUp,
});
