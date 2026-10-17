import { createFileRoute } from "@tanstack/react-router";

import { requireSurface } from "@/auth/guard";
import { GuardedSurface } from "@/components/guarded-surface";
import { CREW_SURFACE } from "@/surfaces/crew";
import { loadApiStatus } from "@/utils/api-status";

/** `/crew` — vehicle moderators (AC-6). */
export const Route = createFileRoute("/crew")({
  beforeLoad: requireSurface("crew"),
  loader: loadApiStatus,
  component: () => <GuardedSurface surface={CREW_SURFACE} />,
});
