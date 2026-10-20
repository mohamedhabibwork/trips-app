// SCR-PUB-16 Deletion grace period (`/account/deletion`): the account is scheduled for deletion and
// signing in restores it (the server restores on sign-in inside the grace window). The end date is
// the `?graceEndsAt=` the deletion request returned; without it only the grace length is shown.
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { Button, StatusPill, TextButton } from "@/components/kit/controls";
import { formatDate } from "@/components/kit/format";
import { ActionRow, CenteredPanel, FactBox, Lead, PanelHeading } from "@/components/kit/layout";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

/** A valid ISO date from the search string, or null. */
export function readGraceEnd(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function DeletionGracePeriod() {
  const { t, locale, status, signOut } = useAuth();
  const navigate = useNavigate();
  const settingsQuery = useQuery(
    serverQueryOptions(orpc.auth.getAuthSettings, "auth/getAuthSettings", { input: undefined }),
  );
  const days = settingsQuery.data?.deletionGraceDays;
  const graceEnd = useRouterState({
    select: (state) => readGraceEnd((state.location.search as Record<string, unknown>).graceEndsAt),
  });

  const endsValue = graceEnd
    ? t("screen.public.deletionGrace.endsValue", {
        date: formatDate(graceEnd, locale),
        days: days ?? "",
      })
    : days !== undefined
      ? t("screen.public.deletionGrace.endsDaysOnly", { days })
      : "…";

  return (
    <CenteredPanel width={600}>
      <StatusPill tone="warning" icon="clock">
        {t("screen.public.deletionGrace.badge")}
      </StatusPill>
      <PanelHeading>{t("screen.public.deletionGrace.title")}</PanelHeading>
      <FactBox label={t("screen.public.deletionGrace.endsLabel")}>{endsValue}</FactBox>
      <Lead>{t("screen.public.deletionGrace.body")}</Lead>
      <ActionRow>
        <Button
          onClick={() =>
            void navigate({ to: status === "authenticated" ? "/" : pathFor("SCR-PUB-08") })
          }
        >
          {t("screen.public.deletionGrace.continue")}
        </Button>
        {status === "authenticated" ? (
          <TextButton onClick={() => void signOut()}>
            {t("screen.public.accountSuspended.signOut")}
          </TextButton>
        ) : null}
      </ActionRow>
    </CenteredPanel>
  );
}
