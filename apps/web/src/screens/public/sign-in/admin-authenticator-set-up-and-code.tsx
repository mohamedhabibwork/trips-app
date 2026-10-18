import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeOtpInput } from "@trips-app/ui/components/te-otp-input";
import { TeStepper } from "@trips-app/ui/components/te-stepper";
import { t } from "@trips-app/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { isCodeComplete } from "../../shared/otp-entry-panel";
import { StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";

const SETUP_STEPS = () =>
  [
    {
      id: "set-up",
      label: t("screen.public.signIn.adminAuthenticatorSetUpAndCode.setUpAuthenticator"),
    },
    { id: "code", label: t("screen.public.signIn.adminAuthenticatorSetUpAndCode.enterCode") },
  ] as const;

function AuthenticatorForm() {
  const queryClient = useQueryClient();
  const enrollMutation = useMutation(
    orpc.auth.adminEnrollTotp.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );
  const verifyMutation = useMutation(
    orpc.auth.adminVerifyTotp.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !isCodeComplete(code)) return;
    setSubmitting(true);
    try {
      const enrollmentToken =
        typeof sessionStorage !== "undefined"
          ? sessionStorage.getItem("te:adminEnrollmentToken")
          : null;
      const challengeToken =
        typeof sessionStorage !== "undefined"
          ? sessionStorage.getItem("te:adminChallengeToken")
          : null;
      if (enrollmentToken) {
        await enrollMutation.mutateAsync({
          enrollmentToken,
          totpCode: code,
        });
      } else {
        await verifyMutation.mutateAsync({
          challengeToken: challengeToken ?? "admin-challenge-token",
          totpCode: code,
        });
      }
    } catch {
      // Handled via StatePreview or caller
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(e) => void handleSubmit(e)}>
      <TeStepper
        steps={SETUP_STEPS()}
        currentId="set-up"
        completedIds={[]}
        ariaLabel={t("screen.public.signIn.adminAuthenticatorSetUpAndCode.setUpSteps")}
      />
      <TeInlineAlert
        tone="info"
        title={t("screen.public.signIn.adminAuthenticatorSetUpAndCode.setUpRequired")}
      >
        {t("screen.public.signIn.adminAuthenticatorSetUpAndCode.theAdminConsoleDoesNot")}
      </TeInlineAlert>
      <div className="flex items-start gap-3">
        <TeIcon name="lock" />
        <p className="te-body">
          {t("screen.public.signIn.adminAuthenticatorSetUpAndCode.scanTheQrCodeShown")}
        </p>
      </div>
      <TeOtpInput
        label={t("screen.public.signIn.adminAuthenticatorSetUpAndCode.authenticatorCode")}
        value={code}
        onValueChange={setCode}
      />
      <div>
        <TeButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={!isCodeComplete(code) || submitting}
        >
          {t("screen.public.signIn.adminAuthenticatorSetUpAndCode.verify")}
        </TeButton>
      </div>
      <p className="te-body">
        {t("screen.public.signIn.adminAuthenticatorSetUpAndCode.afterVerificationTheAdminConsole")}{" "}
        <Link to="/admin" className="te-link">
          {t("screen.public.signIn.adminAuthenticatorSetUpAndCode.adminHome")}
        </Link>
      </p>
    </form>
  );
}

/** Second factor for admins. Set-up is required once; later sign-ins need the code only. */
export function AdminAuthenticatorSetUpAndCode() {
  return (
    <AuthFrame
      title={t("screen.public.signIn.adminAuthenticatorSetUpAndCode.adminAuthenticatorSetUpAnd")}
      description={t("screen.public.signIn.adminAuthenticatorSetUpAndCode.adminSignInNeedsAn")}
    >
      <StatePreview
        main={<AuthenticatorForm />}
        error={
          <TeInlineAlert
            tone="error"
            title={t("screen.public.signIn.adminAuthenticatorSetUpAndCode.wrongCode")}
          >
            {t("screen.public.signIn.adminAuthenticatorSetUpAndCode.tryAgainFiveFailuresLock")}
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
