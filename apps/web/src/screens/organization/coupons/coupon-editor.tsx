// SCR-ORG-28 Coupon editor: create a coupon for this organization's trips, or view a saved one.
// `/business/coupons/new` creates; a saved coupon's address shows it read-only (the service has no edit).
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";
import { zonedToUtcIso } from "@/utils/zoned-time";

import { OrgButtonLink, useOrgNavigate, useOrgParams } from "../common/org-link";
import { isoDay, tripTitle } from "../common/org-shared";
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
  type CouponFieldErrors,
  type CouponForm,
} from "./coupon-editor-form";
import { CouponStatusBadge, NEW_COUPON_ID, countedText } from "./coupon-parts";
import { useOrgPlan } from "../trips/trip-parts";

const MIN_CODE_LENGTH = 3;

interface SavedCoupon {
  code: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  maxRedemptions: number | null;
  minOrderMinor: number;
  currencyCode: string;
  tripId: string | null;
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
    currency:
      coupon.currencyCode === "SAR" || coupon.currencyCode === "AED" ? coupon.currencyCode : "EGP",
    tripId: coupon.tripId ?? "all",
    totalLimit: coupon.maxRedemptions === null ? "" : String(coupon.maxRedemptions),
    validFrom: isoDay(coupon.startsAt) ?? "",
    validUntil: isoDay(coupon.expiresAt) ?? "",
    minBookingValue: coupon.minOrderMinor > 0 ? (coupon.minOrderMinor / 100).toFixed(2) : "",
  };
}

const AMOUNT_PATTERN = /^\d{1,7}(\.\d{1,2})?$/;
const WHOLE_PATTERN = /^\d{1,7}$/;
const MAX_PERCENT = 100;

interface CouponInput {
  code: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  currencyCode?: "EGP" | "SAR" | "AED";
  maxRedemptions: number | null;
  minOrderMinor?: number;
  tripId: string | null;
  startsAt: string | null;
  expiresAt: string | null;
}

/**
 * Checks the form and builds the create input. Dates are whole days in the organization's time
 * zone. Returns the field errors when something is not valid; nothing is coerced.
 */
function readCoupon(
  form: CouponForm,
  timeZone: string,
): { input: CouponInput | null; errors: CouponFieldErrors } {
  const errors: CouponFieldErrors = {};
  const code = form.code.trim();
  if (code.length < MIN_CODE_LENGTH)
    errors.code = t("screen.organization.coupons.couponEditor.codeTooShort");
  const percentage = discountTypeOf(form.kind) === "percentage";
  const valueText = form.value.trim();
  const discountValue = percentage
    ? WHOLE_PATTERN.test(valueText)
      ? Number(valueText)
      : 0
    : AMOUNT_PATTERN.test(valueText)
      ? Math.round(Number(valueText) * 100)
      : 0;
  if (discountValue < 1 || (percentage && discountValue > MAX_PERCENT)) {
    errors.value = percentage
      ? t("screen.organization.coupons.couponEditor.percentInvalid")
      : t("screen.organization.coupons.couponEditor.amountInvalid");
  }
  const limitText = form.totalLimit.trim();
  if (limitText && (!WHOLE_PATTERN.test(limitText) || Number(limitText) < 1)) {
    errors.totalLimit = t("screen.organization.coupons.couponEditor.limitInvalid");
  }
  const minText = form.minBookingValue.trim();
  if (minText && !AMOUNT_PATTERN.test(minText))
    errors.minBookingValue = t("screen.organization.coupons.couponEditor.amountInvalid");
  const startsAt = form.validFrom
    ? zonedToUtcIso({ date: form.validFrom, time: "00:00" }, timeZone)
    : null;
  const expiresAt = form.validUntil
    ? zonedToUtcIso({ date: form.validUntil, time: "23:59" }, timeZone)
    : null;
  if (startsAt && expiresAt && expiresAt <= startsAt)
    errors.dates = t("screen.organization.coupons.couponEditor.datesInvalid");
  if (Object.keys(errors).length > 0) return { input: null, errors };
  return {
    errors,
    input: {
      code,
      discountType: percentage ? "percentage" : "fixed_amount",
      discountValue,
      currencyCode: percentage ? undefined : form.currency,
      maxRedemptions: limitText ? Number(limitText) : null,
      minOrderMinor: minText ? Math.round(Number(minText) * 100) : undefined,
      tripId: form.tripId === "all" ? null : form.tripId,
      startsAt,
      expiresAt,
    },
  };
}

export function CouponEditor() {
  const goTo = useOrgNavigate();
  const queryClient = useQueryClient();
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const { couponId: routeCouponId } = useOrgParams();
  const couponId = routeCouponId === NEW_COUPON_ID ? null : (routeCouponId ?? null);
  const [edits, setEdits] = useState<CouponForm>(EMPTY_COUPON_FORM);
  const [errors, setErrors] = useState<CouponFieldErrors>({});
  const { limits } = useOrgPlan();
  const [saveFailed, setSaveFailed] = useState(false);

  const couponsQuery = useQuery({
    ...serverQueryOptions(orpc.coupons.listOrganizationCoupons, "coupons/listOrganizationCoupons", {
      input: {},
    }),
    enabled,
  });
  const tripsQuery = useQuery({
    ...serverQueryOptions(orpc.trips.listOrganizationTrips, "trips/listOrganizationTrips", {
      input: {},
    }),
    enabled,
  });
  const settingsQuery = useQuery({
    ...serverQueryOptions(
      orpc.organization.getOrganizationSettings,
      "organization/getOrganizationSettings",
      { input: {} },
    ),
    enabled,
  });

  const createCouponMutation = useMutation(
    serverMutationOptions(
      orpc.coupons.createOrganizationCoupon,
      "coupons/createOrganizationCoupon",
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: orpc.coupons.key() });
        },
      },
    ),
  );
  const updateStatusMutation = useMutation(
    serverMutationOptions(orpc.coupons.updateStatus, "coupons/updateStatus", {
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
  const tripOptions = [
    { value: "all", label: t("screen.organization.coupons.couponEditor.allTrips") },
    ...(tripsQuery.data?.items ?? []).map((trip) => ({
      value: trip.id,
      label: tripTitle(trip, locale) || NO_VALUE,
    })),
  ];
  const busy = createCouponMutation.isPending || updateStatusMutation.isPending;

  async function handleSave(asDraft: boolean) {
    const timeZone = settingsQuery.data?.settings?.timeZone;
    if (!timeZone) {
      setSaveFailed(true);
      return;
    }
    const { input, errors: found } = readCoupon(form, timeZone);
    setErrors(found);
    if (!input) return;
    setSaveFailed(false);
    try {
      const created = await createCouponMutation.mutateAsync({
        ...input,
        titleAr: input.code,
        titleEn: input.code,
      });
      // The service creates coupons active; a draft is paused right after.
      if (asDraft) {
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
          counted: countedText(counted, limits ? limits.activeCouponsMax : undefined),
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
        trips={tripOptions}
        readOnly={Boolean(saved)}
        errors={errors}
      />
      <OrgAlert tone="info">{t("screen.organization.coupons.couponEditor.draftNote")}</OrgAlert>
    </OrgPage>
  );
}
