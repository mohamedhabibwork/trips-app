import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInput } from "@trips-app/ui/components/te-input";
import { isCodeComplete } from "../../shared/otp-entry-panel";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";
import { StaffCodePanel } from "../common/staff-code-panel";
import { useFormReady } from "../common/use-form-ready";

function ModeratorSignInForm() {
  const [code, setCode] = useState("");
  const { submitDisabled, formProps } = useFormReady();

  return (
    <form
      action={AUTH_ROUTES.moderatorSignIn}
      method="post"
      className="flex flex-col gap-6"
      {...formProps}
    >
      <TeInput label="Email or phone" name="identifier" autoComplete="username" required />
      <StaffCodePanel code={code} onCodeChange={setCode} />
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
    </form>
  );
}

/** Moderator sign-in with a staff code. After sign-in the app opens the assigned vehicle only. */
export function ModeratorSignInWithStaffCode() {
  return (
    <AuthFrame
      title="Moderator sign-in with staff code"
      description="After sign-in you see only your assigned vehicle."
    >
      <ModeratorSignInForm />
    </AuthFrame>
  );
}
