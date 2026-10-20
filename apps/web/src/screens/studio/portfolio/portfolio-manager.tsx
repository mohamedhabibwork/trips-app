// SCR-PHO-02 Portfolio manager: the allowance bar, the upload affordance and the photo grid
// (docs/design/web/PhoWebPortfolio.dc.html). The portfolio items themselves have no store yet, so
// the gallery is an honest empty state — the allowance is real (photographer profile + plan).
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/auth/auth-context";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import {
  NO_VALUE,
  StudioBadge,
  StudioButton,
  StudioCard,
  StudioEmpty,
  StudioLink,
  StudioNotice,
  StudioPage,
  StudioPageHeader,
} from "../studio-ui";
import { useStudioPlan } from "../studio-plan";

/** A portfolio needs at least 8 photos before the profile is shown to organizations. */
const PORTFOLIO_MINIMUM = 8;

type AllowanceState = "normal" | "low" | "full";

export function PortfolioManager() {
  const { t } = useAuth();
  const enabled = typeof window !== "undefined";
  const plan = useStudioPlan();

  // The profile carries the portfolio count; no portfolio-items query exists yet.
  void useQuery({
    ...serverQueryOptions(orpc.photographer.getProfile, "photographer/getProfile", {
      input: undefined,
      enabled,
      retry: false,
    }),
  });

  const count = plan.profile?.portfolioPhotoCount ?? 0;
  const max = plan.portfolioPhotosMax;
  const state: AllowanceState =
    max !== null && count >= max ? "full" : count < PORTFOLIO_MINIMUM ? "low" : "normal";
  const percent = max ? (count / max) * 100 : 0;
  const loading = plan.loading;

  if (loading) {
    return (
      <StudioPage>
        <StudioCard title={t("screen.studio.portfolio.allowance")}>
          <span className="text-sm text-[var(--te-ink-muted)]">
            {t("screen.studio.common.loading")}
          </span>
        </StudioCard>
      </StudioPage>
    );
  }

  return (
    <StudioPage>
      <StudioPageHeader
        title={t("screen.studio.portfolio.title")}
        caption={t("screen.studio.portfolio.caption")}
        badge={
          <StudioBadge
            tone={state === "full" ? "err" : state === "low" ? "warn" : "ok"}
            icon={false}
          >
            {t(`screen.studio.portfolio.mode.${state}`)}
          </StudioBadge>
        }
        actions={
          <span className="flex items-center gap-3">
            {state === "full" ? (
              <span className="text-sm text-[var(--te-ink-muted)]">
                {t("screen.studio.common.planGateNote")}
              </span>
            ) : null}
            <StudioButton disabled={true}>{t("screen.studio.portfolio.upload")}</StudioButton>
          </span>
        }
      />

      <div className="flex flex-wrap items-stretch gap-4">
        <StudioCard title={t("screen.studio.portfolio.allowance")} className="min-w-[280px] flex-1">
          <span className="flex justify-between text-sm text-[var(--te-ink-muted)]">
            <span>
              {t("screen.studio.portfolio.allowancePlan", {
                plan: plan.tier ? t(`component.shell.studio.plan.${plan.tier}`) : NO_VALUE,
              })}
            </span>
            <b className="text-[var(--te-ink)]">
              {count} {max ? t("screen.studio.home.kpi.ofCount", { count: max }) : ""}
            </b>
          </span>
          <span
            role="progressbar"
            aria-label={t("screen.studio.portfolio.allowance")}
            aria-valuenow={count}
            aria-valuemin={0}
            aria-valuemax={max ?? 100}
            className="flex h-2 overflow-hidden rounded-full bg-[var(--te-hairline)]"
          >
            <span
              className={`rounded-full ${
                state === "full"
                  ? "bg-[var(--te-danger)]"
                  : state === "low"
                    ? "bg-[var(--te-warning)]"
                    : "bg-[var(--te-ink)]"
              }`}
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </span>
          <span className="text-[13px] text-[var(--te-ink-muted)]">
            {t("screen.studio.portfolio.allowanceLadder")}
          </span>
        </StudioCard>

        {state === "low" ? (
          <StudioNotice
            tone="warn"
            title={t("screen.studio.portfolio.lowTitle", { count: PORTFOLIO_MINIMUM - count })}
            className="min-w-[280px] flex-[2]"
          >
            <p className="m-0 text-sm leading-5">{t("screen.studio.portfolio.lowBody")}</p>
          </StudioNotice>
        ) : null}
        {state === "full" ? (
          <StudioNotice
            tone="err"
            title={t("screen.studio.portfolio.fullTitle", { count, max: max ?? 0 })}
            className="min-w-[280px] flex-[2]"
          >
            <p className="m-0 text-sm leading-5">{t("screen.studio.portfolio.fullBody")}</p>
          </StudioNotice>
        ) : null}
        {state === "normal" ? (
          <StudioCard className="min-w-[280px] flex-[2]">
            <span className="text-base font-semibold">
              {t("screen.studio.portfolio.dropTitle")}
            </span>
            <span className="text-sm text-[var(--te-ink-muted)]">
              {t("screen.studio.portfolio.dropBody")}
            </span>
          </StudioCard>
        ) : null}
      </div>

      <StudioNotice tone="info" title={t("screen.studio.portfolio.galleryTitle")}>
        <p className="m-0 text-sm leading-5">{t("screen.studio.portfolio.galleryBody")}</p>
      </StudioNotice>

      <StudioCard
        title={t("screen.studio.portfolio.gridTitle", { count })}
        actions={
          <span className="text-[13px] text-[var(--te-ink-muted)]">
            {t("screen.studio.portfolio.gridCaption")}
          </span>
        }
      >
        {count === 0 ? (
          <StudioEmpty title={t("screen.studio.portfolio.gridEmptyTitle")}>
            {t("screen.studio.portfolio.gridEmptyBody")}{" "}
            <StudioLink to={pathFor("SCR-PHO-03")}>
              {t("screen.studio.portfolio.gridEmptyLink")}
            </StudioLink>
          </StudioEmpty>
        ) : (
          <StudioEmpty title={t("screen.studio.portfolio.gridPendingTitle")}>
            {t("screen.studio.portfolio.gridPendingBody", { count })}
          </StudioEmpty>
        )}
      </StudioCard>
    </StudioPage>
  );
}
