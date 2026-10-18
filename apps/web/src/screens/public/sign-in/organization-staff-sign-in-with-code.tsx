import { useState, type FormEvent } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { t } from "@trips-app/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { isCodeComplete } from "../../shared/otp-entry-panel";
import { ScreenLink } from "../../shared/screen-link";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";
import { StaffCodePanel } from "../common/staff-code-panel";
import { useFormReady } from "../common/use-form-ready";

function StaffSignInForm() {
  const queryClient = useQueryClient();
  const signInMutation = useMutation(
    orpc.auth.staffSignIn.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );
  const verifyMutation = useMutation(
    orpc.auth.staffVerifySecondFactor.mutationOptions({
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
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!email || !password) return;
    setSubmitting(true);
    try {
      const signInRes = (await signInMutation.mutateAsync({ email, password })) as unknown as {
        challengeToken?: string;
      };
      const challengeToken = signInRes?.challengeToken ?? "staff-challenge-token";
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("te:staffChallengeToken", challengeToken);
      }
      await verifyMutation.mutateAsync({
        challengeToken,
        code,
      });
    } catch {
      // Handled via StatePreview or caller
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      action={AUTH_ROUTES.staffSignIn}
      method="post"
      className="flex flex-col gap-6"
      {...formProps}
      onSubmit={(e) => void handleSubmit(e)}
    >
      <div className="flex flex-col gap-4">
        <TeInput
          label={t("screen.public.signIn.organizationStaffSignInWithCode.email")}
          name="email"
          type="email"
          autoComplete="username"
          required
        />
        <TeInput
          label={t("screen.public.signIn.organizationStaffSignInWithCode.password")}
          name="password"
          type="password"
          autoComplete="current-password"
          passwordToggle
          required
        />
      </div>
      <section className="flex flex-col gap-4" aria-labelledby="staff-code-heading">
        <h2 id="staff-code-heading" className="te-h3">
          {t("screen.public.signIn.organizationStaffSignInWithCode.secondFactor")}
        </h2>
        <StaffCodePanel code={code} onCodeChange={setCode} />
      </section>
      <div>
        <TeButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={submitDisabled || !isCodeComplete(code) || submitting}
        >
          {t("screen.public.signIn.organizationStaffSignInWithCode.signIn")}
        </TeButton>
      </div>
      <p className="te-body">
        {t("screen.public.signIn.organizationStaffSignInWithCode.firstSignIn")}{" "}
        <ScreenLink surface="public" slug="staff-code-set-up">
          {t("screen.public.signIn.organizationStaffSignInWithCode.setUpYourStaffCode")}
        </ScreenLink>
      </p>
    </form>
  );
}

/** Staff sign-in for organization owners and employees. A second-factor code is required each time. */
export function OrganizationStaffSignInWithCode() {
  return (
    <AuthFrame
      title={t("screen.public.signIn.organizationStaffSignInWithCode.organizationStaffSignInWith")}
      description={t(
        "screen.public.signIn.organizationStaffSignInWithCode.enterYourEmailYourPassword",
      )}
    >
      <StatePreview
        main={<StaffSignInForm />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert
            tone="error"
            title={t("screen.public.signIn.organizationStaffSignInWithCode.signInRefused")}
          >
            {t("screen.public.signIn.organizationStaffSignInWithCode.theCodeIsWrongOr")}
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
