import { useEffect, useState, type FormEvent } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeFileUpload, type TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeTextarea } from "@trips-app/ui/components/te-textarea";
import { useAuth } from "@/auth/auth-context";
import { client } from "@/utils/orpc";
import {
  getApplicantApplicationId,
  setApplicantApplicationId,
  uploadItemsToDocuments,
} from "../../onboarding-state";
import { buttonLinkClass } from "../../shared/button-link";
import { ScreenLink } from "../../shared/screen-link";
import { toPendingItems, withoutItem } from "../../shared/upload-items";
import { AuthFrame } from "../common/auth-frame";

function AppealForm({ applicationId }: { applicationId: string | null }) {
  const [statement, setStatement] = useState("");
  const [files, setFiles] = useState<readonly TeFileUploadItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (statement.trim().length < 10 || submitting) return;
    if (!applicationId) {
      setErrorMsg("No rejected application found for this session.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await client.onboarding.submitAppeal({
        applicationId,
        appealStatement: statement.trim(),
        documents: uploadItemsToDocuments(files, "appeal_evidence"),
      });
      setSubmitted(true);
    } catch (caught) {
      setErrorMsg(caught instanceof Error ? caught.message : "Could not submit appeal.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(e) => void handleSubmit(e)}>
      <TeTextarea
        label="Appeal statement"
        name="appealStatement"
        rows={6}
        value={statement}
        onChange={(event) => setStatement(event.target.value)}
        supportingText="Explain why the decision should be reviewed (at least 10 characters)."
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
      {submitted ? (
        <TeInlineAlert tone="info" title="Appeal submitted">
          Your appeal has been sent to the review team.
        </TeInlineAlert>
      ) : null}
      {errorMsg ? (
        <TeInlineAlert tone="error" title="Appeal could not be submitted">
          {errorMsg}
        </TeInlineAlert>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <TeButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={statement.trim().length < 10 || submitting || submitted}
        >
          {submitting ? "Submitting..." : "Submit appeal"}
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
  const { status: authStatus } = useAuth();
  const [applicationId, setApplicationId] = useState<string | null>(() =>
    getApplicantApplicationId(),
  );
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;
    const storedId = getApplicantApplicationId() ?? undefined;
    void client.onboarding
      .getApplicationStatus(storedId ? { applicationId: storedId } : {})
      .then((res) => {
        if (cancelled || !res.application) return;
        const loaded = res.application as unknown as {
          id: string;
          decisionNotes?: string | null;
          rejectionReason?: string | null;
        };
        setApplicationId(loaded.id);
        setApplicantApplicationId(loaded.id);
        setRejectionReason(loaded.decisionNotes ?? loaded.rejectionReason ?? null);
      })
      .catch(() => {
        // Ignore when previewed without an active application
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  return (
    <AuthFrame
      title="Appeal a rejection"
      description="Ask for a review of the decision while the appeal window is open."
    >
      <TeInlineAlert tone="error" title="Rejected">
        Reason on record: {rejectionReason ?? "the reason from the review team is shown here."}
      </TeInlineAlert>
      <AppealForm applicationId={applicationId} />
    </AuthFrame>
  );
}
