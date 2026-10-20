// SCR-ADM-04 Request changes (docs/design/web/admin/SCR-ADM-04.dc.html): pick the items the
// applicant must fix and write the message; sending moves the application to Changes Requested
// with a 14-day deadline.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { getSelectedAdminApplicationId } from "@/screens/onboarding-state";
import { serverMutationOptions, serverQueryOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";

import {
  AdminButton,
  AdminLink,
  useAdminNavigate,
  useAdminParam,
  type AdminParams,
} from "../common/admin-actions";
import { AdminCheckbox, AdminSelect, AdminTextarea, type AdminOption } from "../common/admin-form";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import { AdminAlert, AdminBadge, AdminCard, AdminPage, AdminSplit } from "../common/admin-ui";

/** FR-ONB-04: the applicant has 14 days to reply. */
const RESPONSE_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;
/** The API needs a message of at least 5 characters. */
const MIN_MESSAGE_LENGTH = 5;

interface FixItem {
  id: string;
  label: string;
}

const fixItems = (): readonly FixItem[] => [
  { id: "identity", label: t("screen.admin.applications.requestChangesDecision.fixIdentity") },
  { id: "insurance", label: t("screen.admin.applications.requestChangesDecision.fixInsurance") },
  { id: "portfolio", label: t("screen.admin.applications.requestChangesDecision.fixPortfolio") },
];

const languageOptions = (): readonly AdminOption[] => [
  { value: "en", label: t("screen.admin.applications.requestChangesDecision.english") },
  { value: "ar", label: t("screen.admin.applications.requestChangesDecision.arabic") },
];

function DecisionSide({ deadline }: { deadline: string }) {
  return (
    <>
      <AdminCard title={t("screen.admin.applications.requestChangesDecision.deadline")}>
        <span className="te-body">
          {t("screen.admin.applications.requestChangesDecision.deadlineDays")}
        </span>
        <span className="te-caption">
          {t("screen.admin.applications.requestChangesDecision.deadlineDate", { date: deadline })}
        </span>
      </AdminCard>
      <AdminCard>
        <span className="te-label">
          {t("screen.admin.applications.requestChangesDecision.afterSending")}
        </span>
        <AdminBadge tone="warn">
          {t("screen.admin.applications.requestChangesDecision.changesRequested")}
        </AdminBadge>
        <p className="te-body text-[var(--te-ink-muted)]">
          {t("screen.admin.applications.requestChangesDecision.staysOpen")}
        </p>
      </AdminCard>
      <AdminAlert tone="warning">
        {t("screen.admin.applications.requestChangesDecision.closesAutomatically")}
      </AdminAlert>
    </>
  );
}

export function RequestChangesDecision() {
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const goTo = useAdminNavigate();
  const applicationId = useAdminParam("applicationId", getSelectedAdminApplicationId);

  const [selected, setSelected] = useState<readonly string[]>([]);
  const [language, setLanguage] = useState("en");
  const [message, setMessage] = useState(() =>
    t("screen.admin.applications.requestChangesDecision.defaultMessage"),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const detailQuery = useQuery({
    ...serverQueryOptions(orpc.onboarding.getApplicationDetail, "onboarding/getApplicationDetail", {
      input: { applicationId: applicationId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(applicationId),
  });

  const requestChangesMutation = useMutation(
    serverMutationOptions(
      orpc.onboarding.requestApplicationChanges,
      "onboarding/requestApplicationChanges",
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
        },
      },
    ),
  );

  const trimmedMessage = message.trim();
  const isMessageValid = trimmedMessage.length >= MIN_MESSAGE_LENGTH;
  const canSend =
    Boolean(detailQuery.data) &&
    selected.length > 0 &&
    isMessageValid &&
    !requestChangesMutation.isPending;
  const deadline = new Date(Date.now() + RESPONSE_DAYS * DAY_MS).toLocaleDateString(locale);
  const params: AdminParams = applicationId ? { applicationId } : {};

  function toggleItem(id: string, checked: boolean) {
    setSelected((current) =>
      checked
        ? [...current.filter((item) => item !== id), id]
        : current.filter((item) => item !== id),
    );
  }

  async function send() {
    if (!canSend || !applicationId) return;
    setErrorMessage(null);
    try {
      await requestChangesMutation.mutateAsync({
        applicationId,
        decisionReasonCode: "changes_requested",
        decisionNotes: trimmedMessage,
        checklist: fixItems()
          .filter((item) => selected.includes(item.id))
          .map((item) => ({ field: item.id, instruction: item.label })),
      });
      await goTo("SCR-ADM-03", { applicationId });
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error
          ? caught.message
          : t("screen.admin.applications.requestChangesDecision.sendFailedBody"),
      );
    }
  }

  const form = (
    <AdminSplit
      main={
        <>
          <AdminCard
            title={t("screen.admin.applications.requestChangesDecision.itemsToFix")}
            caption={t("screen.admin.applications.requestChangesDecision.itemsToFixCaption")}
          >
            {fixItems().map((item) => (
              <AdminCheckbox
                key={item.id}
                label={item.label}
                checked={selected.includes(item.id)}
                onCheckedChange={(checked) => toggleItem(item.id, checked)}
              />
            ))}
          </AdminCard>
          <AdminCard title={t("screen.admin.applications.requestChangesDecision.messageTitle")}>
            <AdminSelect
              label={t("screen.admin.applications.requestChangesDecision.language")}
              options={languageOptions()}
              value={language}
              onValueChange={setLanguage}
              className="sm:max-w-[280px]"
            />
            <AdminTextarea
              label={t("screen.admin.applications.requestChangesDecision.message")}
              value={message}
              lang={language}
              dir={language === "ar" ? "rtl" : "ltr"}
              onChange={(event) => setMessage(event.target.value)}
              help={
                isMessageValid
                  ? undefined
                  : t("screen.admin.applications.requestChangesDecision.messageTooShort")
              }
            />
          </AdminCard>
          {errorMessage ? (
            <AdminAlert
              tone="danger"
              title={t("screen.admin.applications.requestChangesDecision.sendFailed")}
            >
              {errorMessage}
            </AdminAlert>
          ) : null}
        </>
      }
      side={<DecisionSide deadline={deadline} />}
    />
  );

  return (
    <AdminPage
      title={t("screen.admin.applications.requestChangesDecision.title")}
      description={t("screen.admin.applications.requestChangesDecision.description")}
      actions={
        <>
          <AdminLink screen="SCR-ADM-03" params={params} variant="secondary">
            {t("screen.admin.applications.requestChangesDecision.cancel")}
          </AdminLink>
          <AdminButton
            variant="primary"
            disabled={!canSend}
            aria-busy={requestChangesMutation.isPending}
            onClick={() => void send()}
          >
            {requestChangesMutation.isPending
              ? t("screen.admin.applications.requestChangesDecision.sending")
              : t("screen.admin.applications.requestChangesDecision.sendRequest")}
          </AdminButton>
        </>
      }
    >
      {applicationId ? (
        <AdminQueryState
          query={detailQuery}
          loadingLabel={t("screen.admin.applications.requestChangesDecision.loading")}
        >
          {form}
        </AdminQueryState>
      ) : (
        <AdminEmpty
          title={t("screen.admin.applications.requestChangesDecision.noApplication")}
          description={t("screen.admin.applications.requestChangesDecision.noApplicationBody")}
        />
      )}
    </AdminPage>
  );
}
