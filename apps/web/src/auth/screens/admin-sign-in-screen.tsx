// /admin/sign-in — password then mandatory TOTP (AC-2, WF-ID-04).
//
// No token is stored after step 1: `adminSignIn` returns a challenge token, and only
// `adminVerifyTotp` issues a session.
import { Link, useNavigate } from "@tanstack/react-router";
import type { AuthErrorView, SessionTokenPayload } from "@trips-app/auth";
import { Button } from "@trips-app/ui/components/button";
import { useState } from "react";

import { client } from "../../utils/orpc";
import { useAuth } from "../auth-context";
import { AuthField, AuthLinkRow, AuthShell } from "../components/auth-shell";
import { OtpInput } from "../components/otp-input";
import { SubmitBanner } from "../components/submit-banner";
import { toAuthErrorView } from "../errors";

interface AdminSignInResult {
  step: "totp_verification_required" | "totp_enrollment_required" | "authenticated";
  challengeToken?: string;
  session?: SessionTokenPayload;
}

type Step = { kind: "password" } | { kind: "totp"; challengeToken: string };

/** D4 / O3: enrollment is P2. The seed enrols every demo admin, so this is a dead end by design. */
const ENROLLMENT_VIEW: AuthErrorView = {
  key: "auth.admin.enrollmentRequired",
  params: {},
  recovery: "noRetry",
};

export function AdminSignInScreen() {
  const { t, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>({ kind: "password" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorView | null>(null);

  const submitPassword = async (): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      const result = (await client.auth.adminSignIn({
        email: email.trim(),
        password,
      })) as unknown as AdminSignInResult;

      if (result.step === "totp_verification_required" && result.challengeToken) {
        setStep({ kind: "totp", challengeToken: result.challengeToken });
        return;
      }
      if (result.step === "authenticated" && result.session) {
        signInWithSession(result.session);
        await navigate({ to: "/admin" });
        return;
      }
      setError(ENROLLMENT_VIEW);
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: "auth/adminSignIn" }));
    } finally {
      setSubmitting(false);
    }
  };

  const submitTotp = async (challengeToken: string, code: string): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      const result = (await client.auth.adminVerifyTotp({
        challengeToken,
        totpCode: code,
      })) as unknown as AdminSignInResult;

      if (result.session) {
        signInWithSession(result.session);
        await navigate({ to: "/admin" });
        return;
      }
      setError(
        toAuthErrorView(new Error("Unexpected TOTP result."), {
          locale,
          procedure: "auth/adminVerifyTotp",
        }),
      );
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: "auth/adminVerifyTotp" }));
    } finally {
      setSubmitting(false);
    }
  };

  if (step.kind === "totp") {
    return (
      <AuthShell title={t("auth.admin.totpTitle")} subtitle={t("auth.admin.totpSubtitle")}>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (totpCode.length === 6) void submitTotp(step.challengeToken, totpCode);
          }}
        >
          <OtpInput value={totpCode} onChange={setTotpCode} disabled={submitting} />
          <SubmitBanner view={error} locale={locale} />
          <Button type="submit" disabled={submitting || totpCode.length !== 6}>
            {submitting ? t("auth.common.submitting") : t("auth.admin.totpSubmit")}
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t("auth.admin.title")}
      subtitle={t("auth.admin.subtitle")}
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
          id="adminEmail"
          type="email"
          label={t("auth.admin.email")}
          value={email}
          onChange={setEmail}
          autoComplete="username"
          inputMode="email"
          required
          disabled={submitting}
        />
        <AuthField
          id="adminPassword"
          type="password"
          label={t("auth.admin.password")}
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
          {submitting ? t("auth.common.submitting") : t("auth.admin.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}
