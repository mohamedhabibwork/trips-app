import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeOtpInput } from "@trips-app/ui/components/te-otp-input";
import { TeStepper } from "@trips-app/ui/components/te-stepper";
import { isCodeComplete } from "../../shared/otp-entry-panel";
import { preventSubmit } from "../../shared/screen-actions";
import { StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";

const SETUP_STEPS = [
  { id: "set-up", label: "Set up authenticator" },
  { id: "code", label: "Enter code" },
] as const;

// No real verification route exists for this step yet, so the submit is inert.
function AuthenticatorForm() {
  const [code, setCode] = useState("");

  return (
    <form className="flex flex-col gap-6" onSubmit={preventSubmit}>
      <TeStepper
        steps={SETUP_STEPS}
        currentId="set-up"
        completedIds={[]}
        ariaLabel="Set-up steps"
      />
      <TeInlineAlert tone="info" title="Set-up required">
        The admin console does not open until the authenticator is set up.
      </TeInlineAlert>
      <div className="flex items-start gap-3">
        <TeIcon name="lock" />
        <p className="te-body">
          Scan the QR code shown on screen with your authenticator app, then enter the six-digit
          code it displays.
        </p>
      </div>
      <TeOtpInput label="Authenticator code" value={code} onValueChange={setCode} />
      <div>
        <TeButton type="submit" variant="primary" size="lg" disabled={!isCodeComplete(code)}>
          Verify
        </TeButton>
      </div>
      <p className="te-body">
        After verification, the admin console opens.{" "}
        <Link to="/admin" className="te-link">
          Admin home
        </Link>
      </p>
    </form>
  );
}

/** Second factor for admins. Set-up is required once; later sign-ins need the code only. */
export function AdminAuthenticatorSetUpAndCode() {
  return (
    <AuthFrame
      title="Admin authenticator set-up and code"
      description="Admin sign-in needs an authenticator code. The admin console opens after this step."
    >
      <StatePreview
        main={<AuthenticatorForm />}
        error={
          <TeInlineAlert tone="error" title="Wrong code">
            Try again. Five failures lock admin sign-in for 15 minutes.
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
