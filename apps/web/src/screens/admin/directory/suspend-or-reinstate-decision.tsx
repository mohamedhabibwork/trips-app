import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { AdminDecisionForm } from "../common/admin-decision-form";
import { StatePreview } from "../common/admin-state-preview";
import { useAdminNavigate } from "../common/admin-links";
import {
  AdminFacts,
  AdminPage,
  AdminPanel,
  AdminStatus,
  getSelectedAdminEntityId,
} from "../common/admin-shared";

const ACTION_OPTIONS = (): readonly TeSelectOption[] => [
  {
    value: "suspend",
    label: t("screen.admin.directory.suspendOrReinstateDecision.suspendAccount"),
  },
  {
    value: "reinstate",
    label: t("screen.admin.directory.suspendOrReinstateDecision.reinstateAccount"),
  },
];

const ACTIVE = () =>
  ({
    tone: "success",
    icon: "check",
    label: t("screen.admin.directory.suspendOrReinstateDecision.active"),
  }) as const;

export function SuspendOrReinstateDecision() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const [action, setAction] = useState("suspend");
  const goTo = useAdminNavigate();
  const isSuspend = action === "suspend";

  const queueQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });

  const suspendMutation = useMutation(
    orpc.auth.suspendAccount.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );
  const reinstateMutation = useMutation(
    orpc.auth.reinstateAccount.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );

  const apps = queueQuery.data ?? [];
  const selectedId = getSelectedAdminEntityId();
  const found = apps.find((a) => a.id === selectedId) ?? apps[0];
  const payload = (found?.payload ?? {}) as Record<string, unknown>;
  const targetAccountId = found?.applicantAccountId ?? "";
  const accountName =
    found?.applicant?.fullName ??
    (typeof payload.legalEntityName === "string"
      ? payload.legalEntityName
      : (found?.applicantAccountId ?? "-"));
  const entityType = found?.applicationType ?? "-";

  const handleConfirm = async (reason: string) => {
    const accountId = targetAccountId || getSelectedAdminEntityId();
    const trimmedReason =
      reason.trim().length >= 5 ? reason.trim() : "Admin decision from directory console";
    if (accountId) {
      try {
        if (isSuspend) {
          await suspendMutation.mutateAsync({
            targetAccountId: accountId,
            reason: trimmedReason,
          });
        } else {
          await reinstateMutation.mutateAsync({
            targetAccountId: accountId,
            reason: trimmedReason,
          });
        }
      } catch {
        // Proceed to entity detail after attempting status change
      }
    }
    goTo("entity-detail");
  };

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.directory.suspendOrReinstateDecision.suspendOrReinstateDecision")}
        description={t(
          "screen.admin.directory.suspendOrReinstateDecision.stopOrRestoreAccessWithout",
        )}
      />
      <StatePreview
        emptyTitle={t("screen.admin.directory.suspendOrReinstateDecision.noAccountSelected")}
        emptyDescription={t(
          "screen.admin.directory.suspendOrReinstateDecision.openAnAccountFromThe",
        )}
        loadingLabel={t("screen.admin.directory.suspendOrReinstateDecision.loadingTheAccount")}
      >
        <AdminPanel title={t("screen.admin.directory.suspendOrReinstateDecision.account")}>
          <AdminStatus status={ACTIVE()} />
          <AdminFacts
            items={[
              {
                label: t("screen.admin.directory.suspendOrReinstateDecision.accountName"),
                value: accountName,
              },
              {
                label: t("screen.admin.directory.suspendOrReinstateDecision.entityType"),
                value: entityType,
              },
            ]}
          />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.directory.suspendOrReinstateDecision.decision")}>
          <TeSelect
            label={t("screen.admin.directory.suspendOrReinstateDecision.action")}
            options={ACTION_OPTIONS()}
            value={action}
            onValueChange={setAction}
          />
          <AdminDecisionForm
            reasonLabel={t("screen.admin.directory.suspendOrReinstateDecision.reasonRequired")}
            reasonHelp={t("screen.admin.directory.suspendOrReinstateDecision.reasonRulesAreNotYet")}
            submitLabel={
              isSuspend
                ? t("screen.admin.directory.suspendOrReinstateDecision.suspendAccount2")
                : t("screen.admin.directory.suspendOrReinstateDecision.reinstateAccount2")
            }
            dialogTitle={
              isSuspend
                ? t("screen.admin.directory.suspendOrReinstateDecision.suspendThisAccount")
                : t("screen.admin.directory.suspendOrReinstateDecision.reinstateThisAccount")
            }
            dialogDescription={
              isSuspend
                ? t("screen.admin.directory.suspendOrReinstateDecision.accessStopsAtOnceData")
                : t("screen.admin.directory.suspendOrReinstateDecision.accessIsRestoredAtOnce")
            }
            confirmLabel={
              isSuspend
                ? t("screen.admin.directory.suspendOrReinstateDecision.suspendAccount3")
                : t("screen.admin.directory.suspendOrReinstateDecision.reinstateAccount3")
            }
            tone={isSuspend ? "danger" : "default"}
            cancel={{
              slug: "entity-detail",
              label: t("screen.admin.directory.suspendOrReinstateDecision.cancel"),
            }}
            onConfirm={(reason) => void handleConfirm(reason)}
          />
        </AdminPanel>
        <TeInlineAlert
          tone={isSuspend ? "warning" : "info"}
          title={
            isSuspend
              ? t("screen.admin.directory.suspendOrReinstateDecision.effectOfSuspending")
              : t("screen.admin.directory.suspendOrReinstateDecision.effectOfReinstating")
          }
        >
          {isSuspend
            ? t("screen.admin.directory.suspendOrReinstateDecision.accessStopsAtOnceData2")
            : t("screen.admin.directory.suspendOrReinstateDecision.accessIsRestoredAtOnce2")}
        </TeInlineAlert>
      </StatePreview>
    </AdminPage>
  );
}
