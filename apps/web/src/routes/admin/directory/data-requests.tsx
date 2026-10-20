import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { DeletionAndDataRequests } from "@/screens/admin/directory/deletion-and-data-requests";

/** `/admin/directory/data-requests` — SCR-ADM-10. */
export const Route = createFileRoute("/admin/directory/data-requests")({
  loader: screenLoader("SCR-ADM-10"),
  head: pageHead("SCR-ADM-10"),
  component: DeletionAndDataRequests,
});
