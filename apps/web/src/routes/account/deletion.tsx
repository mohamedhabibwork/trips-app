import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { DeletionGracePeriod } from "@/screens/public/account-recovery/deletion-grace-period";

/** `/account/deletion` — SCR-PUB-16. */
export const Route = createFileRoute("/account/deletion")({
  loader: screenLoader("SCR-PUB-16"),
  head: pageHead("SCR-PUB-16"),
  component: DeletionGracePeriod,
});
