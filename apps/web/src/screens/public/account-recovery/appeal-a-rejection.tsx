// SCR-PUB-18 Appeal a rejection (`/application-status/appeal`): the recorded reason, the appeal
// statement and optional supporting files.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, TextAreaField, TextLink } from "@/components/kit/controls";
import { ActionRow, PageIntro, PageMain, Panel } from "@/components/kit/layout";
import { pathFor } from "@/navigation/web-routes";
import { trackEvent } from "@/utils/analytics";
import { orpc } from "@/utils/orpc";
import { serverMutationOptions, serverQueryOptions } from "@/utils/server-rpc";

import { getApplicantApplicationId, setApplicantApplicationId } from "../../onboarding-state";
import { uploadApplicationDocuments } from "../common/application-documents";
import { DocumentDrop } from "../common/document-drop";

const MIN_STATEMENT_LENGTH = 10;

/** A rejected applicant asks for a review of the decision. */
export function AppealARejection() {
  const { t, status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const storedId = getApplicantApplicationId() ?? undefined;
  const statusQuery = useQuery({
    ...serverQueryOptions(orpc.onboarding.getApplicationStatus, "onboarding/getApplicationStatus", {
      input: storedId ? { applicationId: storedId } : {},
    }),
    enabled: authStatus === "authenticated",
  });
  const appealMutation = useMutation(
    serverMutationOptions(orpc.onboarding.submitAppeal, "onboarding/submitAppeal", {
      onSuccess: () => {
        trackEvent("appeal_submitted", { surface: "public" });
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
      onError: () => trackEvent("appeal_submit_failed", { surface: "public" }),
    }),
  );
  const [statement, setStatement] = useState("");
  const [files, setFiles] = useState<readonly File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loaded = statusQuery.data?.application as unknown as
    | { id: string; state?: string; decisionNotes?: string | null }
    | undefined;
  const applicationId = loaded?.id ?? storedId ?? null;
  const reason = loaded?.decisionNotes ?? null;
  const [uploading, setUploading] = useState(false);
  const submitting = appealMutation.isPending || uploading;
  // Only a rejected application can be appealed; any other state is shown, not appealed.
  const rejected = loaded?.state === "rejected";

  useEffect(() => {
    if (loaded?.id) setApplicantApplicationId(loaded.id);
  }, [loaded?.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (statement.trim().length < MIN_STATEMENT_LENGTH || submitting) return;
    if (!applicationId) {
      setErrorMessage(t("screen.public.appeal.noApplication"));
      return;
    }
    setErrorMessage(null);
    setUploading(true);
    try {
      const documents = await uploadApplicationDocuments(files, "appeal_evidence");
      setUploading(false);
      await appealMutation.mutateAsync({
        applicationId,
        appealStatement: statement.trim(),
        documents,
      });
      setSubmitted(true);
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error ? caught.message : t("screen.public.appeal.submitFailed"),
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <PageMain width="narrow">
      <PageIntro
        title={t("screen.public.appeal.title")}
        description={t("screen.public.appeal.lead")}
      />
      {authStatus === "authenticated" && statusQuery.isSuccess && !rejected ? (
        <Notice tone="info">
          {t("screen.public.appeal.notRejected")}{" "}
          <TextLink to={pathFor("SCR-PUB-17")}>{t("screen.public.appeal.cancel")}</TextLink>
        </Notice>
      ) : null}
      <Panel as="section" className={statusQuery.isSuccess && !rejected ? "hidden" : undefined}>
        <div className="flex flex-col gap-1.5 rounded-[var(--te-radius-md)] bg-[var(--te-danger-soft)] px-4 py-3.5 text-sm leading-5 text-[var(--te-danger)]">
          <span className="flex items-center gap-2 font-semibold">
            <TeIcon name="alert" className="size-4" />
            {t("screen.public.appeal.rejected")}
          </span>
          <span className="text-[var(--te-ink)]">
            {t("screen.public.appeal.reason", {
              reason: reason ?? t("screen.public.appeal.reasonMissing"),
            })}
          </span>
        </div>
        <form className="flex flex-col gap-[18px]" onSubmit={(event) => void handleSubmit(event)}>
          <TextAreaField
            name="appealStatement"
            label={t("screen.public.appeal.statement")}
            placeholder={t("screen.public.appeal.statementPlaceholder")}
            rows={6}
            value={statement}
            onChange={(event) => setStatement(event.target.value)}
            minLength={MIN_STATEMENT_LENGTH}
            required
            disabled={submitting || submitted}
          />
          <DocumentDrop
            title={t("screen.public.appeal.files")}
            hint={t("screen.public.appeal.filesHint")}
            files={files}
            onChange={setFiles}
            multiple
            disabled={submitting || submitted}
          />
          {submitted ? <Notice tone="success">{t("screen.public.appeal.submitted")}</Notice> : null}
          {errorMessage ? <Notice tone="danger">{errorMessage}</Notice> : null}
          <ActionRow>
            <Button
              type="submit"
              disabled={statement.trim().length < MIN_STATEMENT_LENGTH || submitting || submitted}
            >
              {submitting ? t("screen.public.appeal.submitting") : t("screen.public.appeal.submit")}
            </Button>
            <TextLink to={pathFor("SCR-PUB-17")} tone="ink">
              {t("screen.public.appeal.cancel")}
            </TextLink>
          </ActionRow>
        </form>
      </Panel>
    </PageMain>
  );
}
