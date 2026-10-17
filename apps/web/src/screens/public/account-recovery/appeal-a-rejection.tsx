import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeFileUpload, type TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeTextarea } from "@trips-app/ui/components/te-textarea";
import { buttonLinkClass } from "../../shared/button-link";
import { preventSubmit } from "../../shared/screen-actions";
import { ScreenLink } from "../../shared/screen-link";
import { toPendingItems, withoutItem } from "../../shared/upload-items";
import { AuthFrame } from "../common/auth-frame";

// No real appeal route exists yet, so the submit is inert.
function AppealForm() {
  const [statement, setStatement] = useState("");
  const [files, setFiles] = useState<readonly TeFileUploadItem[]>([]);

  return (
    <form className="flex flex-col gap-6" onSubmit={preventSubmit}>
      <TeTextarea
        label="Appeal statement"
        name="appealStatement"
        rows={6}
        value={statement}
        onChange={(event) => setStatement(event.target.value)}
        supportingText="Explain why the decision should be reviewed."
        required
      />
      <TeFileUpload
        label="Supporting files"
        accept="image/*,application/pdf"
        multiple
        files={files}
        onFilesSelected={(selected) => setFiles([...files, ...toPendingItems(selected)])}
        onRemove={(name) => setFiles(withoutItem(files, name))}
        hint="Add any document that supports your appeal."
      />
      <div className="flex flex-wrap gap-3">
        <TeButton type="submit" variant="primary" size="lg" disabled={statement.trim() === ""}>
          Submit appeal
        </TeButton>
        <ScreenLink
          surface="public"
          slug="application-status-and-changes-response"
          className={buttonLinkClass("ghost")}
        >
          Back to status
        </ScreenLink>
      </div>
    </form>
  );
}

/** A rejected applicant asks for a review while the appeal window is open. */
export function AppealARejection() {
  return (
    <AuthFrame
      title="Appeal a rejection"
      description="Ask for a review of the decision while the appeal window is open."
    >
      <TeInlineAlert tone="error" title="Rejected">
        Reason on record: the reason from the review team is shown here.
      </TeInlineAlert>
      <AppealForm />
    </AuthFrame>
  );
}
