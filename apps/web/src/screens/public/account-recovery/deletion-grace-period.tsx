// SCR-PUB-16 Deletion grace period (`/account/deletion`): the account is scheduled for deletion and
// signing in restores it. The end date comes from `?graceEndsAt=`, else from the grace length.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, StatusPill, TextButton } from "@/components/kit/controls";
import { formatDate } from "@/components/kit/format";
import { ActionRow, CenteredPanel, FactBox, Lead, PanelHeading } from "@/components/kit/layout";
import { orpc } from "@/utils/orpc";

const DEFAULT_GRACE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const LAST_TARGET_KEY = "te:lastOtpTarget";

export function DeletionGracePeriod() {
  const { t, locale, status, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const settingsQuery = useQuery(orpc.auth.getAuthSettings.queryOptions({ input: undefined }));
  const days = settingsQuery.data?.deletionGraceDays ?? DEFAULT_GRACE_DAYS;
  const graceEndsAt = useRouterState({
    select: (state) => {
      const value = (state.location.search as Record<string, unknown>).graceEndsAt;
      return typeof value === "string" ? value : null;
    },
  });
  const graceEnd = formatDate(graceEndsAt ?? new Date(Date.now() + days * DAY_MS), locale);

  const restoreMutation = useMutation(
    orpc.auth.restoreAccountFromDeletion.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );

  async function handleContinue() {
    const target =
      typeof sessionStorage !== "undefined" ? sessionStorage.getItem(LAST_TARGET_KEY) : null;
    if (target) {
      try {
        await restoreMutation.mutateAsync({ identifier: target });
      } catch {
        return;
      }
    }
    await navigate({ to: "/" });
  }

  return (
    <CenteredPanel width={600}>
      <StatusPill tone="warning" icon="clock">
        {t("screen.public.deletionGrace.badge")}
      </StatusPill>
      <PanelHeading>{t("screen.public.deletionGrace.title")}</PanelHeading>
      <FactBox label={t("screen.public.deletionGrace.endsLabel")}>
        {t("screen.public.deletionGrace.endsValue", { date: graceEnd, days })}
      </FactBox>
      <Lead>{t("screen.public.deletionGrace.body")}</Lead>
      {restoreMutation.isError ? (
        <Notice tone="danger">{t("screen.public.deletionGrace.restoreFailed")}</Notice>
      ) : null}
      <ActionRow>
        <Button onClick={() => void handleContinue()} disabled={restoreMutation.isPending}>
          {t("screen.public.deletionGrace.continue")}
        </Button>
        {status === "authenticated" ? (
          <TextButton onClick={() => void signOut().then(() => navigate({ to: "/" }))}>
            {t("screen.public.accountSuspended.signOut")}
          </TextButton>
        ) : null}
      </ActionRow>
    </CenteredPanel>
  );
}
