import { ApiStatus } from "@/components/api-status";
import { AdminHome } from "@/screens/admin/home/admin-home";
import { OrgButtonLink } from "@/screens/organization/common/org-link";
import { WorkspaceHome } from "@/screens/organization/workspace/workspace-home";
import type { SurfaceInfo } from "@/types";

export type { SurfaceInfo } from "@/types";

// Shared page for a surface. Connects /admin and /business directly to their workspace & onboarding screens.
export function SurfacePage({ surface }: { surface: SurfaceInfo }) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6">
        <h1 className="mb-1 text-xl font-semibold capitalize">{surface.id}</h1>
        <p className="text-muted-foreground mb-4 text-sm">{surface.domain}</p>
        <ApiStatus />
      </div>
      {surface.id === "admin" ? <AdminHome /> : null}
      {surface.id === "business" ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            <OrgButtonLink slug="organization-owned-drivers-and-photographers" variant="secondary">
              Organization-owned drivers and photographers
            </OrgButtonLink>
          </div>
          <WorkspaceHome />
        </div>
      ) : null}
    </div>
  );
}
