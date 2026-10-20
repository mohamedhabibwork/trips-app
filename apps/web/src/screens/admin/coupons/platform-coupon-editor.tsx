// SCR-ADM-20 Platform coupon editor (docs/design/web/admin/SCR-ADM-20.dc.html): create a
// platform-wide coupon with its discount, validity, programs, audience and stacking. The scope is
// fixed. Validation errors show next to the field that needs a fix.
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { trackEvent } from "@/utils/analytics";
import { serverMutationOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";

import { AdminButton, AdminLink, useAdminNavigate } from "../common/admin-actions";
import {
  AdminCheckbox,
  AdminInput,
  AdminRadioGroup,
  AdminSelect,
  type AdminOption,
} from "../common/admin-form";
import { AdminAlert, AdminBadge, AdminCard, AdminPage, AdminSplit } from "../common/admin-ui";

type DiscountType = "percentage" | "fixed_amount";

interface CouponForm {
  code: string;
  discountType: DiscountType;
  value: string;
  maxRedemptions: string;
  validFrom: string;
  validTo: string;
}

type FieldErrors = Partial<Record<keyof CouponForm, string>>;

const EMPTY_FORM: CouponForm = {
  code: "",
  discountType: "percentage",
  value: "",
  maxRedemptions: "",
  validFrom: "",
  validTo: "",
};

const CODE_MIN = 3;
const CODE_MAX = 40;
const PERCENT_MAX = 100;
const MINOR_UNITS_PER_MAJOR = 100;
// The API takes one currency per fixed-amount coupon; the artboard has no currency field yet.
const FIXED_AMOUNT_CURRENCY = "EGP" as const;

const discountOptions = () => [
  { value: "percentage", label: t("screen.admin.coupons.platformCouponEditor.percentage") },
  { value: "fixed_amount", label: t("screen.admin.coupons.platformCouponEditor.fixedAmount") },
];

// Audiences have no field in the coupon API yet, so only the default is offered.
const audienceOptions = (): readonly AdminOption[] => [
  { value: "all", label: t("screen.admin.coupons.platformCouponEditor.allAudiences") },
];

function toPositiveInt(value: string): number | null {
  const parsed = Number(value.trim());
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function validate(form: CouponForm): FieldErrors {
  const errors: FieldErrors = {};
  const code = form.code.trim();
  if (code.length < CODE_MIN || code.length > CODE_MAX) {
    errors.code = t("screen.admin.coupons.platformCouponEditor.codeError");
  }
  const amount = Number(form.value.trim());
  const isPercent = form.discountType === "percentage";
  if (!form.value.trim() || !Number.isFinite(amount) || amount <= 0) {
    errors.value = t("screen.admin.coupons.platformCouponEditor.valueError");
  } else if (isPercent && (!Number.isInteger(amount) || amount > PERCENT_MAX)) {
    errors.value = t("screen.admin.coupons.platformCouponEditor.percentError");
  }
  if (form.maxRedemptions.trim() && toPositiveInt(form.maxRedemptions) === null) {
    errors.maxRedemptions = t("screen.admin.coupons.platformCouponEditor.maxRedemptionsError");
  }
  if (form.validFrom && form.validTo && form.validTo < form.validFrom) {
    errors.validTo = t("screen.admin.coupons.platformCouponEditor.validToError");
  }
  return errors;
}

function toIsoDate(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

function buildInput(form: CouponForm) {
  const code = form.code.trim().toUpperCase();
  const amount = Number(form.value.trim());
  const isFixed = form.discountType === "fixed_amount";
  return {
    code,
    titleAr: code,
    titleEn: code,
    discountType: form.discountType,
    discountValue: isFixed ? Math.round(amount * MINOR_UNITS_PER_MAJOR) : amount,
    ...(isFixed ? { currencyCode: FIXED_AMOUNT_CURRENCY } : {}),
    maxRedemptions: toPositiveInt(form.maxRedemptions),
    startsAt: toIsoDate(form.validFrom),
    expiresAt: toIsoDate(form.validTo),
  };
}

export function PlatformCouponEditor() {
  const queryClient = useQueryClient();
  const goTo = useAdminNavigate();
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});

  const createMutation = useMutation(
    serverMutationOptions(orpc.coupons.createPlatformCoupon, "coupons/createPlatformCoupon", {
      onSuccess: () => {
        trackEvent("platform_coupon_created", { surface: "admin" });
        void queryClient.invalidateQueries({ queryKey: orpc.coupons.key() });
      },
      onError: () => trackEvent("platform_coupon_create_failed", { surface: "admin" }),
    }),
  );

  const setField = (field: keyof CouponForm) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      await createMutation.mutateAsync(buildInput(form));
      await goTo("SCR-ADM-19");
    } catch {
      // The mutation error is shown in the alert below the scope card.
    }
  };

  return (
    <AdminPage
      title={t("screen.admin.coupons.platformCouponEditor.title")}
      description={t("screen.admin.coupons.platformCouponEditor.description")}
      actions={
        <>
          <AdminLink screen="SCR-ADM-19" variant="secondary">
            {t("screen.admin.coupons.platformCouponEditor.cancel")}
          </AdminLink>
          <AdminButton
            variant="primary"
            disabled={createMutation.isPending}
            onClick={() => void save()}
          >
            {t("screen.admin.coupons.platformCouponEditor.saveCoupon")}
          </AdminButton>
        </>
      }
    >
      <AdminSplit
        main={
          <>
            <AdminCard title={t("screen.admin.coupons.platformCouponEditor.discount")}>
              <AdminInput
                label={t("screen.admin.coupons.platformCouponEditor.code")}
                value={form.code}
                maxLength={CODE_MAX}
                aria-invalid={Boolean(errors.code)}
                help={errors.code}
                onChange={(event) => setField("code")(event.target.value)}
              />
              <AdminRadioGroup
                legend={t("screen.admin.coupons.platformCouponEditor.type")}
                name="coupon-discount-type"
                value={form.discountType}
                options={discountOptions()}
                onValueChange={setField("discountType")}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AdminInput
                  label={t("screen.admin.coupons.platformCouponEditor.value")}
                  inputMode="decimal"
                  value={form.value}
                  aria-invalid={Boolean(errors.value)}
                  help={errors.value}
                  onChange={(event) => setField("value")(event.target.value)}
                />
                <AdminInput
                  label={t("screen.admin.coupons.platformCouponEditor.maximumRedemptions")}
                  inputMode="numeric"
                  value={form.maxRedemptions}
                  aria-invalid={Boolean(errors.maxRedemptions)}
                  help={errors.maxRedemptions}
                  onChange={(event) => setField("maxRedemptions")(event.target.value)}
                />
              </div>
            </AdminCard>
            <AdminCard title={t("screen.admin.coupons.platformCouponEditor.validityAndPrograms")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AdminInput
                  type="date"
                  label={t("screen.admin.coupons.platformCouponEditor.validFrom")}
                  value={form.validFrom}
                  onChange={(event) => setField("validFrom")(event.target.value)}
                />
                <AdminInput
                  type="date"
                  label={t("screen.admin.coupons.platformCouponEditor.validTo")}
                  value={form.validTo}
                  aria-invalid={Boolean(errors.validTo)}
                  help={errors.validTo}
                  onChange={(event) => setField("validTo")(event.target.value)}
                />
              </div>
              <span className="te-label">
                {t("screen.admin.coupons.platformCouponEditor.programs")}
              </span>
              <p className="te-caption">
                {t("screen.admin.coupons.platformCouponEditor.programsUnavailable")}
              </p>
            </AdminCard>
            <AdminCard title={t("screen.admin.coupons.platformCouponEditor.audienceAndStacking")}>
              <AdminSelect
                label={t("screen.admin.coupons.platformCouponEditor.audience")}
                options={audienceOptions()}
                value="all"
                disabled
                onValueChange={() => undefined}
              />
              <AdminCheckbox
                label={t("screen.admin.coupons.platformCouponEditor.stackable")}
                checked={false}
                disabled
                onCheckedChange={() => undefined}
              />
              <p className="te-caption">
                {t("screen.admin.coupons.platformCouponEditor.audienceUnavailable")}
              </p>
            </AdminCard>
          </>
        }
        side={
          <>
            <AdminCard title={t("screen.admin.coupons.platformCouponEditor.scope")}>
              <AdminBadge tone="info" icon="lock">
                {t("screen.admin.coupons.platformCouponEditor.platformWideFixed")}
              </AdminBadge>
              <p className="te-body text-[var(--te-ink-muted)]">
                {t("screen.admin.coupons.platformCouponEditor.scopeCannotChange")}
              </p>
            </AdminCard>
            <AdminAlert tone="info">
              {t("screen.admin.coupons.platformCouponEditor.validationHint")}
            </AdminAlert>
            {createMutation.isError ? (
              <AdminAlert
                tone="danger"
                title={t("screen.admin.coupons.platformCouponEditor.saveFailed")}
              >
                {t("screen.admin.coupons.platformCouponEditor.saveFailedBody")}
              </AdminAlert>
            ) : null}
          </>
        }
      />
    </AdminPage>
  );
}
