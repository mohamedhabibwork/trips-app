import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { t } from "@trips-app/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { isCodeComplete, OtpEntryPanel } from "../../shared/otp-entry-panel";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";
import { useFormReady } from "../common/use-form-ready";

const MIN_PASSWORD_LENGTH = 12;

function maskIdentifier(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "***";
  if (trimmed.includes("@")) {
    const [local = "", domain = ""] = trimmed.split("@");
    return `${local.slice(0, 1)}***@${domain}`;
  }
  return `${trimmed.slice(0, 3)}***${trimmed.slice(-2)}`;
}

function PasswordResetForm() {
  const queryClient = useQueryClient();
  const requestResetMutation = useMutation(
    orpc.auth.requestPasswordReset.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );
  const confirmResetMutation = useMutation(
    orpc.auth.confirmPasswordReset.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { submitDisabled, formProps } = useFormReady();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !isCodeComplete(code)) return;
    const formData = new FormData(event.currentTarget);
    const idValue = identifier.trim() || String(formData.get("identifier") ?? "").trim();
    const newPassword = String(formData.get("newPassword") ?? "");
    if (!idValue || !newPassword) return;
    setSubmitting(true);
    try {
      await requestResetMutation.mutateAsync({ identifier: idValue });
      await confirmResetMutation.mutateAsync({
        identifier: idValue,
        otpCode: code,
        newPassword,
      });
    } catch {
      // Handled via StatePreview or caller
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(e) => void handleSubmit(e)} {...formProps}>
      <TeInput
        label={t("screen.public.accountRecovery.passwordReset.emailOrPhone")}
        name="identifier"
        autoComplete="username"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        required
      />
      <OtpEntryPanel destination={maskIdentifier(identifier)} code={code} onCodeChange={setCode} />
      <TeInput
        label={t("screen.public.accountRecovery.passwordReset.newPassword")}
        name="newPassword"
        type="password"
        autoComplete="new-password"
        passwordToggle
        minLength={MIN_PASSWORD_LENGTH}
        supportingText={t(
          "screen.public.accountRecovery.passwordReset.atLeastCharactersPasswordsFound",
          { min: MIN_PASSWORD_LENGTH },
        )}
        required
      />
      <div>
        <TeButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={submitDisabled || !isCodeComplete(code) || submitting}
        >
          {t("screen.public.accountRecovery.passwordReset.setPassword")}
        </TeButton>
      </div>
      <p className="te-body">
        {t("screen.public.accountRecovery.passwordReset.rememberedIt")}{" "}
        <Link to={AUTH_ROUTES.signIn} className="te-link">
          {t("screen.public.accountRecovery.passwordReset.backToSignIn")}
        </Link>
      </p>
    </form>
  );
}

/** Password reset through a verified email or phone. Added for coverage; needs product sign-off. */
export function PasswordReset() {
  return (
    <AuthFrame
      title={t("screen.public.accountRecovery.passwordReset.passwordReset")}
      description={t("screen.public.accountRecovery.passwordReset.weSendACodeTo")}
    >
      <StatePreview
        main={<PasswordResetForm />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert
            tone="error"
            title={t("screen.public.accountRecovery.passwordReset.passwordRefused")}
          >
            {t("screen.public.accountRecovery.passwordReset.theNewPasswordIsShorter")}{" "}
            {MIN_PASSWORD_LENGTH}{" "}
            {t("screen.public.accountRecovery.passwordReset.charactersOrWasFoundIn")}
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
