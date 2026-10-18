import { createFileRoute } from "@tanstack/react-router";

import { ScreenById } from "@/components/shells/shell-content";

/** `/business` — workspace home (SCR-ORG-01). The layout route prefetches its queries. */
export const Route = createFileRoute("/business/")({
  component: () => <ScreenById screenId="SCR-ORG-01" />,
});
