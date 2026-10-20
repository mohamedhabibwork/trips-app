import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { RequestLabTestDecision } from "@/screens/admin/lab-tests/request-lab-test-decision";

/** `/admin/lab-tests/request` — SCR-ADM-14. */
export const Route = createFileRoute("/admin/lab-tests/request")({
  loader: screenLoader("SCR-ADM-14"),
  head: pageHead("SCR-ADM-14"),
  component: RequestLabTestDecision,
});
