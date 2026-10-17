import { createFileRoute } from "@tanstack/react-router";

import { requireSurface } from "@/auth/guard";
import { GuardedSurface } from "@/components/guarded-surface";
import { STUDIO_SURFACE } from "@/surfaces/studio";
import { loadApiStatus } from "@/utils/api-status";

/** `/studio` — photographers (platform and organization). */
export const Route = createFileRoute("/studio")({
  beforeLoad: requireSurface("studio"),
  loader: loadApiStatus,
  component: () => <GuardedSurface surface={STUDIO_SURFACE} />,
});
