import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { LabTestsQueue } from "@/screens/admin/lab-tests/lab-tests-queue";

/** `/admin/lab-tests` — SCR-ADM-12. */
export const Route = createFileRoute("/admin/lab-tests/")({
  loader: screenLoader("SCR-ADM-12"),
  component: LabTestsQueue,
});
