// Cards of the coupon editor (SCR-ORG-28): code and value, limits and validity, audience and stacking.
import { t } from "@trips-app/i18n";

import { OrgChoice, OrgInput, OrgSelect, type OrgOption } from "../common/org-form";
import { OrgButton, OrgCard } from "../common/org-ui";

export type CouponKind =
  | "fixed-amount"
  | "percentage"
  | "program-specific"
  | "free-program"
  | "first-booking"
  | "minimum-spend";

const COUPON_KINDS: readonly CouponKind[] = [
  "fixed-amount",
  "percentage",
  "program-specific",
  "free-program",
  "first-booking",
  "minimum-spend",
];

export interface CouponForm {
  code: string;
  kind: CouponKind;
  value: string;
  totalLimit: string;
  perUserLimit: string;
  validFrom: string;
  validUntil: string;
  minBookingValue: string;
  programId: string;
  audience: "public" | "targeted";
  stackable: boolean;
}

export const EMPTY_COUPON_FORM: CouponForm = {
  code: "",
  kind: "percentage",
  value: "10",
  totalLimit: "",
  perUserLimit: "",
  validFrom: "",
  validUntil: "",
  minBookingValue: "",
  programId: "all",
  audience: "public",
  stackable: false,
};

/** The two discount types the coupon service stores; the other kinds are saved as one of them. */
export function discountTypeOf(kind: CouponKind): "percentage" | "fixed_amount" {
  return kind === "percentage" || kind === "free-program" ? "percentage" : "fixed_amount";
}

const CODE_LENGTH = 8;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCouponCode(): string {
  const values = crypto.getRandomValues(new Uint32Array(CODE_LENGTH));
  return Array.from(values, (value) => CODE_ALPHABET[value % CODE_ALPHABET.length]).join("");
}

function kindOptions(): readonly OrgOption[] {
  return [
    { value: "fixed-amount", label: t("screen.organization.coupons.couponEditorForm.fixedAmount") },
    { value: "percentage", label: t("screen.organization.coupons.couponEditorForm.percentage") },
    {
      value: "program-specific",
      label: t("screen.organization.coupons.couponEditorForm.programSpecific"),
    },
    { value: "free-program", label: t("screen.organization.coupons.couponEditorForm.freeProgram") },
    {
      value: "first-booking",
      label: t("screen.organization.coupons.couponEditorForm.firstBooking"),
    },
    {
      value: "minimum-spend",
      label: t("screen.organization.coupons.couponEditorForm.minimumSpend"),
    },
  ];
}

interface CouponFormCardsProps {
  form: CouponForm;
  onChange: (patch: Partial<CouponForm>) => void;
  programs: readonly OrgOption[];
  readOnly: boolean;
  codeError?: string;
}

