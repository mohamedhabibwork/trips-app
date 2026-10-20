import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { ApiKeys } from "@/screens/organization/integrations/api-keys";

/** `/business/integrations/api-keys` — SCR-ORG-57. */
export const Route = createFileRoute("/business/integrations/api-keys")({
  loader: screenLoader("SCR-ORG-57"),
  head: pageHead("SCR-ORG-57"),
  component: ApiKeys,
});
