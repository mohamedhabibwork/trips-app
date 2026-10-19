// SCR-PUB-17 Application status (`/application-status`): where a supplier application stands, the
// requested changes with their deadline, resubmission, and the way to appeal.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { cn } from "@trips-app/ui/lib/utils";
import { useEffect, useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, TextLink } from "@/components/kit/controls";
import { formatDate } from "@/components/kit/format";
import {
  ActionRow,
  PageIntro,
  PageMain,
  Panel,
  PanelTitle,
  TwoColumns,
} from "@/components/kit/layout";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";

import { getApplicantApplicationId, setApplicantApplicationId } from "../../onboarding-state";
import { uploadApplicationDocuments } from "../common/application-documents";
import { DocumentDrop } from "../common/document-drop";

interface LiveApplication {
  id: string;
  applicationType: string;
  state: string;
  createdAt?: string | Date | null;
  changesDueAt?: string | Date | null;
  changesExtensionUsed?: boolean;
  decisionNotes?: string | null;
  changesRequestedChecklist?: Array<{
    field: string;
    instruction: string;
    resolved?: boolean;
  }> | null;
}

type Outcome = "changes" | "approved" | "rejected" | "closed" | "appealed" | "pending";

function outcomeOf(state: string): Outcome {
  const normalized = state.toLowerCase().replace(/\s+/g, "_");
  if (normalized === "changes_requested") return "changes";
  if (normalized === "approved") return "approved";
  if (normalized === "rejected") return "rejected";
  if (normalized === "closed") return "closed";
  if (normalized === "appealed" || normalized === "appeal_pending") return "appealed";
  return "pending";
}

const OUTCOME_STYLE: Record<Exclude<Outcome, "pending">, { icon: TeIconName; color: string }> = {
  changes: { icon: "alert", color: "text-[var(--te-warning)]" },
  approved: { icon: "check", color: "text-[var(--te-success)]" },
  rejected: { icon: "alert", color: "text-[var(--te-danger)]" },
  closed: { icon: "alert", color: "text-[var(--te-danger)]" },
  appealed: { icon: "clock", color: "text-[var(--te-ink)]" },
};

function StatusLine({
  icon,
  className,
  children,
}: {
  icon: TeIconName;
  className?: string;
  children: string;
}) {
  return (
    <li className={cn("flex items-center gap-2.5", className)}>
      <TeIcon name={icon} className="size-5 shrink-0" />
      {children}
    </li>
  );
}

