import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { isCodeComplete } from "../../shared/otp-entry-panel";
import { preventSubmit } from "../../shared/screen-actions";
import { StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";
import { StaffCodePanel } from "../common/staff-code-panel";

// No real verification route exists for this step yet, so the submit is inert.
function StaffCodeSetupForm() {
  const [code, setCode] = useState("");

  return (
    <form className="flex flex-col gap-6" onSubmit={preventSubmit}>
      <StaffCodePanel code={code} onCodeChange={setCode} />
      <div>
        <TeButton type="submit" variant="primary" size="lg" disabled={!isCodeComplete(code)}>
          Confirm
        </TeButton>
      </div>
      <p className="te-body">
        After confirmation, the workspace opens.{" "}
        <Link to="/business" className="te-link">
          Open the workspace
        </Link>
      </p>
    </form>
  );
}

/** First sign-in for staff. The second factor must be set before the workspace opens. */
export function StaffCodeSetUp() {
  return (
    <AuthFrame
      title="Staff code set-up (first sign-in)"
      description="Choose SMS or an authenticator app, then confirm a code. The workspace opens after this step."
    >
      <StatePreview
        main={<StaffCodeSetupForm />}
        error={
          <TeInlineAlert tone="error" title="Code expired">
            The code is wrong or expired. Request a new code and try again.
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
