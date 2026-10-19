// SCR-ORG-28 Coupon editor: create a coupon for this organization's trips, or view a saved one.
// `/business/coupons/new` creates; a saved coupon's address shows it read-only (the service has no edit).
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, useOrgNavigate, useOrgParams } from "../common/org-link";
import { getSelectedTripId, getSelectedCouponId, isoDay, tripTitle } from "../common/org-shared";
import {
  NO_VALUE,
  OrgAlert,
  OrgButton,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
} from "../common/org-ui";
import {
  CouponFormCards,
  EMPTY_COUPON_FORM,
  discountTypeOf,
  type CouponForm,
} from "./coupon-editor-form";
import { CouponStatusBadge, NEW_COUPON_ID, countedText, couponPlanLimit } from "./coupon-parts";

const MIN_CODE_LENGTH = 3;

interface SavedCoupon {
  code: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  maxRedemptions: number | null;
  minOrderMinor: number;
  startsAt: string | Date | null;
  expiresAt: string | Date | null;
}

function formFromCoupon(coupon: SavedCoupon): CouponForm {
  const percentage = coupon.discountType === "percentage";
  return {
    ...EMPTY_COUPON_FORM,
    code: coupon.code,
    kind: percentage ? "percentage" : "fixed-amount",
    value: percentage ? String(coupon.discountValue) : (coupon.discountValue / 100).toFixed(2),
    totalLimit: coupon.maxRedemptions === null ? "" : String(coupon.maxRedemptions),
    validFrom: isoDay(coupon.startsAt) ?? "",
    validUntil: isoDay(coupon.expiresAt) ?? "",
    minBookingValue: coupon.minOrderMinor > 0 ? (coupon.minOrderMinor / 100).toFixed(2) : "",
  };
}

