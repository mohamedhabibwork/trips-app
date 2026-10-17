import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { isCodeComplete, OtpEntryPanel } from "../../shared/otp-entry-panel";
import { preventSubmit } from "../../shared/screen-actions";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";
import { useFormReady } from "../common/use-form-ready";

const MIN_PASSWORD_LENGTH = 12;

// No real reset route exists for this step yet, so the submit is inert.
function PasswordResetForm() {
  const [code, setCode] = useState("");
  const { submitDisabled, formProps } = useFormReady();

  return (
    <form className="flex flex-col gap-6" onSubmit={preventSubmit} {...formProps}>
      <TeInput label="Email or phone" name="identifier" autoComplete="username" required />
      <OtpEntryPanel destination="a***@example.com" code={code} onCodeChange={setCode} />
      <TeInput
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        passwordToggle
        minLength={MIN_PASSWORD_LENGTH}
        supportingText={`At least ${MIN_PASSWORD_LENGTH} characters. Passwords found in breached lists are refused.`}
        required
      />
      <div>
        <TeButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={submitDisabled || !isCodeComplete(code)}
        >
          Set password
        </TeButton>
      </div>
      <p className="te-body">
        Remembered it?{" "}
        <Link to={AUTH_ROUTES.signIn} className="te-link">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

/** Password reset through a verified email or phone. Added for coverage; needs product sign-off. */
export function PasswordReset() {
  return (
    <AuthFrame
      title="Password reset"
      description="We send a code to your verified email or phone. Then set a new password."
    >
      <StatePreview
        main={<PasswordResetForm />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert tone="error" title="Password refused">
            The new password is shorter than {MIN_PASSWORD_LENGTH} characters or was found in a
            breached list.
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
