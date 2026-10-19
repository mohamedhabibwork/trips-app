// The phone code-entry step from SCR-SHR-14: six boxes, a live resend countdown, and links to change
// the destination or resend. The caller owns the code, the submit and the resend.
import type { AuthErrorView } from "@trips-app/auth";
import type { FormEvent } from "react";

import { useAuth } from "@/auth/auth-context";
import { OtpInput } from "@/auth/components/otp-input";
import { SubmitBanner } from "@/auth/components/submit-banner";
import { Button, TextButton } from "@/components/kit/controls";

export const OTP_CODE_LENGTH = 6;

/** A code is complete when every box holds a digit. */
export function isCodeComplete(code: string): boolean {
  return code.length === OTP_CODE_LENGTH;
}

/** "a***@example.com" or "+20***00": enough to recognise, not enough to read. */
export function maskDestination(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "***";
  if (trimmed.includes("@")) {
    const [local = "", domain = ""] = trimmed.split("@");
    return `${local.slice(0, 1)}***@${domain}`;
  }
  return `${trimmed.slice(0, 3)}***${trimmed.slice(-2)}`;
}

interface OtpEntryPanelProps {
  /** Destination, already masked. */
  destination: string;
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  onResend: () => void;
  onChangeDestination: () => void;
  /** Seconds until a new code can be requested; 0 means now. */
  resendInSeconds: number;
  submitting?: boolean;
  error?: AuthErrorView | null;
}

export function OtpEntryPanel({
  destination,
  code,
  onCodeChange,
  onSubmit,
  onResend,
  onChangeDestination,
  resendInSeconds,
  submitting = false,
  error = null,
}: OtpEntryPanelProps) {
  const { t, locale } = useAuth();
  const isEmail = destination.includes("@");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isCodeComplete(code) && !submitting) onSubmit();
  }

  return (
    <form className="flex flex-1 flex-col gap-4" onSubmit={handleSubmit}>
      <h1 className="m-0 text-2xl leading-8 font-bold">{t("screen.auth.otp.title")}</h1>
      <p className="m-0 text-[15px] leading-[22px] text-[var(--te-ink-muted)]">
        {t("screen.auth.otp.sentTo")}{" "}
        <span dir="ltr" className="font-semibold text-[var(--te-ink)]">
          {destination}
        </span>
        {t("screen.shared.otpEntry.expires")}
      </p>
      <OtpInput value={code} onChange={onCodeChange} disabled={submitting} />
      <p role="status" className="m-0 text-sm leading-5 text-[var(--te-ink-muted)]">
        {resendInSeconds > 0
          ? t("screen.shared.otpEntry.waiting", { seconds: resendInSeconds })
          : t("screen.auth.otp.resendReady")}
      </p>
      <SubmitBanner view={error} locale={locale} />
      <Button type="submit" className="mt-2" disabled={!isCodeComplete(code) || submitting}>
        {submitting ? t("auth.common.submitting") : t("auth.otp.submit")}
      </Button>
      <div className="mt-auto flex flex-wrap justify-between gap-3 pt-6">
        <TextButton onClick={onChangeDestination} disabled={submitting}>
          {isEmail
            ? t("screen.auth.signUp.changeEmail")
            : t("screen.public.signUp.verification.changeNumber")}
        </TextButton>
        <TextButton onClick={onResend} disabled={resendInSeconds > 0 || submitting}>
          {t("auth.otp.resend")}
        </TextButton>
      </div>
    </form>
  );
}
