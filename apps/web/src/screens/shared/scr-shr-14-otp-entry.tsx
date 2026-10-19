// SCR-SHR-14 OTP entry: the phone code step on its own page. The destination comes from the step
// that sent the code; resend uses the server's countdown.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AuthErrorView, SessionTokenPayload } from "@trips-app/auth";
import { useEffect, useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { toAuthErrorView } from "@/auth/errors";
import { homeRouteForRole } from "@/auth/home-route";
import { Notice } from "@/components/kit/controls";
import { PhoneColumn } from "@/components/kit/layout";
import { useCountdown } from "@/components/kit/use-countdown";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";

import { OtpEntryPanel, maskDestination } from "./otp-entry-panel";

const TARGET_KEY = "te:lastOtpTarget";

export function ScrShr14OtpEntry() {
  const { t, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
  const verifyMutation = useMutation(orpc.auth.verifyOtp.mutationOptions({ onSuccess }));
  const resendMutation = useMutation(orpc.auth.resendOtp.mutationOptions({ onSuccess }));
  const [code, setCode] = useState("");
  const [target, setTarget] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<AuthErrorView | null>(null);
  const [seconds, restartCountdown] = useCountdown();

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    const saved = sessionStorage.getItem(TARGET_KEY);
    if (saved) setTarget(saved);
  }, []);

  async function verify() {
    setError(null);
    try {
      const result = (await verifyMutation.mutateAsync({
        targetIdentifier: target || "pending-verification",
        purpose: "registration",
        code,
        surface: "web",
      })) as { session?: SessionTokenPayload | null };
      if (result.session) {
        signInWithSession(result.session);
        await navigate({ to: homeRouteForRole(result.session.activeRole) });
        return;
      }
      setVerified(true);
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: "auth/verifyOtp" }));
      setCode("");
    }
  }

  async function resend() {
    if (!target) return;
    setError(null);
    try {
      const next = (await resendMutation.mutateAsync({
        targetIdentifier: target,
        channel: target.includes("@") ? "email" : "sms",
        purpose: "registration",
      })) as { resendAvailableInSeconds?: number };
      restartCountdown(next.resendAvailableInSeconds ?? 0);
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: "auth/resendOtp" }));
    }
  }

  return (
    <PhoneColumn>
      <OtpEntryPanel
        destination={maskDestination(target)}
        code={code}
        onCodeChange={setCode}
        onSubmit={() => void verify()}
        onResend={() => void resend()}
        onChangeDestination={() => void navigate({ to: pathFor("SCR-PUB-02") })}
        resendInSeconds={seconds}
        submitting={verifyMutation.isPending}
        error={error}
      />
      {verified ? (
        <Notice tone="success">{t("screen.public.signUp.verification.verified")}</Notice>
      ) : null}
    </PhoneColumn>
  );
}
