import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { UsersAndEntitiesDirectory } from "@/screens/admin/directory/users-and-entities-directory";

/** `/admin/directory` — SCR-ADM-07. */
export const Route = createFileRoute("/admin/directory/")({
  loader: screenLoader("SCR-ADM-07"),
  component: UsersAndEntitiesDirectory,
});
