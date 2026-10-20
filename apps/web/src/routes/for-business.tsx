import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { ForBusiness } from "@/screens/public/for-business/for-business";

/** `/for-business` — SCR-PUB-22: the partner marketing page (roles, plans, ZATCA, FAQ). */
export const Route = createFileRoute("/for-business")({
  loader: screenLoader("SCR-PUB-22"),
  head: pageHead("SCR-PUB-22"),
  component: ForBusiness,
});
