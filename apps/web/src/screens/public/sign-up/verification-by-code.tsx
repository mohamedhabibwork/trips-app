// SCR-PUB-07 Verification by code (`/verify`): six boxes, the resend countdown, and links to resend
// or change the destination. The destination comes from the sign-up or sign-in step.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AuthErrorView, SessionTokenPayload } from "@trips-app/auth";
import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/auth/auth-context";
import { OtpInput } from "@/auth/components/otp-input";
import { SubmitBanner } from "@/auth/components/submit-banner";
import { toAuthErrorView } from "@/auth/errors";
import { homeRouteForRole } from "@/auth/home-route";
import { Button, Notice, StepLabel, TextButton } from "@/components/kit/controls";
import { CenteredPanel, Lead, PanelHeading } from "@/components/kit/layout";
import { useCountdown } from "@/components/kit/use-countdown";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";

import { maskDestination } from "../../shared/otp-entry-panel";

const CODE_LENGTH = 6;
const TARGET_KEY = "te:lastOtpTarget";

/** Confirms the email or phone before the account can act. The destination is partly masked. */
export function VerificationByCode() {
  const { t, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
  const verifyMutation = useMutation(orpc.auth.verifyOtp.mutationOptions({ onSuccess }));
  const resendMutation = useMutation(orpc.auth.resendOtp.mutationOptions({ onSuccess }));
  const [code, setCode] = useState("");
  const [target, setTarget] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<AuthErrorView | null>(null);
  const [seconds, restartCountdown] = useCountdown();
  const isEmail = target.includes("@");

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    const saved = sessionStorage.getItem(TARGET_KEY);
    if (saved) setTarget(saved);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || code.length !== CODE_LENGTH) return;
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!target) return;
    setError(null);
    try {
      const next = (await resendMutation.mutateAsync({
        targetIdentifier: target,
        channel: isEmail ? "email" : "sms",
        purpose: "registration",
      })) as { resendAvailableInSeconds?: number };
      restartCountdown(next.resendAvailableInSeconds ?? 0);
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: "auth/resendOtp" }));
    }
  }

  return (
    <CenteredPanel width={520}>
      <StepLabel>
        {isEmail
          ? t("screen.public.signUp.verification.stepEmail")
          : t("screen.public.signUp.verification.stepPhone")}
      </StepLabel>
      <PanelHeading>{t("screen.auth.otp.title")}</PanelHeading>
      <Lead>
        {t("screen.auth.otp.sentTo")}{" "}
        <span dir="ltr" className="font-semibold text-[var(--te-ink)]">
          {maskDestination(target)}
        </span>
        {t("screen.auth.otp.expires")}
      </Lead>
      <form className="flex flex-col gap-5" onSubmit={(event) => void handleSubmit(event)}>
        <OtpInput value={code} onChange={setCode} disabled={submitting || verified} />
        <p role="status" className="m-0 text-sm leading-5 text-[var(--te-ink-muted)]">
          {seconds > 0
            ? t("screen.auth.otp.resendIn", { seconds })
            : t("screen.auth.otp.resendReady")}
        </p>
        <SubmitBanner view={error} locale={locale} />
        {verified ? (
          <Notice tone="success">{t("screen.public.signUp.verification.verified")}</Notice>
        ) : null}
        <Button type="submit" disabled={code.length !== CODE_LENGTH || submitting || verified}>
          {submitting ? t("auth.common.submitting") : t("auth.otp.submit")}
        </Button>
        <div className="flex flex-wrap justify-between gap-3">
          <TextButton
            onClick={() => void handleResend()}
            disabled={seconds > 0 || !target || resendMutation.isPending}
          >
            {t("auth.otp.resend")}
          </TextButton>
          <TextButton onClick={() => void navigate({ to: pathFor("SCR-PUB-02") })}>
            {isEmail
              ? t("screen.auth.signUp.changeEmail")
              : t("screen.public.signUp.verification.changeNumber")}
          </TextButton>
        </div>
      </form>
    </CenteredPanel>
  );
}
