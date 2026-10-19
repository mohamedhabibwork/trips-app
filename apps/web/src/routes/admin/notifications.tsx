import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { NotificationTemplates } from "@/screens/admin/platform/notification-templates";

/** `/admin/notifications` — SCR-ADM-31. */
export const Route = createFileRoute("/admin/notifications")({
  loader: screenLoader("SCR-ADM-31"),
  component: NotificationTemplates,
});
