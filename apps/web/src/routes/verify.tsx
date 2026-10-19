import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { VerificationByCode } from "@/screens/public/sign-up/verification-by-code";

/** `/verify` — SCR-PUB-07. */
export const Route = createFileRoute("/verify")({
  loader: screenLoader("SCR-PUB-07"),
  component: VerificationByCode,
});
