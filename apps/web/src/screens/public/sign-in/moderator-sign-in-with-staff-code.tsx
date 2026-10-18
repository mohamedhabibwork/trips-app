import { useState, type FormEvent } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInput } from "@trips-app/ui/components/te-input";
import { t } from "@trips-app/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { isCodeComplete } from "../../shared/otp-entry-panel";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";
import { StaffCodePanel } from "../common/staff-code-panel";
import { useFormReady } from "../common/use-form-ready";

function ModeratorSignInForm() {
  const queryClient = useQueryClient();
  const signInMutation = useMutation(
    orpc.auth.moderatorSignIn.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { submitDisabled, formProps } = useFormReady();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !isCodeComplete(code)) return;
    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") ?? "").trim();
    if (!identifier) return;
    setSubmitting(true);
    try {
      await signInMutation.mutateAsync({
        identifier,
        staffCode: code,
        surface: "pwa",
      });
    } catch {
      // Handled via caller
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      action={AUTH_ROUTES.moderatorSignIn}
      method="post"
      className="flex flex-col gap-6"
      {...formProps}
      onSubmit={(e) => void handleSubmit(e)}
    >
      <TeInput
        label={t("screen.public.signIn.moderatorSignInWithStaffCode.emailOrPhone")}
        name="identifier"
        autoComplete="username"
        required
      />
      <StaffCodePanel code={code} onCodeChange={setCode} />
      <div>
        <TeButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={submitDisabled || !isCodeComplete(code) || submitting}
        >
          {t("screen.public.signIn.moderatorSignInWithStaffCode.signIn")}
        </TeButton>
      </div>
    </form>
  );
}

/** Moderator sign-in with a staff code. After sign-in the app opens the assigned vehicle only. */
export function ModeratorSignInWithStaffCode() {
  return (
    <AuthFrame
      title={t("screen.public.signIn.moderatorSignInWithStaffCode.moderatorSignInWithStaff")}
      description={t("screen.public.signIn.moderatorSignInWithStaffCode.afterSignInYouSee")}
    >
      <ModeratorSignInForm />
    </AuthFrame>
  );
}
