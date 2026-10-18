import { createFileRoute } from "@tanstack/react-router";

import { ScreenById } from "@/components/shells/shell-content";

/** `/admin` — admin home (SCR-ADM-01). The layout route prefetches its queries. */
export const Route = createFileRoute("/admin/")({
  component: () => <ScreenById screenId="SCR-ADM-01" />,
});
