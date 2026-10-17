import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { isCodeComplete } from "../../shared/otp-entry-panel";
import { ScreenLink } from "../../shared/screen-link";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";
import { StaffCodePanel } from "../common/staff-code-panel";
import { useFormReady } from "../common/use-form-ready";

function StaffSignInForm() {
  const [code, setCode] = useState("");
  const { submitDisabled, formProps } = useFormReady();

  return (
    <form
      action={AUTH_ROUTES.staffSignIn}
      method="post"
      className="flex flex-col gap-6"
      {...formProps}
    >
      <div className="flex flex-col gap-4">
        <TeInput label="Email" name="email" type="email" autoComplete="username" required />
        <TeInput
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          passwordToggle
          required
        />
      </div>
      <section className="flex flex-col gap-4" aria-labelledby="staff-code-heading">
        <h2 id="staff-code-heading" className="te-h3">
          Second factor
        </h2>
        <StaffCodePanel code={code} onCodeChange={setCode} />
      </section>
      <div>
        <TeButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={submitDisabled || !isCodeComplete(code)}
        >
          Sign in
        </TeButton>
      </div>
      <p className="te-body">
        First sign-in?{" "}
        <ScreenLink surface="public" slug="staff-code-set-up">
          Set up your staff code
        </ScreenLink>
      </p>
    </form>
  );
}

/** Staff sign-in for organization owners and employees. A second-factor code is required each time. */
export function OrganizationStaffSignInWithCode() {
  return (
    <AuthFrame
      title="Organization staff sign-in with code"
      description="Enter your email, your password, and the code from your second factor. If your email is linked to several organizations, you choose one after the code."
    >
      <StatePreview
        main={<StaffSignInForm />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert tone="error" title="Sign-in refused">
            The code is wrong, or this email is not linked to any organization.
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
