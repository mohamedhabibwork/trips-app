import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { ContentModeration } from "@/screens/admin/platform/content-moderation";

/** `/admin/moderation` — SCR-ADM-40. */
export const Route = createFileRoute("/admin/moderation")({
  loader: screenLoader("SCR-ADM-40"),
  head: pageHead("SCR-ADM-40"),
  component: ContentModeration,
});
