import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { PortfolioManager } from "@/screens/studio/portfolio/portfolio-manager";

/** `/studio/portfolio` — SCR-PHO-02 portfolio manager. */
export const Route = createFileRoute("/studio/portfolio")({
  loader: screenLoader("SCR-PHO-02"),
  head: pageHead("SCR-PHO-02"),
  component: PortfolioManager,
});
