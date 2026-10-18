import { createFileRoute } from "@tanstack/react-router";

import { ScreenById } from "@/components/shells/shell-content";

/** `/business/sign-in/set-up-code` — staff code set-up on first sign-in (SCR-PUB-12). Public: no guard. */
export const Route = createFileRoute("/business_/sign-in_/set-up-code")({
  component: () => <ScreenById screenId="SCR-PUB-12" />,
});
