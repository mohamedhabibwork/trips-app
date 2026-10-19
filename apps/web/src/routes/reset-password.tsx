import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { PasswordReset } from "@/screens/public/account-recovery/password-reset";

/** `/reset-password` — SCR-PUB-13. */
export const Route = createFileRoute("/reset-password")({
  loader: screenLoader("SCR-PUB-13"),
  component: PasswordReset,
});
