// SCR-PUB-13 Password reset (`/reset-password`): step 1 sends and takes the code, step 2 sets the
// new password. The server checks the code together with the new password.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { AuthErrorView } from "@trips-app/auth";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { cn } from "@trips-app/ui/lib/utils";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/auth/auth-context";
import { OtpInput } from "@/auth/components/otp-input";
import { SubmitBanner } from "@/auth/components/submit-banner";
import { toAuthErrorView } from "@/auth/errors";
import { Button, StepLabel, TextButton, TextField, buttonClass } from "@/components/kit/controls";
import { CenteredPanel, Lead, PanelHeading } from "@/components/kit/layout";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";

const MIN_PASSWORD_LENGTH = 12;
const CODE_LENGTH = 6;

type Step = "identify" | "code" | "password" | "done";

function maskIdentifier(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "***";
  if (trimmed.includes("@")) {
    const [local = "", domain = ""] = trimmed.split("@");
    return `${local.slice(0, 1)}***@${domain}`;
  }
  return `${trimmed.slice(0, 3)}***${trimmed.slice(-2)}`;
}

function Rule({ met, children }: { met: boolean; children: string }) {
  return (
    <li className={cn("flex items-center gap-1.5", met && "text-[var(--te-success)]")}>
      <TeIcon name={met ? "check" : "info"} className="size-4" />
      {children}
    </li>
  );
}

/** Password reset through a verified email or phone. */
export function PasswordReset() {
  const { t, locale } = useAuth();
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
  const requestResetMutation = useMutation(
    orpc.auth.requestPasswordReset.mutationOptions({ onSuccess }),
  );
  const confirmResetMutation = useMutation(
    orpc.auth.confirmPasswordReset.mutationOptions({ onSuccess }),
  );
  const [step, setStep] = useState<Step>("identify");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<AuthErrorView | null>(null);
  const submitting = requestResetMutation.isPending || confirmResetMutation.isPending;
  const longEnough = password.length >= MIN_PASSWORD_LENGTH;
  const matches = confirmation.length > 0 && confirmation === password;

  async function sendCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (submitting || identifier.trim().length === 0) return;
    setError(null);
    try {
      await requestResetMutation.mutateAsync({ identifier: identifier.trim() });
      setCode("");
      setStep("code");
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: "auth/requestPasswordReset" }));
    }
  }

  async function setNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !longEnough || !matches) return;
    setError(null);
    try {
      await confirmResetMutation.mutateAsync({
        identifier: identifier.trim(),
        otpCode: code,
        newPassword: password,
      });
      setStep("done");
    } catch (caught) {
      const view = toAuthErrorView(caught, { locale, procedure: "auth/confirmPasswordReset" });
      setError(view);
      // A wrong or expired code sends the user back to the code step.
      if (view.recovery === "clearCode" || view.key.includes("otp")) {
        setCode("");
        setStep("code");
      }
    }
  }

  if (step === "done") {
    return (
      <CenteredPanel width={520} role="region">
        <PanelHeading>{t("screen.public.passwordReset.doneTitle")}</PanelHeading>
        <Lead>{t("screen.public.passwordReset.doneLead")}</Lead>
        <Link to={pathFor("SCR-PUB-08")} className={buttonClass("primary")}>
          {t("screen.auth.signIn.submit")}
        </Link>
      </CenteredPanel>
    );
  }

  if (step === "password") {
    return (
      <CenteredPanel width={520}>
        <StepLabel>{t("screen.public.passwordReset.step2")}</StepLabel>
        <PanelHeading>{t("screen.public.passwordReset.passwordTitle")}</PanelHeading>
        <Lead size="sm">{t("screen.public.passwordReset.passwordLead")}</Lead>
        <form className="flex flex-col gap-[18px]" onSubmit={(event) => void setNewPassword(event)}>
          <TextField
            name="newPassword"
            type="password"
            label={t("screen.public.passwordReset.newPassword")}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
            required
          />
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px] leading-[18px] text-[var(--te-ink-muted)]">
            <Rule met={longEnough}>
              {t("screen.public.passwordReset.ruleLength", { min: MIN_PASSWORD_LENGTH })}
            </Rule>
            <Rule met={false}>{t("screen.public.passwordReset.ruleBreached")}</Rule>
          </ul>
          <TextField
            name="confirmPassword"
            type="password"
            label={t("screen.public.passwordReset.confirmPassword")}
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            errors={
              confirmation.length > 0 && !matches ? [t("screen.public.passwordReset.mismatch")] : []
            }
            disabled={submitting}
            required
          />
          <SubmitBanner view={error} locale={locale} />
          <Button type="submit" disabled={!longEnough || !matches || submitting}>
            {submitting
              ? t("auth.common.submitting")
              : t("screen.public.passwordReset.setPassword")}
          </Button>
        </form>
      </CenteredPanel>
    );
  }

  if (step === "code") {
    return (
      <CenteredPanel width={520}>
        <StepLabel>{t("screen.public.passwordReset.step1")}</StepLabel>
        <PanelHeading>{t("screen.auth.otp.title")}</PanelHeading>
        <Lead>
          {t("screen.auth.otp.sentTo")}{" "}
          <span dir="ltr" className="font-semibold text-[var(--te-ink)]">
            {maskIdentifier(identifier)}
          </span>
          {t("screen.auth.otp.expires")}
        </Lead>
        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (code.length === CODE_LENGTH) setStep("password");
          }}
        >
          <OtpInput value={code} onChange={setCode} disabled={submitting} />
          <SubmitBanner view={error} locale={locale} />
          <Button type="submit" disabled={code.length !== CODE_LENGTH || submitting}>
            {t("auth.otp.submit")}
          </Button>
          <div className="flex flex-wrap justify-between gap-3">
            <TextButton onClick={() => void sendCode()} disabled={submitting}>
              {t("auth.otp.resend")}
            </TextButton>
            <TextButton
              onClick={() => {
                setStep("identify");
                setError(null);
              }}
              disabled={submitting}
            >
              {t("auth.otp.changeIdentifier")}
            </TextButton>
          </div>
        </form>
      </CenteredPanel>
    );
  }

  return (
    <CenteredPanel width={520}>
      <StepLabel>{t("screen.public.passwordReset.step1")}</StepLabel>
      <PanelHeading>{t("screen.public.passwordReset.title")}</PanelHeading>
      <Lead size="sm">{t("screen.public.passwordReset.lead")}</Lead>
      <form className="flex flex-col gap-[18px]" onSubmit={(event) => void sendCode(event)}>
        <TextField
          name="identifier"
          label={t("auth.signIn.identifierLabel")}
          placeholder={t("screen.auth.signIn.identifierPlaceholder")}
          autoComplete="username"
          dir="ltr"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          disabled={submitting}
          required
        />
        <SubmitBanner view={error} locale={locale} />
        <Button type="submit" disabled={identifier.trim().length === 0 || submitting}>
          {submitting ? t("auth.common.submitting") : t("screen.public.passwordReset.sendCode")}
        </Button>
        <span className="text-sm text-[var(--te-ink-muted)]">
          {t("screen.public.passwordReset.remembered")}{" "}
          <Link
            to={pathFor("SCR-PUB-08")}
            className="font-semibold text-[var(--te-primary-text)] underline underline-offset-4"
          >
            {t("screen.public.passwordReset.backToSignIn")}
          </Link>
        </span>
      </form>
    </CenteredPanel>
  );
}
