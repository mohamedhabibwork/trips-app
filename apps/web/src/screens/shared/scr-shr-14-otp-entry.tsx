import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { isCodeComplete, OtpEntryPanel } from "./otp-entry-panel";
import { goBack, preventSubmit } from "./screen-actions";
import { StatePreview } from "./state-preview";

// No real verification route exists for this step yet, so the submit is inert.
function OtpEntryForm() {
  const [code, setCode] = useState("");

  return (
    <form className="flex flex-col gap-6" onSubmit={preventSubmit}>
      <OtpEntryPanel destination="a***@example.com" code={code} onCodeChange={setCode} />
      <div>
        <TeButton type="submit" variant="primary" size="lg" disabled={!isCodeComplete(code)}>
          Verify
        </TeButton>
      </div>
    </form>
  );
}

/** One-time code entry for verification. Used by sign-up verification and password reset. */
export function ScrShr14OtpEntry() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
      <TePageHeader
        title="OTP entry"
        description="Enter the one-time code. Codes are not shown or logged."
        actions={
          <TeButton variant="ghost" onClick={goBack}>
            Back
          </TeButton>
        }
      />
      <StatePreview
        main={<OtpEntryForm />}
        error={
          <div className="flex flex-col gap-6">
            <TeInlineAlert tone="error" title="Wrong code">
              That code does not match. After five wrong codes, verification pauses for 15 minutes.
            </TeInlineAlert>
            <OtpEntryForm />
          </div>
        }
      />
    </div>
  );
}
