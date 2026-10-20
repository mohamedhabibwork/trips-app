import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { SupportInbox } from "@/screens/admin/platform/support-inbox";

/** `/admin/support` — SCR-ADM-41. */
export const Route = createFileRoute("/admin/support")({
  loader: screenLoader("SCR-ADM-41"),
  head: pageHead("SCR-ADM-41"),
  component: SupportInbox,
});
