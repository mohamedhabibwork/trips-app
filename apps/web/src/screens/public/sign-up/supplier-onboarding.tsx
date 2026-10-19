// The supplier sign-up sequence shared by SCR-PUB-04, 05 and 06. A visitor without a session
// registers with the password they chose, confirms the email code and then the phone code
// (SCR-PUB-07, "Step 1 of 2" and "Step 2 of 2"), and only then are the documents uploaded and the
// application submitted. A visitor who is already signed in submits straight away.
import { useNavigate } from "@tanstack/react-router";
import type { AuthErrorView } from "@trips-app/auth";
import { useRef, useState, type ReactNode } from "react";

import { useAuth } from "@/auth/auth-context";
import { toAuthErrorView } from "@/auth/errors";
import { StepLabel } from "@/components/kit/controls";
import { CenteredPanel } from "@/components/kit/layout";
import { useCountdown } from "@/components/kit/use-countdown";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";

import { setApplicantApplicationId, setApplicantRole } from "../../onboarding-state";
import { OtpEntryPanel, maskDestination } from "../../shared/otp-entry-panel";

export type SupplierRole = "organization_owner" | "platform_driver" | "platform_photographer";

export interface SupplierAccountInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

/** Uploads the documents and submits the application; runs once a session exists. */
export type SubmitApplication = () => Promise<{ id: string }>;

interface VerificationState {
  targets: readonly string[];
  step: number;
}

export interface SupplierOnboarding {
  /** True while the email and phone codes are being confirmed; the form stays mounted, hidden. */
  verifying: boolean;
  submitting: boolean;
  /** A failure from registration, upload or submission, already in the user's language. */
  errorMessage: string | null;
  start: (account: SupplierAccountInput, submit: SubmitApplication) => Promise<void>;
  /** The code-entry card to render while `verifying`. */
  panel: ReactNode;
}

/** The email first, then the phone, in the order the server sent the codes. */
export function verificationTargets(
  dispatches: readonly { targetIdentifier: string }[] | undefined,
  account: Pick<SupplierAccountInput, "email" | "phone">,
): string[] {
  const targets = (dispatches ?? []).map((dispatch) => dispatch.targetIdentifier);
  return targets.length > 0 ? targets : [account.email, account.phone];
}

export function useSupplierOnboarding(role: SupplierRole, failedKey: string): SupplierOnboarding {
  const { t, locale, status, signInWithSession } = useAuth();
  const navigate = useNavigate();
  const pendingSubmit = useRef<SubmitApplication | null>(null);
  const [verification, setVerification] = useState<VerificationState | null>(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<AuthErrorView | null>(null);
  const [resendIn, restartResend] = useCountdown();

  const messageOf = (caught: unknown) =>
    caught instanceof Error && caught.message ? caught.message : t(failedKey);

  /** Uploads and submits; a failure returns the visitor to the form with the reason. */
  async function submitApplication() {
    const submit = pendingSubmit.current;
    if (!submit) return;
    try {
      const result = await submit();
      setApplicantApplicationId(result.id);
      setApplicantRole(role);
      await navigate({ to: pathFor("SCR-PUB-17") });
    } catch (caught) {
      setErrorMessage(messageOf(caught));
    }
  }

  async function start(account: SupplierAccountInput, submit: SubmitApplication) {
    if (submitting) return;
    pendingSubmit.current = submit;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      if (status === "authenticated") {
        await submitApplication();
        return;
      }
      const registered = await orpc.auth.registerSupplierAccount.call({
        role,
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        password: account.password,
        preferredLanguage: locale,
        surface: "web",
      });
      setCode("");
      setCodeError(null);
      setVerification({ targets: verificationTargets(registered.otpDispatches, account), step: 0 });
    } catch (caught) {
      setErrorMessage(messageOf(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function verify() {
    const target = verification?.targets[verification.step];
    if (!verification || !target || submitting) return;
    setSubmitting(true);
    setCodeError(null);
    try {
      const result = await orpc.auth.verifyOtp.call({
        targetIdentifier: target,
        purpose: "registration",
        code,
        surface: "web",
      });
      setCode("");
      if (result.session) {
        signInWithSession(result.session);
        setVerification(null);
        await submitApplication();
        return;
      }
      setVerification({ ...verification, step: verification.step + 1 });
      restartResend(0);
    } catch (caught) {
      setCode("");
      setCodeError(toAuthErrorView(caught, { locale, procedure: "auth/verifyOtp" }));
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    const target = verification?.targets[verification.step];
    if (!target) return;
    setCodeError(null);
    try {
      const next = await orpc.auth.resendOtp.call({
        targetIdentifier: target,
        channel: target.includes("@") ? "email" : "sms",
        purpose: "registration",
      });
      restartResend(next.resendAvailableInSeconds ?? 0);
    } catch (caught) {
      setCodeError(toAuthErrorView(caught, { locale, procedure: "auth/resendOtp" }));
    }
  }

  const target = verification?.targets[verification.step] ?? "";
  const panel = verification ? (
    <CenteredPanel width={520}>
      <StepLabel>
        {target.includes("@")
          ? t("screen.public.signUp.verification.stepEmail")
          : t("screen.public.signUp.supplier.stepPhone")}
      </StepLabel>
      <OtpEntryPanel
        destination={maskDestination(target)}
        code={code}
        onCodeChange={setCode}
        onSubmit={() => void verify()}
        onResend={() => void resend()}
        onChangeDestination={() => setVerification(null)}
        resendInSeconds={resendIn}
        submitting={submitting}
        error={codeError}
      />
    </CenteredPanel>
  ) : null;

  return { verifying: verification !== null, submitting, errorMessage, start, panel };
}
