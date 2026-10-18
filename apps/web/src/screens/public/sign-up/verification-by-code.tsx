import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { t } from "@trips-app/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { isCodeComplete, OtpEntryPanel } from "../../shared/otp-entry-panel";
import { ScreenLink } from "../../shared/screen-link";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";

function maskTarget(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "***";
  if (trimmed.includes("@")) {
    const [local = "", domain = ""] = trimmed.split("@");
    return `${local.slice(0, 1)}***@${domain}`;
  }
  return `${trimmed.slice(0, 3)}***${trimmed.slice(-2)}`;
}

function VerificationForm() {
  const queryClient = useQueryClient();
  const verifyMutation = useMutation(
    orpc.auth.verifyOtp.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );
  const [code, setCode] = useState("");
  const [target, setTarget] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof sessionStorage !== "undefined") {
      const saved = sessionStorage.getItem("te:lastOtpTarget");
      if (saved) setTarget(saved);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !isCodeComplete(code)) return;
    setSubmitting(true);
    try {
      await verifyMutation.mutateAsync({
        targetIdentifier: target || "pending-verification",
        purpose: "registration",
        code,
        surface: "web",
      });
    } catch {
      // Handled via StatePreview or caller
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(e) => void handleSubmit(e)}>
      <OtpEntryPanel destination={maskTarget(target)} code={code} onCodeChange={setCode} />
      <div>
        <TeButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={!isCodeComplete(code) || submitting}
        >
          {t("screen.public.signUp.verificationByCode.verify")}
        </TeButton>
      </div>
      <section className="flex flex-col gap-2" aria-labelledby="after-verify-heading">
        <h2 id="after-verify-heading" className="te-h3">
          {t("screen.public.signUp.verificationByCode.afterVerification")}
        </h2>
        <ul className="flex flex-wrap gap-4">
          <li>
            <Link to={AUTH_ROUTES.signIn} className="te-link">
              {t("screen.public.signUp.verificationByCode.signIn")}
            </Link>
          </li>
          <li>
            <ScreenLink surface="public" slug="application-status-and-changes-response">
              {t("screen.public.signUp.verificationByCode.applicationStatus")}
            </ScreenLink>
          </li>
        </ul>
      </section>
    </form>
  );
}

/** Confirms the email or phone before the account can act. The destination is partly masked. */
export function VerificationByCode() {
  return (
    <AuthFrame
      title={t("screen.public.signUp.verificationByCode.verificationByCode")}
      description={t("screen.public.signUp.verificationByCode.confirmYourEmailOrPhone")}
    >
      <StatePreview
        main={<VerificationForm />}
        loading={<StateLoading lines={2} />}
        error={
          <TeInlineAlert
            tone="error"
            title={t("screen.public.signUp.verificationByCode.wrongCode")}
          >
            {t("screen.public.signUp.verificationByCode.thatCodeDoesNotMatch")}
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
