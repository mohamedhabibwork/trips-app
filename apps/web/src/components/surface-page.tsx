import { AdminHome } from "@/screens/admin/home/admin-home";
import { OrgButtonLink } from "@/screens/organization/common/org-link";
import { LiveOperations } from "@/screens/organization/operations/live-operations";
import { StaffingBoard } from "@/screens/organization/staffing/staffing-board";
import { WorkspaceHome } from "@/screens/organization/workspace/workspace-home";
import type { SurfaceInfo } from "@/types";
import { t } from "@trips-app/i18n";

export type { SurfaceInfo } from "@/types";

// Shared page for a surface. Connects /admin, /business, /crew, and /studio directly to their workspace & operations screens.
export function SurfacePage({ surface }: { surface: SurfaceInfo }) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-12">
      {surface.id === "admin" ? <AdminHome /> : null}
      {surface.id === "business" ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            <OrgButtonLink slug="organization-owned-drivers-and-photographers" variant="secondary">
              {t("component.surfacePage.organizationOwnedDriversAndPhotographers")}
            </OrgButtonLink>
          </div>
          <WorkspaceHome />
        </div>
      ) : null}
      {surface.id === "crew" ? <LiveOperations /> : null}
      {surface.id === "studio" ? <StaffingBoard /> : null}
    </div>
  );
}
