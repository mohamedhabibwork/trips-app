// /sign-in — traveler, parent, driver and photographer (AC-2, P0-2).
//
// One identifier field plus an OTP/password selector. The OTP branch is a local step machine:
// `auth/signIn` (method otp) → `auth/signIn` (method otp + otpCode), exactly as AC-2 describes.
import { useNavigate } from "@tanstack/react-router";
import type { AuthErrorView, SessionTokenPayload } from "@trips-app/auth";
import { sanitizeReturnTo } from "@trips-app/auth";
import { useState } from "react";

import { Button, Segmented, TextLink } from "@/components/kit/controls";
import { pathFor } from "@/navigation/web-routes";
import { trackEvent } from "@/utils/analytics";

import { client } from "../../utils/orpc";
import { useAuth } from "../auth-context";
import { AuthField, AuthLinkRow, AuthShell } from "../components/auth-shell";
import { SubmitBanner } from "../components/submit-banner";
import { toAuthErrorView } from "../errors";
import { homeRouteForRole } from "../home-route";
import { OtpScreen } from "./otp-screen";
import { PendingApprovalScreen } from "./pending-approval-screen";

const PROCEDURE = "auth/signIn";

/** The subset of the `auth/signIn` union this screen branches on. */
interface OtpDispatchView {
  channel: string;
  targetIdentifier: string;
  resendAvailableInSeconds: number;
  devCodePreview?: string;
}

interface SignInResult {
  step: "otp_required" | "authenticated" | "application_pending_approval";
  otpDispatch?: OtpDispatchView;
  session?: SessionTokenPayload;
}

type Step =
  | { kind: "credentials" }
  | { kind: "otp"; dispatch: OtpDispatchView }
  | { kind: "pending"; contact: string };

export function SignInScreen({ returnTo }: { returnTo?: string }) {
  const { t, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>({ kind: "credentials" });
  const [identifier, setIdentifier] = useState("");
  const [method, setMethod] = useState<"otp" | "password">("otp");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorView | null>(null);

  const goHome = async (session: SessionTokenPayload): Promise<void> => {
    signInWithSession(session);
    await navigate({
      to: sanitizeReturnTo(returnTo, homeRouteForRole(session.activeRole)),
    });
  };

  const submitCredentials = async (): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      const result = (await client.auth.signIn({
        identifier: identifier.trim(),
        method,
        ...(method === "password" ? { password } : {}),
        surface: "web",
      })) as unknown as SignInResult;

      if (result.step === "authenticated" && result.session) {
        trackEvent("sign_in", { method });
        await goHome(result.session);
        return;
      }
      if (result.step === "authenticated" && result.session) {
        await goHome(result.session);
        return;
      }
      if (result.session) {
        signInWithSession(result.session);
      }
      setStep({ kind: "pending", contact: identifier.trim() });
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: PROCEDURE }));
    } finally {
      setSubmitting(false);
    }
  };

  const submitOtp = async (code: string): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      const result = (await client.auth.signIn({
        identifier: identifier.trim(),
        method: "otp",
        otpCode: code,
        surface: "web",
      })) as unknown as SignInResult;

      if (result.step === "authenticated" && result.session) {
        trackEvent("sign_in", { method: "otp" });
        await goHome(result.session);
        return;
      }
      if (result.step === "application_pending_approval") {
        if (result.session) {
          signInWithSession(result.session);
        }
        setStep({ kind: "pending", contact: identifier.trim() });
        return;
      }
      setError(
        toAuthErrorView(new Error("Unexpected sign-in result."), {
          locale,
          procedure: PROCEDURE,
        }),
      );
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: PROCEDURE }));
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async (dispatch: OtpDispatchView): Promise<void> => {
    try {
      const next = (await client.auth.resendOtp({
        targetIdentifier: dispatch.targetIdentifier,
        channel: dispatch.channel === "email" ? "email" : "sms",
        purpose: "sign_in",
      })) as unknown as OtpDispatchView;
      setError(null);
      setStep({ kind: "otp", dispatch: { ...dispatch, ...next } });
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: "auth/resendOtp" }));
    }
  };

  if (step.kind === "otp") {
    return (
      <OtpScreen
        target={step.dispatch.targetIdentifier}
        resendAvailableInSeconds={step.dispatch.resendAvailableInSeconds}
        devCodePreview={step.dispatch.devCodePreview}
        submitting={submitting}
        error={error}
        onSubmit={(code) => void submitOtp(code)}
        onResend={() => void resend(step.dispatch)}
        onChangeTarget={() => {
          setStep({ kind: "credentials" });
          setError(null);
        }}
      />
    );
  }

  if (step.kind === "pending") {
    return <PendingApprovalScreen contact={step.contact} />;
  }

  // M2: field issues go under their input; everything else goes to the single banner. The banner is
  // only suppressed when *every* issue can be rendered on this form.
  const renderedFields = new Set(["identifier", "password"]);
  const fieldIssues = error?.fieldErrors ?? [];
  const allRendered =
    fieldIssues.length > 0 && fieldIssues.every((issue) => renderedFields.has(issue.field));
  const bannerView = allRendered ? null : error;
  const issuesFor = (field: string): string[] =>
    fieldIssues
      .filter((issue) => issue.field === field)
      .map((issue) => issue.message || issue.field);

  return (
    <AuthShell
      layout="phone"
      title={t("auth.signIn.title")}
      subtitle={t("screen.auth.signIn.lead")}
      footer={
        <>
          <TextLink to={pathFor("SCR-PUB-13")} tone="ink">
            {t("auth.signIn.forgotPassword")}
          </TextLink>
          <AuthLinkRow>
            <span>{t("auth.signIn.noAccount")}</span>
            <TextLink to={pathFor("SCR-PUB-02")}>{t("auth.signIn.createAccount")}</TextLink>
          </AuthLinkRow>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submitCredentials();
        }}
      >
        <AuthField
          id="identifier"
          label={t("auth.signIn.identifierLabel")}
          placeholder={t("screen.auth.signIn.identifierPlaceholder")}
          value={identifier}
          onChange={setIdentifier}
          autoComplete="username"
          inputMode="email"
          required
          disabled={submitting}
          issues={issuesFor("identifier")}
        />

        <Segmented
          label={t("auth.signIn.methodLabel")}
          value={method}
          onChange={setMethod}
          disabled={submitting}
          options={[
            { value: "otp", label: t("screen.auth.signIn.methodOtp") },
            { value: "password", label: t("auth.signIn.methodPassword") },
          ]}
        />

        {method === "password" ? (
          <AuthField
            id="password"
            type="password"
            label={t("auth.signIn.passwordLabel")}
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
            disabled={submitting}
            issues={issuesFor("password")}
          />
        ) : null}

        <SubmitBanner view={bannerView} locale={locale} />

        <Button type="submit" disabled={submitting || identifier.trim().length === 0}>
          {submitting ? t("auth.common.submitting") : t("screen.auth.signIn.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}
