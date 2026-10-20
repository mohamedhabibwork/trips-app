// SCR-PHO-12 Studio coupons: the photographer's own codes for trips they are assigned to
// (docs/design/web/PhoWebCoupons.dc.html). A photographer-coupon store has no service yet — the
// platform coupon procedures are admin- or booking-scoped — so the list and the form render the
// design's structure over an honest empty state, with the real plan allowance beside them.
import { useAuth } from "@/auth/auth-context";
import type { ReactNode } from "react";
import { TeIcon } from "@trips-app/ui/components/te-icon";

import {
  NO_VALUE,
  StudioButton,
  StudioCard,
  StudioEmpty,
  StudioPage,
  StudioPageHeader,
  StudioRow,
} from "../studio-ui";
import { useStudioPlan } from "../studio-plan";

export function StudioCoupons() {
  const { t } = useAuth();
  const plan = useStudioPlan();
  const max = plan.activeCouponsMax;

  return (
    <StudioPage>
      <StudioPageHeader
        title={t("screen.studio.coupons.title")}
        caption={t("screen.studio.coupons.caption")}
        badge={
          <StudioBadgePill
            value={`0 ${max ? t("screen.studio.coupons.usageOf", { max }) : ""}`.trim()}
          />
        }
      />

      <StudioRow align="start">
        <StudioCard
          title={t("screen.studio.coupons.listTitle")}
          className="basis-[600px] lg:flex-[3]"
        >
          <StudioEmpty title={t("screen.studio.coupons.emptyTitle")}>
            {t("screen.studio.coupons.emptyBody", {
              max: max !== null ? max : t("screen.studio.coupons.maxUnlimited"),
            })}
          </StudioEmpty>
        </StudioCard>

        <StudioCard
          title={t("screen.studio.coupons.formTitle")}
          className="basis-[360px] lg:flex-[2]"
        >
          <NoticeBox>{t("screen.studio.coupons.scopeNote")}</NoticeBox>
          <label className="flex flex-col gap-1 text-sm leading-5">
            <span className="font-semibold">{t("screen.studio.coupons.fieldCode")}</span>
            <input
              disabled={true}
              placeholder="SIWAFAMILY"
              className="h-12 rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface)] px-3.5 text-base font-semibold tracking-wide placeholder:font-normal"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm leading-5">
              <span className="font-semibold">{t("screen.studio.coupons.fieldType")}</span>
              <select
                disabled={true}
                className="h-12 rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface)] px-3 text-base"
              >
                <option>{t("screen.studio.coupons.typePercent")}</option>
                <option>{t("screen.studio.coupons.typeFixed")}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm leading-5">
              <span className="font-semibold">{t("screen.studio.coupons.fieldValue")}</span>
              <input
                disabled={true}
                inputMode="numeric"
                placeholder="10"
                className="h-12 rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface)] px-3.5 text-base"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm leading-5">
              <span className="font-semibold">{t("screen.studio.coupons.fieldUses")}</span>
              <input
                disabled={true}
                inputMode="numeric"
                placeholder="25"
                className="h-12 rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface)] px-3.5 text-base"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm leading-5">
              <span className="font-semibold">{t("screen.studio.coupons.fieldEnds")}</span>
              <input
                disabled={true}
                type="date"
                className="h-12 rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface)] px-3 text-base"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <StudioButton disabled={true}>{t("screen.studio.coupons.create")}</StudioButton>
            <StudioButton variant="secondary" disabled={true}>
              {t("screen.studio.coupons.saveDraft")}
            </StudioButton>
          </div>
          <span className="text-[13px] text-[var(--te-ink-muted)]">
            {t("screen.studio.coupons.formNote", {
              plan: plan.tier ? t(`component.shell.studio.plan.${plan.tier}`) : NO_VALUE,
            })}
          </span>
        </StudioCard>
      </StudioRow>
    </StudioPage>
  );
}

function StudioBadgePill({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--te-info-soft)] px-2.5 py-1 text-[13px] font-semibold">
      {value}
    </span>
  );
}

function NoticeBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[var(--te-radius-md)] bg-[var(--te-info-soft)] px-3.5 py-3 text-sm leading-5">
      <TeIcon name="lock" className="mt-0.5 size-4 shrink-0" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}
