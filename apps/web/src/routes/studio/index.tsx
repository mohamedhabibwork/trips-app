import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { StudioHome } from "@/screens/studio/home/studio-home";

/** `/studio` — SCR-PHO-01 studio home. */
export const Route = createFileRoute("/studio/")({
  loader: screenLoader("SCR-PHO-01"),
  head: pageHead("SCR-PHO-01"),
  component: StudioHome,
});
