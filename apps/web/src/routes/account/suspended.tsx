import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { AccountSuspended } from "@/screens/public/account-recovery/account-suspended";

/** `/account/suspended` — SCR-PUB-15. */
export const Route = createFileRoute("/account/suspended")({
  loader: screenLoader("SCR-PUB-15"),
  head: pageHead("SCR-PUB-15"),
  component: AccountSuspended,
});
