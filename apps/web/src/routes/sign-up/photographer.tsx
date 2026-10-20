import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { PhotographerSignUp } from "@/screens/public/sign-up/photographer-sign-up";
import { pageHead } from "@/navigation/seo";

/** `/sign-up/photographer` — SCR-PUB-05. */
export const Route = createFileRoute("/sign-up/photographer")({
  loader: screenLoader("SCR-PUB-05"),
  head: pageHead("SCR-PUB-05"),
  component: PhotographerSignUp,
});
