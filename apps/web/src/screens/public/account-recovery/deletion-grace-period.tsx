import { Link } from "@tanstack/react-router";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { t } from "@trips-app/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { buttonLinkClass } from "../../shared/button-link";
import { AuthFrame } from "../common/auth-frame";

/** Account in the 30-day deletion grace period. Signing in restores the account. */
export function DeletionGracePeriod() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery(orpc.auth.getAuthSettings.queryOptions({ input: undefined }));
  const days = settingsQuery.data?.deletionGraceDays ?? 30;
  const graceEndLabel = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const restoreMutation = useMutation(
    orpc.auth.restoreAccountFromDeletion.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );

  const handleRestore = () => {
    const target =
      typeof sessionStorage !== "undefined" ? sessionStorage.getItem("te:lastOtpTarget") : null;
    if (!target) return;
    void restoreMutation.mutateAsync({ identifier: target }).catch(() => {});
  };

  return (
    <AuthFrame
      title={t("screen.public.accountRecovery.deletionGracePeriod.deletionGracePeriod")}
      description={t("screen.public.accountRecovery.deletionGracePeriod.yourAccountIsInThe")}
    >
      <TeKpiTile
        label={t("screen.public.accountRecovery.deletionGracePeriod.gracePeriodEnds")}
        value={graceEndLabel}
        hint={t("screen.public.accountRecovery.deletionGracePeriod.30DaysAfterTheDeletion")}
      />
      <TeInlineAlert
        tone="info"
        title={t("screen.public.accountRecovery.deletionGracePeriod.signInToRestore")}
      >
        {t("screen.public.accountRecovery.deletionGracePeriod.signingInRestoresYourAccount")}
      </TeInlineAlert>
      <p className="te-body">
        {t("screen.public.accountRecovery.deletionGracePeriod.ifTheDeletionBecomesPermanent")}
      </p>
      <div>
        <Link to="/" className={buttonLinkClass("primary", "lg")} onClick={handleRestore}>
          {t("screen.public.accountRecovery.deletionGracePeriod.continueToAppHome")}
        </Link>
      </div>
    </AuthFrame>
  );
}
