import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { ApplicationReviewDetail } from "@/screens/admin/applications/application-review-detail";

/** `/admin/applications/$applicationId` — SCR-ADM-03. */
export const Route = createFileRoute("/admin/applications/$applicationId/")({
  loader: screenLoader("SCR-ADM-03"),
  component: ApplicationReviewDetail,
});
