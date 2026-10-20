import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { LabTestDetailAndDecision } from "@/screens/admin/lab-tests/lab-test-detail-and-decision";

/** `/admin/lab-tests/$labTestId` — SCR-ADM-13. */
export const Route = createFileRoute("/admin/lab-tests/$labTestId")({
  loader: screenLoader("SCR-ADM-13"),
  head: pageHead("SCR-ADM-13"),
  component: LabTestDetailAndDecision,
});
