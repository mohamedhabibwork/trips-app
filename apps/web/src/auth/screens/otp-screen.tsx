// The shared OTP step (sign-in and registration). Six boxes, a live resend countdown, and the
// development code the backend returns outside production so QA can finish the flow.
import { Button } from "@trips-app/ui/components/button";
import type { AuthErrorView } from "@trips-app/auth";
import { useEffect, useState } from "react";

import { useAuth } from "../auth-context";
import { AuthLinkRow, AuthShell } from "../components/auth-shell";
import { OtpInput } from "../components/otp-input";
import { SubmitBanner } from "../components/submit-banner";

export interface OtpScreenProps {
  target: string;
  resendAvailableInSeconds: number;
  devCodePreview?: string;
  submitting: boolean;
  error: AuthErrorView | null;
  onSubmit: (code: string) => void;
  onResend: () => void;
  onChangeTarget: () => void;
  title?: string;
}

export function OtpScreen({
  target,
  resendAvailableInSeconds,
  devCodePreview,
  submitting,
  error,
  onSubmit,
  onResend,
  onChangeTarget,
  title,
}: OtpScreenProps) {
  const { t, locale } = useAuth();
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(resendAvailableInSeconds);

  // The countdown is local: it starts from the server's `resendAvailableInSeconds` and never goes
  // negative, so the Resend button is enabled exactly when the server allows it.
  useEffect(() => {
    setSeconds(resendAvailableInSeconds);
  }, [resendAvailableInSeconds]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((value) => (value > 0 ? value - 1 : 0)), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  // "clearCode" recovery (AUTH_OTP_INVALID): empty the boxes so the user can retype.
  useEffect(() => {
    if (error?.recovery === "clearCode") setCode("");
  }, [error]);

  const canSubmit = code.length === 6 && !submitting;

  return (
    <AuthShell title={title ?? t("auth.otp.title")} subtitle={t("auth.otp.subtitle", { target })}>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) onSubmit(code);
        }}
      >
        <OtpInput value={code} onChange={setCode} disabled={submitting} />

        {devCodePreview ? (
          <p className="text-muted-foreground text-[11px]">
            {t("auth.otp.devCode", { code: devCodePreview })}
          </p>
        ) : null}

        <SubmitBanner view={error} locale={locale} />

        <Button type="submit" disabled={!canSubmit}>
          {submitting ? t("auth.common.submitting") : t("auth.otp.submit")}
        </Button>

        <AuthLinkRow>
          <Button
            type="button"
            size="sm"
            variant="link"
            disabled={seconds > 0 || submitting}
            onClick={onResend}
          >
            {seconds > 0 ? t("auth.otp.resendIn", { seconds }) : t("auth.otp.resend")}
          </Button>
          <span>·</span>
          <Button
            type="button"
            size="sm"
            variant="link"
            onClick={onChangeTarget}
            disabled={submitting}
          >
            {t("auth.otp.changeIdentifier")}
          </Button>
        </AuthLinkRow>
      </form>
    </AuthShell>
  );
}
