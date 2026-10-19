import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { AdminStaffAccounts } from "@/screens/admin/directory/admin-staff-accounts";

/** `/admin/staff` — SCR-ADM-11. */
export const Route = createFileRoute("/admin/staff")({
  loader: screenLoader("SCR-ADM-11"),
  component: AdminStaffAccounts,
});