function positiveInt(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function CouponEditor() {
  const goTo = useOrgNavigate();
  const queryClient = useQueryClient();
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const { couponId: routeCouponId } = useOrgParams();
  const couponId =
    routeCouponId === NEW_COUPON_ID ? null : (routeCouponId ?? getSelectedCouponId());
  const [edits, setEdits] = useState<CouponForm>(EMPTY_COUPON_FORM);
  const [showErrors, setShowErrors] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const couponsQuery = useQuery({
    ...orpc.coupons.listOrganizationCoupons.queryOptions({ input: {} }),
    enabled,
  });
  const subscriptionQuery = useQuery({
    ...orpc.plans.getOrganizationSubscription.queryOptions({ input: undefined }),
    enabled,
  });
  const tripId = getSelectedTripId();
  const programsQuery = useQuery({
    ...orpc.programs.listTripPrograms.queryOptions({ input: { tripId: tripId ?? "" } }),
    enabled: enabled && Boolean(tripId),
  });

  const createCouponMutation = useMutation(
    orpc.coupons.createOrganizationCoupon.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.coupons.key() });
      },
    }),
  );
  const updateStatusMutation = useMutation(
    orpc.coupons.updateStatus.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.coupons.key() });
      },
    }),
  );

  const coupons = couponsQuery.data?.items ?? [];
  const saved = couponId ? coupons.find((coupon) => coupon.id === couponId) : undefined;
  const form = saved ? formFromCoupon(saved) : edits;
  const counted = couponsQuery.isSuccess
    ? coupons.filter((coupon) => coupon.status !== "expired").length
    : null;
  const programOptions = [
    { value: "all", label: t("screen.organization.coupons.couponEditor.allPrograms") },
    ...(programsQuery.data?.items ?? []).map((program) => ({
      value: program.id,
      label: tripTitle(program, locale) || NO_VALUE,
    })),
  ];
  const busy = createCouponMutation.isPending || updateStatusMutation.isPending;
  const codeError =
    showErrors && form.code.trim().length < MIN_CODE_LENGTH
      ? t("screen.organization.coupons.couponEditor.codeTooShort")
      : undefined;

  async function handleSave(asDraft: boolean) {
    const code = form.code.trim();
    if (code.length < MIN_CODE_LENGTH) {
      setShowErrors(true);
      return;
    }
    setSaveFailed(false);
    const percentage = discountTypeOf(form.kind) === "percentage";
    const rawValue = Number.parseFloat(form.value) || 0;
    const minOrder = Number.parseFloat(form.minBookingValue);
    try {
      const created = await createCouponMutation.mutateAsync({
        code,
        titleAr: code,
        titleEn: code,
        discountType: percentage ? "percentage" : "fixed_amount",
        discountValue: Math.max(1, Math.round(percentage ? rawValue : rawValue * 100)),
        maxRedemptions: positiveInt(form.totalLimit),
        minOrderMinor:
          Number.isFinite(minOrder) && minOrder >= 0 ? Math.round(minOrder * 100) : undefined,
        startsAt: form.validFrom ? `${form.validFrom}T00:00:00.000Z` : null,
        expiresAt: form.validUntil ? `${form.validUntil}T23:59:59.000Z` : null,
      });
      if (asDraft && created?.id) {
        await updateStatusMutation.mutateAsync({ couponId: created.id, status: "paused" });
      }
      void goTo("coupons-list");
    } catch {
      setSaveFailed(true);
    }
  }

  if (couponId && couponsQuery.isLoading) return <OrgLoading rows={6} />;

  return (
    <OrgPage className="gap-5">
      <OrgPageHeader
        title={
          saved
            ? t("screen.organization.coupons.couponEditor.couponTitle", { code: saved.code })
            : t("screen.organization.coupons.couponEditor.createCoupon")
        }
        badge={saved ? <CouponStatusBadge status={saved.status} /> : null}
        caption={t("screen.organization.coupons.couponEditor.caption", {
          counted: countedText(counted, couponPlanLimit(subscriptionQuery.data)),
        })}
        actions={
          saved ? (
            <OrgButtonLink
              slug="coupon-analytics"
              params={{ couponId: saved.id }}
              variant="secondary"
            >
              {t("screen.organization.coupons.couponEditor.viewAnalytics")}
            </OrgButtonLink>
          ) : (
            <>
              <OrgButton
                variant="secondary"
                disabled={busy || !enabled}
                onClick={() => void handleSave(true)}
              >
                {t("screen.organization.coupons.couponEditor.saveAsDraft")}
              </OrgButton>
              <OrgButton disabled={busy || !enabled} onClick={() => void handleSave(false)}>
                {t("screen.organization.coupons.couponEditor.saveCoupon")}
              </OrgButton>
            </>
          )
        }
      />
      {couponsQuery.isError && couponId ? (
        <OrgError onRetry={() => void couponsQuery.refetch()} />
      ) : null}
      {couponId && couponsQuery.isSuccess && !saved ? (
        <OrgAlert tone="warn" title={t("screen.organization.coupons.couponEditor.notFoundTitle")}>
          {t("screen.organization.coupons.couponEditor.notFoundBody")}
        </OrgAlert>
      ) : null}
      {saved ? (
        <OrgAlert tone="info" title={t("screen.organization.coupons.couponEditor.savedTitle")}>
          {t("screen.organization.coupons.couponEditor.savedBody")}
        </OrgAlert>
      ) : null}
      {saveFailed ? (
        <OrgAlert tone="err" title={t("screen.organization.coupons.couponEditor.saveFailed")}>
          {t("screen.organization.coupons.couponEditor.saveFailedBody")}
        </OrgAlert>
      ) : null}
      <CouponFormCards
        form={form}
        onChange={(patch) => setEdits((previous) => ({ ...previous, ...patch }))}
        programs={programOptions}
        readOnly={Boolean(saved)}
        codeError={codeError}
      />
      <OrgAlert tone="info">{t("screen.organization.coupons.couponEditor.draftNote")}</OrgAlert>
    </OrgPage>
  );
}
