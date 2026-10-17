import { createFileRoute } from "@tanstack/react-router";

import { requireSurface } from "@/auth/guard";
import { GuardedSurface } from "@/components/guarded-surface";
import { BUSINESS_SURFACE } from "@/surfaces/business";
import { loadApiStatus } from "@/utils/api-status";

/** `/business` — organization owners and employees (AC-6). */
export const Route = createFileRoute("/business")({
  beforeLoad: requireSurface("business"),
  loader: loadApiStatus,
  component: () => <GuardedSurface surface={BUSINESS_SURFACE} />,
});
