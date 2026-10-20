import { createFileRoute } from "@tanstack/react-router";

import { ScrShrMockGatewayPay } from "@/surfaces/shared/scr-shr-mock-gateway-pay";

/** `/mock-gateway/pay` — dev-only stub gateway callback page (never built for production). */
export const Route = createFileRoute("/mock-gateway/pay")({
  validateSearch: (search: Record<string, unknown>) => ({
    ref: typeof search.ref === "string" ? search.ref : undefined,
  }),
  component: ScrShrMockGatewayPay,
});
