import { useState, type FormEvent } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { t } from "@trips-app/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { ScreenLink } from "../../shared/screen-link";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";
import { useFormReady } from "../common/use-form-ready";

function AdminSignInForm() {
  const queryClient = useQueryClient();
  const adminSignInMutation = useMutation(
    orpc.auth.adminSignIn.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );
  const [submitting, setSubmitting] = useState(false);
  const { submitDisabled, formProps } = useFormReady();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!email || !password) return;
    setSubmitting(true);
    try {
      const res = (await adminSignInMutation.mutateAsync({ email, password })) as unknown as {
        challengeToken?: string;
        enrollmentToken?: string;
      };
      if (typeof sessionStorage !== "undefined") {
        if (res?.challengeToken) {
          sessionStorage.setItem("te:adminChallengeToken", res.challengeToken);
        }
        if (res?.enrollmentToken) {
          sessionStorage.setItem("te:adminEnrollmentToken", res.enrollmentToken);
        }
      }
    } catch {
      // Handled via StatePreview or caller
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      action={AUTH_ROUTES.adminSignIn}
      method="post"
      className="flex flex-col gap-4"
      {...formProps}
      onSubmit={(e) => void handleSubmit(e)}
    >
      <TeInput
        label={t("screen.public.signIn.adminSignIn.email")}
        name="email"
        type="email"
        autoComplete="username"
        required
      />
      <TeInput
        label={t("screen.public.signIn.adminSignIn.password")}
        name="password"
        type="password"
        autoComplete="current-password"
        passwordToggle
        supportingText={t("screen.public.signIn.adminSignIn.atLeast12CharactersPasswords")}
        required
      />
      <div>
        <TeButton type="submit" variant="primary" size="lg" disabled={submitDisabled || submitting}>
          {t("screen.public.signIn.adminSignIn.continue")}
        </TeButton>
      </div>
      <p className="te-body">
        {t("screen.public.signIn.adminSignIn.authenticatorNotSetUpYet")}{" "}
        <ScreenLink surface="public" slug="admin-authenticator-set-up-and-code">
          {t("screen.public.signIn.adminSignIn.setItUp")}
        </ScreenLink>
      </p>
    </form>
  );
}

/** Admin console entry. Staff only, on its own route. The authenticator step follows. */
export function AdminSignIn() {
  return (
    <AuthFrame
      title={t("screen.public.signIn.adminSignIn.adminSignIn")}
      description={t("screen.public.signIn.adminSignIn.staffOnlyThereIsNo")}
    >
      <StatePreview
        main={<AdminSignInForm />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert tone="error" title={t("screen.public.signIn.adminSignIn.signInRefused")}>
            {t("screen.public.signIn.adminSignIn.theEmailOrPasswordIs")}
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
