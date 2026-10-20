// Dev-only stub gateway page (NFR-SEC-12). The stub handoff redirects here instead of a real
// sandbox host; the traveler picks the callback outcome and the platform settles idempotently
// (FR-PAY-02). Never rendered in production builds.
import { useMutation } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, StatusPill } from "@/components/kit/controls";
import { serverRpc } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";

export function ScrShrMockGatewayPay() {
  const { t } = useAuth();
  const search = useSearch({ strict: false }) as { ref?: string };
  const [result, setResult] = useState<"succeeded" | "failed" | null>(null);

  const callback = useMutation({
    mutationKey: orpc.payments.processGatewayCallback.mutationKey(),
    mutationFn: (outcome: "succeeded" | "failed") =>
      serverRpc("payments/processGatewayCallback", {
        gateway: "stub",
        providerReference: search.ref ?? "",
        outcome,
      }),
    onSuccess: (_data, outcome) => setResult(outcome),
  });

  if (!search.ref) {
    return (
      <Notice tone="danger" strong>
        Missing payment reference (?ref=…) in the URL.
      </Notice>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-6">
      <StatusPill
        tone={result === "failed" ? "danger" : result ? "success" : "warning"}
        icon="clock"
      >
        {result ? t("screen.mockGateway.settled") : t("screen.mockGateway.pending")}
      </StatusPill>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.mockGateway.title")}</h1>
      <p className="m-0 text-[15px] text-[var(--te-ink-muted)]">{t("screen.mockGateway.hint")}</p>
      <code className="rounded bg-[var(--te-surface-muted,--alpha(var(--te-ink,black)/6%))] p-2 text-xs break-all">
        {search.ref}
      </code>
      {result ? (
        <Notice tone={result === "succeeded" ? "success" : "danger"} strong>
          {result === "succeeded"
            ? t("screen.mockGateway.succeededNote")
            : t("screen.mockGateway.failedNote")}
        </Notice>
      ) : (
        <div className="flex gap-2">
          <Button block disabled={callback.isPending} onClick={() => callback.mutate("succeeded")}>
            {t("screen.mockGateway.succeed")}
          </Button>
          <Button block disabled={callback.isPending} onClick={() => callback.mutate("failed")}>
            {t("screen.mockGateway.fail")}
          </Button>
        </div>
      )}
      {callback.isError ? <Notice tone="danger">{callback.error.message}</Notice> : null}
    </div>
  );
}
