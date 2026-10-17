import { createFileRoute } from "@tanstack/react-router";

import { requireSurface } from "@/auth/guard";
import { GuardedSurface } from "@/components/guarded-surface";
import { ADMIN_SURFACE } from "@/surfaces/admin";
import { loadApiStatus } from "@/utils/api-status";

/** `/admin` — platform admins only (AC-6). The loader stays public so SSR needs no token. */
export const Route = createFileRoute("/admin")({
  beforeLoad: requireSurface("admin"),
  loader: loadApiStatus,
  component: () => <GuardedSurface surface={ADMIN_SURFACE} />,
});
