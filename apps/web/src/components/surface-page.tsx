import { ApiStatus } from "@/components/api-status";
import type { SurfaceInfo } from "@/types";

export type { SurfaceInfo } from "@/types";

// Shared page for a surface. Each surface replaces this with its own screens (see src/surfaces/<name>/README.md).
export function SurfacePage({ surface }: { surface: SurfaceInfo }) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-1 text-xl font-semibold capitalize">{surface.id}</h1>
      <p className="text-muted-foreground mb-6 text-sm">{surface.domain}</p>
      <ApiStatus />
    </div>
  );
}
