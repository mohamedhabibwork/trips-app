// SCR-ADM-09 Suspend or reinstate (docs/design/web/admin/SCR-ADM-09.dc.html): stop or restore an
// account's access with a required reason and an acknowledgement. The page suspends an active
// account and reinstates a suspended one; the side column states the effect.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { trackEvent } from "@/utils/analytics";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { AdminButton, AdminLink, useAdminNavigate, useAdminParam } from "../common/admin-actions";
import { AdminCheckbox, AdminTextarea } from "../common/admin-form";
import { getSelectedAdminEntityId } from "../common/admin-selection";
import { AdminQueryState } from "../common/admin-states";
import { AdminAlert, AdminCard, AdminLines, AdminPage, AdminSplit } from "../common/admin-ui";
import { NoEntitySelected, entityName } from "./directory-shared";

const REASON_MIN_LENGTH = 5;
const REASON_MAX_LENGTH = 500;

interface DecisionCopy {
  title: string;
  description: string;
  submit: string;
  acknowledge: string;
  effects: readonly string[];
  notice: string;
}

function suspendCopy(name: string): DecisionCopy {
  return {
    title: t("screen.admin.directory.suspendOrReinstateDecision.suspendTitle"),
    description: t("screen.admin.directory.suspendOrReinstateDecision.suspendDescription", {
      name,
    }),
    submit: t("screen.admin.directory.suspendOrReinstateDecision.suspendAccess"),
    acknowledge: t("screen.admin.directory.suspendOrReinstateDecision.suspendAcknowledge"),
    effects: [
      t("screen.admin.directory.suspendOrReinstateDecision.suspendEffectAccess"),
      t("screen.admin.directory.suspendOrReinstateDecision.suspendEffectData"),
      t("screen.admin.directory.suspendOrReinstateDecision.effectAudit"),
    ],
    notice: t("screen.admin.directory.suspendOrReinstateDecision.suspendNotice"),
  };
}

function reinstateCopy(name: string): DecisionCopy {
  return {
    title: t("screen.admin.directory.suspendOrReinstateDecision.reinstateTitle"),
    description: t("screen.admin.directory.suspendOrReinstateDecision.reinstateDescription", {
      name,
    }),
    submit: t("screen.admin.directory.suspendOrReinstateDecision.reinstateAccess"),
    acknowledge: t("screen.admin.directory.suspendOrReinstateDecision.reinstateAcknowledge"),
    effects: [
      t("screen.admin.directory.suspendOrReinstateDecision.reinstateEffectAccess"),
      t("screen.admin.directory.suspendOrReinstateDecision.reinstateEffectData"),
      t("screen.admin.directory.suspendOrReinstateDecision.effectAudit"),
    ],
    notice: t("screen.admin.directory.suspendOrReinstateDecision.reinstateNotice"),
  };
}

export function SuspendOrReinstateDecision() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const goTo = useAdminNavigate();
  const entityId = useAdminParam("entityId", getSelectedAdminEntityId);
  const [reason, setReason] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const detailQuery = useQuery({
    ...serverQueryOptions(orpc.onboarding.getApplicationDetail, "onboarding/getApplicationDetail", {
      input: { applicationId: entityId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(entityId),
  });

  const onDecided = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: orpc.auth.key() }),
      queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() }),
    ]);
    if (entityId) await goTo("SCR-ADM-08", { entityId });
  };
  const suspendMutation = useMutation(
    serverMutationOptions(orpc.auth.suspendAccount, "auth/suspendAccount", {
      onSuccess: () => {
        trackEvent("account_suspended", { surface: "admin" });
        onDecided();
      },
      onError: () => trackEvent("account_suspend_failed", { surface: "admin" }),
    }),
  );
  const reinstateMutation = useMutation(
    serverMutationOptions(orpc.auth.reinstateAccount, "auth/reinstateAccount", {
      onSuccess: () => {
        trackEvent("account_reinstated", { surface: "admin" });
        onDecided();
      },
      onError: () => trackEvent("account_reinstate_failed", { surface: "admin" }),
    }),
  );

  if (!entityId) {
    return (
      <AdminPage title={t("screen.admin.directory.suspendOrReinstateDecision.suspendTitle")}>
        <NoEntitySelected />
      </AdminPage>
    );
  }

  const detail = detailQuery.data;
  const application = detail?.application;
  const name = application ? entityName({ ...application, applicant: detail?.applicant }) : "—";
  const isReinstate = detail?.applicant?.status === "suspended";
  const copy = isReinstate ? reinstateCopy(name) : suspendCopy(name);
  const mutation = isReinstate ? reinstateMutation : suspendMutation;
  const trimmedReason = reason.trim();
  const canSubmit =
    Boolean(application) &&
    trimmedReason.length >= REASON_MIN_LENGTH &&
    acknowledged &&
    !mutation.isPending;

  const submit = () => {
    if (!application || !canSubmit) return;
    mutation.mutate({ targetAccountId: application.applicantAccountId, reason: trimmedReason });
  };

  return (
    <AdminPage
      title={copy.title}
      description={copy.description}
      actions={
        <>
          <AdminLink screen="SCR-ADM-08" params={{ entityId }} variant="secondary">
            {t("screen.admin.directory.suspendOrReinstateDecision.cancel")}
          </AdminLink>
          <AdminButton
            variant={isReinstate ? "primary" : "danger"}
            disabled={!canSubmit}
            onClick={submit}
          >
            {copy.submit}
          </AdminButton>
        </>
      }
    >
      <AdminQueryState
        query={detailQuery}
        loadingLabel={t("screen.admin.directory.suspendOrReinstateDecision.loading")}
      >
        {mutation.isError ? (
          <AdminAlert
            tone="danger"
            title={t("screen.admin.directory.suspendOrReinstateDecision.notSaved")}
          >
            {t("screen.admin.directory.suspendOrReinstateDecision.notSavedBody")}
          </AdminAlert>
        ) : null}
        <AdminSplit
          main={
            <AdminCard title={t("screen.admin.directory.suspendOrReinstateDecision.reason")}>
              <AdminTextarea
                label={t("screen.admin.directory.suspendOrReinstateDecision.reasonRequired")}
                placeholder={
                  isReinstate
                    ? t("screen.admin.directory.suspendOrReinstateDecision.reinstatePlaceholder")
                    : t("screen.admin.directory.suspendOrReinstateDecision.suspendPlaceholder")
                }
                help={t("screen.admin.directory.suspendOrReinstateDecision.reasonHelp", {
                  min: String(REASON_MIN_LENGTH),
                })}
                value={reason}
                maxLength={REASON_MAX_LENGTH}
                required
                onChange={(event) => setReason(event.target.value)}
              />
              <AdminCheckbox
                label={copy.acknowledge}
                checked={acknowledged}
                onCheckedChange={setAcknowledged}
              />
            </AdminCard>
          }
          side={
            <>
              <AdminCard title={t("screen.admin.directory.suspendOrReinstateDecision.effect")}>
                <AdminLines lines={copy.effects} />
              </AdminCard>
              <AdminAlert tone={isReinstate ? "info" : "warning"}>{copy.notice}</AdminAlert>
            </>
          }
        />
      </AdminQueryState>
    </AdminPage>
  );
}
