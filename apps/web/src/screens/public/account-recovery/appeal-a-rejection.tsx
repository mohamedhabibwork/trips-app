import { useEffect, useState, type FormEvent } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeFileUpload, type TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeTextarea } from "@trips-app/ui/components/te-textarea";
import { t } from "@trips-app/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
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
  const queryClient = useQueryClient();
  const appealMutation = useMutation(
    orpc.onboarding.submitAppeal.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );
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
      await appealMutation.mutateAsync({
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
        label={t("screen.public.accountRecovery.appealARejection.appealStatement")}
        name="appealStatement"
        rows={6}
        value={statement}
        onChange={(event) => setStatement(event.target.value)}
        supportingText={t(
          "screen.public.accountRecovery.appealARejection.explainWhyTheDecisionShould",
        )}
        required
      />
      <TeFileUpload
        label={t("screen.public.accountRecovery.appealARejection.supportingFiles")}
        accept="image/*,application/pdf"
        multiple
        files={files}
        onFilesSelected={(selected) => setFiles([...files, ...toPendingItems(selected)])}
        onRemove={(name) => setFiles(withoutItem(files, name))}
        hint={t("screen.public.accountRecovery.appealARejection.addAnyDocumentThatSupports")}
      />
      {submitted ? (
        <TeInlineAlert
          tone="info"
          title={t("screen.public.accountRecovery.appealARejection.appealSubmitted")}
        >
          {t("screen.public.accountRecovery.appealARejection.yourAppealHasBeenSent")}
        </TeInlineAlert>
      ) : null}
      {errorMsg ? (
        <TeInlineAlert
          tone="error"
          title={t("screen.public.accountRecovery.appealARejection.appealCouldNotBeSubmitted")}
        >
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
          {submitting
            ? t("screen.public.accountRecovery.appealARejection.submitting")
            : t("screen.public.accountRecovery.appealARejection.submitAppeal")}
        </TeButton>
        <ScreenLink
          surface="public"
          slug="application-status-and-changes-response"
          className={buttonLinkClass("ghost")}
        >
          {t("screen.public.accountRecovery.appealARejection.backToStatus")}
        </ScreenLink>
      </div>
    </form>
  );
}

/** A rejected applicant asks for a review while the appeal window is open. */
export function AppealARejection() {
  const { status: authStatus } = useAuth();
  const storedId = getApplicantApplicationId() ?? undefined;
  const statusQuery = useQuery({
    ...orpc.onboarding.getApplicationStatus.queryOptions({
      input: storedId ? { applicationId: storedId } : {},
    }),
    enabled: authStatus === "authenticated",
  });

  const loaded = statusQuery.data?.application as unknown as
    | {
        id: string;
        decisionNotes?: string | null;
        rejectionReason?: string | null;
      }
    | undefined;

  const applicationId = loaded?.id ?? storedId ?? null;
  const rejectionReason = loaded?.decisionNotes ?? loaded?.rejectionReason ?? null;

  useEffect(() => {
    if (loaded?.id) {
      setApplicantApplicationId(loaded.id);
    }
  }, [loaded?.id]);

  return (
    <AuthFrame
      title={t("screen.public.accountRecovery.appealARejection.appealARejection")}
      description={t("screen.public.accountRecovery.appealARejection.askForAReviewOf")}
    >
      <TeInlineAlert
        tone="error"
        title={t("screen.public.accountRecovery.appealARejection.rejected")}
      >
        {t("screen.public.accountRecovery.appealARejection.reasonOnRecord")}{" "}
        {rejectionReason ??
          t("screen.public.accountRecovery.appealARejection.theReasonFromTheReview")}
      </TeInlineAlert>
      <AppealForm applicationId={applicationId} />
    </AuthFrame>
  );
}
