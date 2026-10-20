import { createFileRoute } from "@tanstack/react-router";

import { ScreenById } from "@/components/shells/screen-by-id";
import { pageHead } from "@/navigation/seo";

/** `/admin/sign-in/authenticator` — authenticator set-up and code (SCR-PUB-10). Public: no guard. */
export const Route = createFileRoute("/admin_/sign-in_/authenticator")({
  head: pageHead("SCR-PUB-10"),
  component: () => <ScreenById screenId="SCR-PUB-10" />,
});
