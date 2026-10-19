import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { ChildSafetyReports } from "@/screens/organization/operations/child-safety-reports";

/** `/business/reports/child-safety` — SCR-ORG-42. */
export const Route = createFileRoute("/business/reports/child-safety")({
  loader: screenLoader("SCR-ORG-42"),
  component: ChildSafetyReports,
});
