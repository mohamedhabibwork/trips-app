import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { PlatformDriverSignUp } from "@/screens/public/sign-up/platform-driver-sign-up";
import { pageHead } from "@/navigation/seo";

/** `/sign-up/driver` — SCR-PUB-04. */
export const Route = createFileRoute("/sign-up/driver")({
  loader: screenLoader("SCR-PUB-04"),
  head: pageHead("SCR-PUB-04"),
  component: PlatformDriverSignUp,
});