export function ApplicationStatusView({ applicationIdProp }: { applicationIdProp?: string } = {}) {
  const { t, locale, status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const storedId = applicationIdProp ?? getApplicantApplicationId() ?? undefined;
  const statusQuery = useQuery({
    ...orpc.onboarding.getApplicationStatus.queryOptions({
      input: storedId ? { applicationId: storedId } : {},
    }),
    enabled: authStatus === "authenticated",
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
  const resubmitMutation = useMutation(
    orpc.onboarding.resubmitApplication.mutationOptions({ onSuccess: invalidate }),
  );
  const extensionMutation = useMutation(
    orpc.onboarding.requestChangesExtension.mutationOptions({ onSuccess: invalidate }),
  );
  const [files, setFiles] = useState<readonly File[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const busy = resubmitMutation.isPending || extensionMutation.isPending;

  const app = (statusQuery.data?.application as unknown as LiveApplication | undefined) ?? null;

  useEffect(() => {
    if (app) setApplicantApplicationId(app.id);
  }, [app]);

  const title = t("screen.public.applicationStatus.title");

  if (authStatus !== "authenticated") {
    return (
      <>
        <PageIntro title={title} />
        <Notice tone="info">
          {t("screen.public.applicationStatus.signInFirst")}{" "}
          <TextLink to={pathFor("SCR-PUB-08")}>{t("screen.auth.signIn.submit")}</TextLink>
        </Notice>
      </>
    );
  }
  if (statusQuery.isPending) {
    return (
      <>
        <PageIntro title={title} />
        <div
          role="status"
          aria-label={t("screen.public.applicationStatus.loading")}
          className="h-64 animate-pulse rounded-[var(--te-radius-lg)] bg-[var(--te-hairline)]"
        />
      </>
    );
  }
  if (!app) {
    return (
      <>
        <PageIntro title={title} />
        <Notice tone="danger">{t("screen.public.applicationStatus.notFound")}</Notice>
      </>
    );
  }

  const outcome = outcomeOf(app.state);
  const changes = app.changesRequestedChecklist ?? [];
  const canExtend = outcome === "changes" && !app.changesExtensionUsed;

  async function run(action: () => Promise<unknown>, successKey: string, failKey: string) {
    setFeedback(null);
    setErrorMessage(null);
    try {
      await action();
      setFeedback(t(successKey));
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : t(failKey));
    }
  }

  const resubmit = () =>
    run(
      async () => {
        // Only the documents change here; the application's answers stay as submitted.
        await resubmitMutation.mutateAsync({
          applicationId: app.id,
          updatedPayload: {},
          documents: await uploadApplicationDocuments(files, "other"),
        });
        setFiles([]);
      },
      "screen.public.applicationStatus.resubmitted",
      "screen.public.applicationStatus.resubmitFailed",
    );

  const extend = () =>
    run(
      () => extensionMutation.mutateAsync({ applicationId: app.id }),
      "screen.public.applicationStatus.extended",
      "screen.public.applicationStatus.extendFailed",
    );

  return (
    <>
      <PageIntro
        title={title}
        description={t("screen.public.applicationStatus.summary", {
          type: t(`screen.public.applicationStatus.type.${app.applicationType}`),
          date: formatDate(app.createdAt, locale),
        })}
      />
      <TwoColumns>
        <Panel className="gap-3.5">
          <PanelTitle>{t("screen.public.applicationStatus.status")}</PanelTitle>
          <ul className="m-0 flex list-none flex-col gap-3 p-0 text-base">
            <StatusLine icon="check" className="font-semibold text-[var(--te-success)]">
              {t("screen.public.applicationStatus.submitted")}
            </StatusLine>
            <StatusLine
              icon="clock"
              className={outcome === "pending" ? "font-semibold" : "text-[var(--te-ink-muted)]"}
            >
              {t("screen.public.applicationStatus.pendingReview")}
            </StatusLine>
            {outcome === "pending" ? null : (
              <StatusLine
                icon={OUTCOME_STYLE[outcome].icon}
                className={cn("font-semibold", OUTCOME_STYLE[outcome].color)}
              >
                {t(`screen.public.applicationStatus.outcome.${outcome}`)}
              </StatusLine>
            )}
          </ul>
          {outcome === "changes" && app.changesDueAt ? (
            <Notice tone="warning" strong>
              {t("screen.public.applicationStatus.respondBy", {
                date: formatDate(app.changesDueAt, locale),
              })}
            </Notice>
          ) : null}
          {app.decisionNotes ? (
            <Notice tone={outcome === "rejected" ? "danger" : "info"}>
              {t("screen.public.applicationStatus.notes", { notes: app.decisionNotes })}
            </Notice>
          ) : null}
        </Panel>

        <Panel className="gap-3.5">
          <PanelTitle>{t("screen.public.applicationStatus.requestedChanges")}</PanelTitle>
          {changes.length > 0 ? (
            <ol className="m-0 flex flex-col gap-2.5 ps-5 text-base leading-6">
              {changes.map((item) => (
                <li key={`${item.field}-${item.instruction}`}>{item.instruction}</li>
              ))}
            </ol>
          ) : (
            <p className="m-0 text-sm text-[var(--te-ink-muted)]">
              {t("screen.public.applicationStatus.noChanges")}
            </p>
          )}
          {outcome === "changes" ? (
            <DocumentDrop
              title={t("screen.public.applicationStatus.updatedDocuments")}
              hint={t("screen.public.applicationStatus.updatedDocumentsHint")}
              files={files}
              onChange={setFiles}
              multiple
              disabled={busy}
            />
          ) : null}
          {feedback ? <Notice tone="success">{feedback}</Notice> : null}
          {errorMessage ? <Notice tone="danger">{errorMessage}</Notice> : null}
          <ActionRow className="mt-1.5">
            {outcome === "changes" ? (
              <Button onClick={() => void resubmit()} disabled={busy}>
                {resubmitMutation.isPending
                  ? t("screen.public.applicationStatus.submitting")
                  : t("screen.public.applicationStatus.resubmit")}
              </Button>
            ) : null}
            {canExtend ? (
              <Button tone="outline" onClick={() => void extend()} disabled={busy}>
                {t("screen.public.applicationStatus.extend")}
              </Button>
            ) : null}
            {outcome === "rejected" ? (
              <TextLink to={pathFor("SCR-PUB-18")}>
                {t("screen.public.applicationStatus.appeal")}
              </TextLink>
            ) : null}
          </ActionRow>
        </Panel>
      </TwoColumns>
    </>
  );
}

/** Where an application stands. Shows requested changes, the deadline, and the appeal route. */
export function ApplicationStatusAndChangesResponse() {
  return (
    <PageMain>
      <ApplicationStatusView />
    </PageMain>
  );
}
