import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeCheckbox } from "@trips-app/ui/components/te-checkbox";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { getSelectedAdminApplicationId } from "@/screens/onboarding-state";
import { orpc } from "@/utils/orpc";
import { AdminDecisionForm } from "../common/admin-decision-form";
import { StatePreview } from "../common/admin-state-preview";
import { useAdminNavigate } from "../common/admin-links";
import { AdminFacts, AdminPage, AdminPanel } from "../common/admin-shared";

interface FixItem {
  id: string;
  label: string;
}

const FIX_ITEMS = (): readonly FixItem[] => [
  {
    id: "identity",
    label: t("screen.admin.applications.requestChangesDecision.readableIdentityDocument"),
  },
  {
    id: "insurance",
    label: t("screen.admin.applications.requestChangesDecision.validInsuranceCertificate"),
  },
  {
    id: "lab-consent",
    label: t("screen.admin.applications.requestChangesDecision.signedLabConsent"),
  },
  {
    id: "background",
    label: t("screen.admin.applications.requestChangesDecision.signedBackgroundCheckConsent"),
  },
  {
    id: "photos",
    label: t("screen.admin.applications.requestChangesDecision.atLeast8PortfolioPhotos"),
  },
];

const LANGUAGE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "en", label: t("screen.admin.applications.requestChangesDecision.english") },
  { value: "ar", label: t("screen.admin.applications.requestChangesDecision.arabic") },
];

export function RequestChangesDecision() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [language, setLanguage] = useState("en");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const goTo = useAdminNavigate();

  const appId = getSelectedAdminApplicationId();
  const detailQuery = useQuery({
    ...orpc.onboarding.getApplicationDetail.queryOptions({
      input: { applicationId: appId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(appId),
  });

  const applicantName =
    detailQuery.data?.applicant?.fullName ??
    detailQuery.data?.application.applicantAccountId ??
    "-";

  const requestChangesMutation = useMutation(
    orpc.onboarding.requestApplicationChanges.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );

  function toggleItem(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function handleConfirm(reason: string) {
    const targetAppId = getSelectedAdminApplicationId();
    if (authStatus === "authenticated" && targetAppId && !targetAppId.startsWith("app-")) {
      setErrorMsg(null);
      try {
        await requestChangesMutation.mutateAsync({
          applicationId: targetAppId,
          decisionReasonCode: "changes_requested",
          decisionNotes: reason.length >= 5 ? reason : `${reason} (changes requested)`,
          checklist: selected.map((id) => {
            const found = FIX_ITEMS().find((f) => f.id === id);
            return {
              field: id,
              instruction: found?.label ?? id,
            };
          }),
        });
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not request changes.");
        return;
      }
    }
    await goTo("application-review-detail");
  }

  const deadlineDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.applications.requestChangesDecision.requestChangesDecision")}
        description={t(
          "screen.admin.applications.requestChangesDecision.askTheApplicantForSpecific",
        )}
      />
      <StatePreview
        emptyTitle={t("screen.admin.applications.requestChangesDecision.noItemsToFix")}
        emptyDescription={t(
          "screen.admin.applications.requestChangesDecision.selectAtLeastOneItem",
        )}
        loadingLabel={t("screen.admin.applications.requestChangesDecision.loadingTheApplication")}
      >
        <AdminPanel title={t("screen.admin.applications.requestChangesDecision.applicant")}>
          <AdminFacts
            items={[
              {
                label: t("screen.admin.applications.requestChangesDecision.applicantName"),
                value: applicantName,
              },
              {
                label: t("screen.admin.applications.requestChangesDecision.applicationState"),
                value: "Changes requested after sending",
              },
            ]}
          />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.applications.requestChangesDecision.itemsToFix")}>
          <p className="te-caption">
            {t("screen.admin.applications.requestChangesDecision.selectAtLeastOneItem2")}
          </p>
          {FIX_ITEMS().map((item) => (
            <TeCheckbox
              key={item.id}
              label={item.label}
              checked={selected.includes(item.id)}
              onCheckedChange={() => toggleItem(item.id)}
            />
          ))}
        </AdminPanel>
        {errorMsg ? (
          <TeInlineAlert
            tone="error"
            title={t("screen.admin.applications.requestChangesDecision.couldNotSendRequest")}
          >
            {errorMsg}
          </TeInlineAlert>
        ) : null}
        <AdminPanel
          title={t("screen.admin.applications.requestChangesDecision.messageToApplicant")}
        >
          <TeSelect
            label={t("screen.admin.applications.requestChangesDecision.messageLanguage")}
            options={LANGUAGE_OPTIONS()}
            value={language}
            onValueChange={setLanguage}
            supportingText={t(
              "screen.admin.applications.requestChangesDecision.useTheApplicantSLanguage",
            )}
          />
          <AdminDecisionForm
            reasonLabel={t(
              "screen.admin.applications.requestChangesDecision.messageToApplicantRequired",
            )}
            reasonHelp={t("screen.admin.applications.requestChangesDecision.sayExactlyWhatToFix")}
            submitLabel={t("screen.admin.applications.requestChangesDecision.sendRequest")}
            dialogTitle={t("screen.admin.applications.requestChangesDecision.sendThisRequestToThe")}
            dialogDescription={t(
              "screen.admin.applications.requestChangesDecision.theApplicantGets14Days",
            )}
            confirmLabel={t(
              "screen.admin.applications.requestChangesDecision.sendRequestConfirmLabel",
            )}
            extraValid={selected.length > 0}
            dialogEffect={
              <p className="te-caption">
                {t(
                  "screen.admin.applications.requestChangesDecision.applicationStateBecomesChangesRequested",
                )}
              </p>
            }
            cancel={{
              slug: "application-review-detail",
              label: t("screen.admin.applications.requestChangesDecision.cancel"),
            }}
            onConfirm={(reason) => handleConfirm(reason)}
          />
        </AdminPanel>
        <TeInlineAlert
          tone="info"
          title={t("screen.admin.applications.requestChangesDecision.responseDeadline")}
        >
          {t("screen.admin.applications.requestChangesDecision.deadlineNotice", {
            date: deadlineDate,
          })}
        </TeInlineAlert>
      </StatePreview>
    </AdminPage>
  );
}
