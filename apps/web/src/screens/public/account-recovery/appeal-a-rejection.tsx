// SCR-PUB-18 Appeal a rejection (`/application-status/appeal`): the recorded reason, the appeal
// statement and optional supporting files.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, TextAreaField, TextLink } from "@/components/kit/controls";
import { ActionRow, PageIntro, PageMain, Panel } from "@/components/kit/layout";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";

import {
  getApplicantApplicationId,
  setApplicantApplicationId,
  uploadItemsToDocuments,
} from "../../onboarding-state";
import { DocumentDrop } from "../common/document-drop";

const MIN_STATEMENT_LENGTH = 10;

/** A rejected applicant asks for a review of the decision. */
export function AppealARejection() {
  const { t, status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const storedId = getApplicantApplicationId() ?? undefined;
  const statusQuery = useQuery({
    ...orpc.onboarding.getApplicationStatus.queryOptions({
      input: storedId ? { applicationId: storedId } : {},
    }),
    enabled: authStatus === "authenticated",
  });
  const appealMutation = useMutation(
    orpc.onboarding.submitAppeal.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );
  const [statement, setStatement] = useState("");
  const [files, setFiles] = useState<readonly TeFileUploadItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loaded = statusQuery.data?.application as unknown as
    | { id: string; decisionNotes?: string | null }
    | undefined;
  const applicationId = loaded?.id ?? storedId ?? null;
  const reason = loaded?.decisionNotes ?? null;
  const submitting = appealMutation.isPending;

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
    try {
      await appealMutation.mutateAsync({
        applicationId,
        appealStatement: statement.trim(),
        documents: uploadItemsToDocuments(files, "appeal_evidence"),
      });
      setSubmitted(true);
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error ? caught.message : t("screen.public.appeal.submitFailed"),
      );
    }
  }

  return (
    <PageMain width="narrow">
      <PageIntro
        title={t("screen.public.appeal.title")}
        description={t("screen.public.appeal.lead")}
      />
      <Panel as="section">
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
            items={files}
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
