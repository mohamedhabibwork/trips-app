// /business/sign-in (SCR-PUB-11) — organization owner or employee: password then a second factor (WF-ID-05).
//
// `staff_2fa_setup_required` (first sign-in) continues on the code set-up page (SCR-PUB-12).
import { useNavigate } from "@tanstack/react-router";
import { AUTH_ERROR_VIEWS } from "@trips-app/auth";
import type { AuthErrorView, SessionTokenPayload } from "@trips-app/auth";
import { useState } from "react";

import { Button, Notice, TextButton, TextLink } from "@/components/kit/controls";
import { pathFor } from "@/navigation/web-routes";

import { client } from "../../utils/orpc";
import { useAuth } from "../auth-context";
import { AuthField, AuthShell } from "../components/auth-shell";
import { SubmitBanner } from "../components/submit-banner";
import { toAuthErrorView } from "../errors";

interface StaffSignInResult {
  step: "staff_2fa_verification_required" | "staff_2fa_setup_required" | "authenticated";
  challengeToken?: string;
  session?: SessionTokenPayload;
}

type Step = { kind: "password" } | { kind: "secondFactor"; challengeToken: string };

/** Read by the staff code set-up page (SCR-PUB-12). */
const STAFF_CHALLENGE_KEY = "te:staffChallengeToken";

export function StaffSignInScreen() {
  const { t, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>({ kind: "password" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorView | null>(null);

  const submitPassword = async (): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      const result = (await client.auth.staffSignIn({
        email: email.trim(),
        password,
      })) as unknown as StaffSignInResult;

      if (result.step === "staff_2fa_verification_required" && result.challengeToken) {
        setStep({ kind: "secondFactor", challengeToken: result.challengeToken });
        return;
      }
      if (result.step === "authenticated" && result.session) {
        signInWithSession(result.session);
        await navigate({ to: "/business" });
        return;
      }

      // First staff sign-in: the second factor is set on SCR-PUB-12, which reads the challenge token
      // from session storage. Without a token the mapped message tells the user to contact their
      // organization administrator.
      if (result.step === "staff_2fa_setup_required" && result.challengeToken) {
        sessionStorage.setItem(STAFF_CHALLENGE_KEY, result.challengeToken);
        await navigate({ to: pathFor("SCR-PUB-12") });
        return;
      }
      setError(AUTH_ERROR_VIEWS.staffTwoFactorSetupRequired ?? null);
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: "auth/staffSignIn" }));
    } finally {
      setSubmitting(false);
    }
  };

  const submitSecondFactor = async (challengeToken: string, value: string): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      const result = (await client.auth.staffVerifySecondFactor({
        challengeToken,
        code: value,
      })) as unknown as StaffSignInResult;

      if (result.session) {
        signInWithSession(result.session);
        await navigate({ to: "/business" });
        return;
      }
      setError(
        toAuthErrorView(new Error("Unexpected second-factor result."), {
          locale,
          procedure: "auth/staffVerifySecondFactor",
        }),
      );
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: "auth/staffVerifySecondFactor" }));
    } finally {
      setSubmitting(false);
    }
  };

  if (step.kind === "secondFactor") {
    return (
      <AuthShell
        layout="phone"
        title={t("auth.staff.title")}
        subtitle={t("screen.auth.staff.codeLead")}
        footer={
          <TextButton
            onClick={() => {
              setStep({ kind: "password" });
              setCode("");
              setError(null);
            }}
            disabled={submitting}
          >
            {t("screen.auth.staff.differentMethod")}
          </TextButton>
        }
      >
        <div className="flex flex-col gap-1 rounded-[var(--te-radius-md)] border border-[var(--te-hairline)] bg-[var(--te-surface-raised)] px-3.5 py-3 text-sm">
          <span dir="ltr" className="self-start font-semibold">
            {email.trim()}
          </span>
          <span className="text-[var(--te-ink-muted)]">{t("screen.auth.staff.passwordDone")}</span>
        </div>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (code.length === 6) void submitSecondFactor(step.challengeToken, code);
          }}
        >
          <AuthField
            id="staffCode"
            label={t("screen.auth.staff.code")}
            placeholder={t("screen.auth.code.placeholder")}
            value={code}
            onChange={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            code
            required
            disabled={submitting}
          />
          <Notice tone="info">{t("screen.auth.staff.orgChoice")}</Notice>
          <SubmitBanner view={error} locale={locale} />
          <Button type="submit" disabled={submitting || code.length !== 6}>
            {submitting ? t("auth.common.submitting") : t("screen.auth.signIn.submit")}
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell layout="phone" title={t("auth.staff.title")} subtitle={t("auth.staff.subtitle")}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submitPassword();
        }}
      >
        <AuthField
          id="staffEmail"
          type="email"
          label={t("auth.staff.email")}
          placeholder={t("screen.auth.signUp.emailPlaceholder")}
          value={email}
          onChange={setEmail}
          autoComplete="username"
          inputMode="email"
          required
          disabled={submitting}
        />
        <AuthField
          id="staffPassword"
          type="password"
          label={t("auth.staff.password")}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          required
          disabled={submitting}
        />
        <SubmitBanner view={error} locale={locale} />
        <Button
          type="submit"
          disabled={submitting || email.trim().length === 0 || password.length === 0}
        >
          {submitting ? t("auth.common.submitting") : t("auth.staff.submit")}
        </Button>
        <TextLink to={pathFor("SCR-PUB-13")} tone="ink" className="self-center">
          {t("auth.signIn.forgotPassword")}
        </TextLink>
      </form>
    </AuthShell>
  );
}
