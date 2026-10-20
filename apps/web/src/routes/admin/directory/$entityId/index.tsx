import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { EntityDetail } from "@/screens/admin/directory/entity-detail";

/** `/admin/directory/$entityId` — SCR-ADM-08. */
export const Route = createFileRoute("/admin/directory/$entityId/")({
  loader: screenLoader("SCR-ADM-08"),
  head: pageHead("SCR-ADM-08"),
  component: EntityDetail,
});
