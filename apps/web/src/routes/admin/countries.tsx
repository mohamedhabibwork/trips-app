import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { CountriesMarkets } from "@/screens/admin/platform/countries-markets";

/** `/admin/countries` — SCR-ADM-39. */
export const Route = createFileRoute("/admin/countries")({
  loader: screenLoader("SCR-ADM-39"),
  head: pageHead("SCR-ADM-39"),
  component: CountriesMarkets,
});
