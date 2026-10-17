// /business/sign-in — organization owner or employee: password then a second factor (WF-ID-05).
//
// Correction 7: `staff_2fa_setup_required` (first sign-in) has no P0 screen. It is mapped to a clear
// message plus a support hint; the setup screen itself is P1.
import { Link, useNavigate } from "@tanstack/react-router";
import { AUTH_ERROR_VIEWS } from "@trips-app/auth";
import type { AuthErrorView, SessionTokenPayload } from "@trips-app/auth";
import { Button } from "@trips-app/ui/components/button";
import { useState } from "react";

import { client } from "../../utils/orpc";
import { useAuth } from "../auth-context";
import { AuthField, AuthLinkRow, AuthShell } from "../components/auth-shell";
import { OtpInput } from "../components/otp-input";
import { SubmitBanner } from "../components/submit-banner";
import { toAuthErrorView } from "../errors";

interface StaffSignInResult {
  step: "staff_2fa_verification_required" | "staff_2fa_setup_required" | "authenticated";
  challengeToken?: string;
  session?: SessionTokenPayload;
}

type Step = { kind: "password" } | { kind: "secondFactor"; challengeToken: string };

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

      // TODO(P1): replace this dead end with the 2FA setup screen
      // (`auth/staffSetupSecondFactor`, QR + SMS dispatch). P0 has no enrollment UI (D4 scope);
      // the mapped message already tells the user to contact their organization administrator.
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
        title={t("auth.staff.secondFactorTitle")}
        subtitle={t("auth.staff.secondFactorSubtitle")}
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (code.length === 6) void submitSecondFactor(step.challengeToken, code);
          }}
        >
          <OtpInput value={code} onChange={setCode} disabled={submitting} />
          <SubmitBanner view={error} locale={locale} />
          <Button type="submit" disabled={submitting || code.length !== 6}>
            {submitting ? t("auth.common.submitting") : t("auth.staff.secondFactorSubmit")}
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t("auth.staff.title")}
      subtitle={t("auth.staff.subtitle")}
      footer={
        <AuthLinkRow>
          <Link to="/sign-in" className="underline underline-offset-4">
            {t("auth.signIn.title")}
          </Link>
        </AuthLinkRow>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submitPassword();
        }}
      >
        <AuthField
          id="staffEmail"
          type="email"
          label={t("auth.staff.email")}
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
      </form>
    </AuthShell>
  );
}
