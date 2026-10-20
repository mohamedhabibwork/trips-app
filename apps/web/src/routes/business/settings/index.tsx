import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { OrganizationProfileSettingsAndBranding } from "@/screens/organization/workspace/organization-profile-settings-and-branding";

/** `/business/settings` — SCR-ORG-03. */
export const Route = createFileRoute("/business/settings/")({
  loader: screenLoader("SCR-ORG-03"),
  head: pageHead("SCR-ORG-03"),
  component: OrganizationProfileSettingsAndBranding,
});
