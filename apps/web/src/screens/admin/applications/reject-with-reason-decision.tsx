import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { getSelectedAdminApplicationId } from "@/screens/onboarding-state";
import { orpc } from "@/utils/orpc";
import { AdminDecisionForm } from "../common/admin-decision-form";
import { StatePreview } from "../common/admin-state-preview";
import { useAdminNavigate } from "../common/admin-links";
import { AdminFacts, AdminPage, AdminPanel } from "../common/admin-shared";

export function RejectWithReasonDecision() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
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
  const applicationType = detailQuery.data?.application.applicationType ?? "-";

  const rejectMutation = useMutation(
    orpc.onboarding.rejectApplication.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );

  async function handleConfirm(reason: string) {
    const targetAppId = getSelectedAdminApplicationId();
    if (authStatus === "authenticated" && targetAppId && !targetAppId.startsWith("app-")) {
      setErrorMsg(null);
      try {
        await rejectMutation.mutateAsync({
          applicationId: targetAppId,
          decisionReasonCode: "rejected_by_admin",
          decisionNotes: reason.length >= 5 ? reason : `${reason} (rejected by admin)`,
        });
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not reject application.");
        return;
      }
    }
    await goTo("application-queue");
  }

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.applications.rejectWithReasonDecision.rejectWithReasonDecision")}
        description={t(
          "screen.admin.applications.rejectWithReasonDecision.rejectThisApplicationTheApplicant",
        )}
      />
      <StatePreview
        emptyTitle={t("screen.admin.applications.rejectWithReasonDecision.noReasonEntered")}
        emptyDescription={t(
          "screen.admin.applications.rejectWithReasonDecision.enterAReasonBeforeYou",
        )}
        loadingLabel={t("screen.admin.applications.rejectWithReasonDecision.loadingTheApplication")}
      >
        <AdminPanel title={t("screen.admin.applications.rejectWithReasonDecision.applicant")}>
          <AdminFacts
            items={[
              {
                label: t("screen.admin.applications.rejectWithReasonDecision.applicantName"),
                value: applicantName,
              },
              {
                label: t("screen.admin.applications.rejectWithReasonDecision.applicationType"),
                value: applicationType,
              },
            ]}
          />
        </AdminPanel>
        {errorMsg ? (
          <TeInlineAlert
            tone="error"
            title={t(
              "screen.admin.applications.rejectWithReasonDecision.couldNotRejectApplication",
            )}
          >
            {errorMsg}
          </TeInlineAlert>
        ) : null}
        <AdminPanel title={t("screen.admin.applications.rejectWithReasonDecision.reason")}>
          <AdminDecisionForm
            reasonLabel={t(
              "screen.admin.applications.rejectWithReasonDecision.reasonForRejectionRequired",
            )}
            reasonHelp={t(
              "screen.admin.applications.rejectWithReasonDecision.reasonCodesAreProposedD",
            )}
            submitLabel={t("screen.admin.applications.rejectWithReasonDecision.rejectApplication")}
            dialogTitle={t(
              "screen.admin.applications.rejectWithReasonDecision.rejectThisApplication",
            )}
            dialogDescription={t(
              "screen.admin.applications.rejectWithReasonDecision.theApplicantIsToldThe",
            )}
            confirmLabel={t(
              "screen.admin.applications.rejectWithReasonDecision.rejectApplicationConfirmLabel",
            )}
            tone="danger"
            cancel={{
              slug: "application-review-detail",
              label: t("screen.admin.applications.rejectWithReasonDecision.cancel"),
            }}
            onConfirm={(reason) => handleConfirm(reason)}
          />
        </AdminPanel>
        <TeInlineAlert
          tone="info"
          title={t("screen.admin.applications.rejectWithReasonDecision.whatTheApplicantCanDo")}
        >
          {t("screen.admin.applications.rejectWithReasonDecision.theApplicantCanReApply")}
        </TeInlineAlert>
      </StatePreview>
    </AdminPage>
  );
}
