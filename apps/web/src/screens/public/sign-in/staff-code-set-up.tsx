import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { t } from "@trips-app/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { isCodeComplete } from "../../shared/otp-entry-panel";
import { StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";
import { StaffCodePanel } from "../common/staff-code-panel";

function StaffCodeSetupForm() {
  const queryClient = useQueryClient();
  const setupMutation = useMutation(
    orpc.auth.staffSetupSecondFactor.mutationOptions({
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
      const challengeToken =
        (typeof sessionStorage !== "undefined"
          ? sessionStorage.getItem("te:staffChallengeToken")
          : null) ?? "staff-challenge-token";
      await setupMutation.mutateAsync({
        challengeToken,
        method: "totp",
        verificationCode: code,
      });
    } catch {
      // Handled via StatePreview or caller
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(e) => void handleSubmit(e)}>
      <StaffCodePanel code={code} onCodeChange={setCode} />
      <div>
        <TeButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={!isCodeComplete(code) || submitting}
        >
          {t("screen.public.signIn.staffCodeSetUp.confirm")}
        </TeButton>
      </div>
      <p className="te-body">
        {t("screen.public.signIn.staffCodeSetUp.afterConfirmationTheWorkspaceOpens")}{" "}
        <Link to="/business" className="te-link">
          {t("screen.public.signIn.staffCodeSetUp.openTheWorkspace")}
        </Link>
      </p>
    </form>
  );
}

/** First sign-in for staff. The second factor must be set before the workspace opens. */
export function StaffCodeSetUp() {
  return (
    <AuthFrame
      title={t("screen.public.signIn.staffCodeSetUp.staffCodeSetUpFirst")}
      description={t("screen.public.signIn.staffCodeSetUp.chooseSmsOrAnAuthenticator")}
    >
      <StatePreview
        main={<StaffCodeSetupForm />}
        error={
          <TeInlineAlert tone="error" title={t("screen.public.signIn.staffCodeSetUp.codeExpired")}>
            {t("screen.public.signIn.staffCodeSetUp.theCodeIsWrongOr")}
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
