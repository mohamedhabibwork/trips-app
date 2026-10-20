import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { AuditLog } from "@/screens/admin/platform/audit-log";

/** `/admin/audit-log` — SCR-ADM-30. */
export const Route = createFileRoute("/admin/audit-log")({
  loader: screenLoader("SCR-ADM-30"),
  head: pageHead("SCR-ADM-30"),
  component: AuditLog,
});
