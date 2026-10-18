// SCR-SHR-07 Maintenance page (`/maintenance?from=…&until=…`): the planned window in the viewer's
// time zone, the same notice in the other language, and a retry that opens when the window ends.
import { useRouterState } from "@tanstack/react-router";
import { t as translate } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { Button, StatusPill } from "@/components/kit/controls";
import { formatDateTime } from "@/components/kit/format";
import { ActionRow, CenteredPanel, FactBox, Lead, PanelHeading } from "@/components/kit/layout";

function readIso(search: Record<string, unknown>, key: string): Date | null {
  const value = search[key];
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function ScrShr07MaintenancePage() {
  const { t, locale } = useAuth();
  const { from, until } = useRouterState({
    select: (state) => {
      const search = state.location.search as Record<string, unknown>;
      return { from: readIso(search, "from"), until: readIso(search, "until") };
    },
  });
  const otherLocale = locale === "ar" ? "en" : "ar";
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const stillClosed = until !== null && until.getTime() > Date.now();

  return (
    <CenteredPanel width={640}>
      <StatusPill tone="warning" icon="clock">
        {t("screen.shared.maintenance.badge")}
      </StatusPill>
      <PanelHeading>{t("screen.shared.maintenance.title")}</PanelHeading>
      {from && until ? (
        <FactBox label={t("screen.shared.maintenance.window")}>
          <span dir="auto">
            {t("screen.shared.maintenance.windowValue", {
              from: formatDateTime(from, locale),
              until: formatDateTime(until, locale),
              zone: timeZone,
            })}
          </span>
        </FactBox>
      ) : null}
      <p
        lang={otherLocale}
        dir={otherLocale === "ar" ? "rtl" : "ltr"}
        className="m-0 text-base leading-7 font-medium text-[var(--te-ink-muted)]"
      >
        {translate("screen.shared.maintenance.otherLanguage", otherLocale)}
      </p>
      <Lead>{t("screen.shared.maintenance.payments")}</Lead>
      <ActionRow>
        <Button disabled={stillClosed} onClick={() => window.location.reload()}>
          {stillClosed && until
            ? t("screen.shared.maintenance.retryAfter", { time: formatDateTime(until, locale) })
            : t("screen.shared.errorPage.tryAgain")}
        </Button>
      </ActionRow>
    </CenteredPanel>
  );
}
