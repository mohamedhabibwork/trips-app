// The shared OTP step (sign-in and registration), laid out as SCR-PUB-07. Six boxes, a live resend countdown, and the
// development code the backend returns outside production so QA can finish the flow.
import type { AuthErrorView } from "@trips-app/auth";
import { useEffect, useState } from "react";

import { Button, StepLabel, TextButton } from "@/components/kit/controls";

import { useAuth } from "../auth-context";
import { AuthShell } from "../components/auth-shell";
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
  /** "Step 1 of 2: email" when the code is one step of a longer flow (SCR-PUB-07). */
  stepLabel?: string;
  /** Overrides "Use a different email or phone" (e.g. "Change email"). */
  changeLabel?: string;
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
  stepLabel,
  changeLabel,
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
    <AuthShell
      width={520}
      badge={stepLabel ? <StepLabel>{stepLabel}</StepLabel> : undefined}
      title={title ?? t("screen.auth.otp.title")}
      subtitle={
        <>
          {t("screen.auth.otp.sentTo")}{" "}
          <span dir="ltr" className="font-semibold text-[var(--te-ink)]">
            {target}
          </span>
          {t("screen.auth.otp.expires")}
        </>
      }
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) onSubmit(code);
        }}
      >
        <OtpInput value={code} onChange={setCode} disabled={submitting} />

        <p role="status" className="m-0 text-sm leading-5 text-[var(--te-ink-muted)]">
          {seconds > 0
            ? t("screen.auth.otp.resendIn", { seconds })
            : t("screen.auth.otp.resendReady")}
        </p>

        {devCodePreview ? (
          <p className="m-0 text-[13px] text-[var(--te-ink-muted)]">
            {t("auth.otp.devCode", { code: devCodePreview })}
          </p>
        ) : null}

        <SubmitBanner view={error} locale={locale} />

        <Button type="submit" disabled={!canSubmit}>
          {submitting ? t("auth.common.submitting") : t("auth.otp.submit")}
        </Button>

        <div className="flex flex-wrap justify-between gap-3">
          <TextButton disabled={seconds > 0 || submitting} onClick={onResend}>
            {t("auth.otp.resend")}
          </TextButton>
          <TextButton onClick={onChangeTarget} disabled={submitting}>
            {changeLabel ?? t("auth.otp.changeIdentifier")}
          </TextButton>
        </div>
      </form>
    </AuthShell>
  );
}
