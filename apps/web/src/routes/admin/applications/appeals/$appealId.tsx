import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { AppealReview } from "@/screens/admin/applications/appeal-review";

/** `/admin/applications/appeals/$appealId` — SCR-ADM-06. */
export const Route = createFileRoute("/admin/applications/appeals/$appealId")({
  loader: screenLoader("SCR-ADM-06"),
  component: AppealReview,
});
