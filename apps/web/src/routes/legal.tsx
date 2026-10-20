import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { Legal } from "@/screens/public/legal/legal";

/** `/legal` — SCR-PUB-20: terms, privacy, child data, refunds and cookies in five sections. */
export const Route = createFileRoute("/legal")({
  loader: screenLoader("SCR-PUB-20"),
  head: pageHead("SCR-PUB-20"),
  component: Legal,
});
