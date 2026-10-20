import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { StudioProfile } from "@/screens/studio/profile/studio-profile";

/** `/studio/profile` — SCR-PHO-03 profile and visibility. */
export const Route = createFileRoute("/studio/profile")({
  loader: screenLoader("SCR-PHO-03"),
  head: pageHead("SCR-PHO-03"),
  component: StudioProfile,
});
