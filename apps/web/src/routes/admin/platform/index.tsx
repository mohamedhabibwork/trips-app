import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { FeatureFlagsAndPlatformConfiguration } from "@/screens/admin/platform/feature-flags-and-platform-configuration";

/** `/admin/platform` — SCR-ADM-32. */
export const Route = createFileRoute("/admin/platform/")({
  loader: screenLoader("SCR-ADM-32"),
  component: FeatureFlagsAndPlatformConfiguration,
});