export function CouponFormCards({
  form,
  onChange,
  programs,
  readOnly,
  codeError,
}: CouponFormCardsProps) {
  const options = kindOptions();
  return (
    <>
      <OrgCard title={t("screen.organization.coupons.couponEditorForm.codeAndValue")}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex min-w-0 items-end gap-2">
            <OrgInput
              label={t("screen.organization.coupons.couponEditorForm.code")}
              value={form.code}
              onChange={(event) => onChange({ code: event.target.value.toUpperCase() })}
              disabled={readOnly}
              error={codeError}
              fieldClassName="flex-1"
            />
            <OrgButton
              variant="secondary"
              disabled={readOnly}
              onClick={() => onChange({ code: generateCouponCode() })}
              className={codeError ? "mb-6" : undefined}
            >
              {t("screen.organization.coupons.couponEditorForm.generate")}
            </OrgButton>
          </div>
          <OrgSelect
            label={t("screen.organization.coupons.couponEditorForm.couponType")}
            options={options}
            value={form.kind}
            onValueChange={(value) =>
              onChange({ kind: COUPON_KINDS.find((kind) => kind === value) ?? "percentage" })
            }
            disabled={readOnly}
          />
          <OrgInput
            label={t("screen.organization.coupons.couponEditorForm.value")}
            hint={
              discountTypeOf(form.kind) === "percentage"
                ? t("screen.organization.coupons.couponEditorForm.valuePercentHint")
                : t("screen.organization.coupons.couponEditorForm.valueAmountHint")
            }
            inputMode="decimal"
            value={form.value}
            onChange={(event) => onChange({ value: event.target.value })}
            disabled={readOnly}
          />
          <OrgInput
            label={t("screen.organization.coupons.couponEditorForm.scope")}
            value={t("screen.organization.coupons.couponEditorForm.thisOrganizationsTrips")}
            disabled
            readOnly
          />
        </div>
      </OrgCard>
      <OrgCard title={t("screen.organization.coupons.couponEditorForm.limitsAndValidity")}>
        <div className="grid gap-4 md:grid-cols-2">
          <OrgInput
            label={t("screen.organization.coupons.couponEditorForm.totalLimit")}
            hint={t("screen.organization.coupons.couponEditorForm.usesHint")}
            inputMode="numeric"
            value={form.totalLimit}
            onChange={(event) => onChange({ totalLimit: event.target.value })}
            disabled={readOnly}
          />
          <OrgInput
            label={t("screen.organization.coupons.couponEditorForm.perUserLimit")}
            hint={t("screen.organization.coupons.couponEditorForm.usesHint")}
            inputMode="numeric"
            value={form.perUserLimit}
            onChange={(event) => onChange({ perUserLimit: event.target.value })}
            disabled={readOnly}
          />
          <OrgInput
            label={t("screen.organization.coupons.couponEditorForm.validFrom")}
            type="date"
            value={form.validFrom}
            onChange={(event) => onChange({ validFrom: event.target.value })}
            disabled={readOnly}
          />
          <OrgInput
            label={t("screen.organization.coupons.couponEditorForm.validUntil")}
            type="date"
            value={form.validUntil}
            onChange={(event) => onChange({ validUntil: event.target.value })}
            disabled={readOnly}
          />
          <OrgInput
            label={t("screen.organization.coupons.couponEditorForm.minimumBookingValue")}
            inputMode="decimal"
            value={form.minBookingValue}
            onChange={(event) => onChange({ minBookingValue: event.target.value })}
            disabled={readOnly}
          />
          <OrgSelect
            label={t("screen.organization.coupons.couponEditorForm.programs")}
            options={programs}
            value={form.programId}
            onValueChange={(value) => onChange({ programId: value })}
            disabled={readOnly}
          />
        </div>
      </OrgCard>
      <OrgCard title={t("screen.organization.coupons.couponEditorForm.audienceAndStacking")}>
        <div className="flex flex-wrap gap-8">
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0" disabled={readOnly}>
            <legend className="mb-2 p-0 text-sm leading-5 font-semibold">
              {t("screen.organization.coupons.couponEditorForm.audience")}
            </legend>
            <OrgChoice
              type="radio"
              name="coupon-audience"
              checked={form.audience === "public"}
              onChange={() => onChange({ audience: "public" })}
            >
              {t("screen.organization.coupons.couponEditorForm.public")}
            </OrgChoice>
            <OrgChoice
              type="radio"
              name="coupon-audience"
              checked={form.audience === "targeted"}
              onChange={() => onChange({ audience: "targeted" })}
            >
              {t("screen.organization.coupons.couponEditorForm.targetedAudienceList")}
            </OrgChoice>
          </fieldset>
          <OrgChoice
            type="checkbox"
            className="self-start"
            checked={form.stackable}
            onChange={(event) => onChange({ stackable: event.target.checked })}
            disabled={readOnly}
          >
            {t("screen.organization.coupons.couponEditorForm.canBeCombined")}
          </OrgChoice>
        </div>
      </OrgCard>
    </>
  );
}
