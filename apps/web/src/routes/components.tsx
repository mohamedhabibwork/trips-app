import { createFileRoute } from "@tanstack/react-router";

import { ComponentGallery } from "@/components/component-gallery";

export const Route = createFileRoute("/components")({
  component: ComponentGallery,
});
