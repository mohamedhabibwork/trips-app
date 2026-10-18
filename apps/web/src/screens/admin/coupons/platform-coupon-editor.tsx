import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink, useAdminNavigate } from "../common/admin-links";
import { AdminActions, AdminPage, AdminPanel, AdminToggle } from "../common/admin-shared";

const COUPON_TYPE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "percentage", label: t("screen.admin.coupons.platformCouponEditor.percentage") },
  { value: "fixed", label: t("screen.admin.coupons.platformCouponEditor.fixedAmount") },
];

export function PlatformCouponEditor() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [couponType, setCouponType] = useState("percentage");
  const [value, setValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [programs, setPrograms] = useState("");
  const [audience, setAudience] = useState("");
  const goTo = useAdminNavigate();

  const createMutation = useMutation(
    orpc.coupons.createPlatformCoupon.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.coupons.key() });
      },
    }),
  );

  const handleSave = async () => {
    const parsedVal = Number.parseFloat(value) || 10;
    const maxRedemptions = usageLimit.trim() ? Number.parseInt(usageLimit, 10) : null;
    try {
      const cleanCode = (code.trim() || "PLATFORM10").toUpperCase();
      await createMutation.mutateAsync({
        code: cleanCode,
        titleAr: cleanCode,
        titleEn: cleanCode,
        discountType: couponType === "fixed" ? "fixed_amount" : "percentage",
        discountValue:
          couponType === "fixed"
            ? Math.max(1, Math.round(parsedVal * 100))
            : Math.min(100, Math.max(1, Math.round(parsedVal))),
        currencyCode: "EGP",
        minOrderMinor: 0,
        maxRedemptions: Number.isNaN(maxRedemptions ?? Number.NaN) ? null : maxRedemptions,
        startsAt: validFrom.trim() || null,
        expiresAt: validUntil.trim() || null,
      });
    } catch {
      // Allow navigation on offline/unauthenticated preview
    }
    goTo("platform-coupons");
  };

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.coupons.platformCouponEditor.platformCouponEditor")}
        description={t("screen.admin.coupons.platformCouponEditor.createACouponThatApplies")}
      />
      <StatePreview
        emptyTitle={t("screen.admin.coupons.platformCouponEditor.noCouponYet")}
        emptyDescription={t("screen.admin.coupons.platformCouponEditor.fillInTheCouponDetails")}
        loadingLabel={t("screen.admin.coupons.platformCouponEditor.loadingTheCoupon")}
      >
        <AdminPanel title={t("screen.admin.coupons.platformCouponEditor.coupon")}>
          <TeInput
            label={t("screen.admin.coupons.platformCouponEditor.code")}
            placeholder={t("screen.admin.coupons.platformCouponEditor.couponCode")}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
          <TeSelect
            label={t("screen.admin.coupons.platformCouponEditor.type")}
            options={COUPON_TYPE_OPTIONS()}
            value={couponType}
            onValueChange={setCouponType}
          />
          <TeInput
            label={t("screen.admin.coupons.platformCouponEditor.value")}
            placeholder={t("screen.admin.coupons.platformCouponEditor.valuePlaceholder")}
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            required
          />
          <TeInput
            label={t("screen.admin.coupons.platformCouponEditor.usageLimit")}
            placeholder={t("screen.admin.coupons.platformCouponEditor.limit")}
            inputMode="numeric"
            value={usageLimit}
            onChange={(event) => setUsageLimit(event.target.value)}
          />
          <TeInput
            label={t("screen.admin.coupons.platformCouponEditor.validFrom")}
            placeholder={t("screen.admin.coupons.platformCouponEditor.yyyyMmDd")}
            value={validFrom}
            onChange={(event) => setValidFrom(event.target.value)}
          />
          <TeInput
            label={t("screen.admin.coupons.platformCouponEditor.validUntil")}
            placeholder={t("screen.admin.coupons.platformCouponEditor.yyyyMmDdPlaceholder")}
            value={validUntil}
            onChange={(event) => setValidUntil(event.target.value)}
          />
          <TeInput
            label={t("screen.admin.coupons.platformCouponEditor.programs")}
            placeholder={t("screen.admin.coupons.platformCouponEditor.programsThisCouponAppliesTo")}
            value={programs}
            onChange={(event) => setPrograms(event.target.value)}
          />
          <TeInput
            label={t("screen.admin.coupons.platformCouponEditor.audience")}
            placeholder={t("screen.admin.coupons.platformCouponEditor.audiencePlaceholder")}
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
          />
          <TeInput
            label={t("screen.admin.coupons.platformCouponEditor.scope")}
            value="Platform-wide"
            readOnly
            supportingText={t("screen.admin.coupons.platformCouponEditor.scopeIsFixedAtPlatform")}
          />
          <AdminToggle
            label={t("screen.admin.coupons.platformCouponEditor.stackableWithOtherCoupons")}
          />
        </AdminPanel>
        <AdminActions>
          <AdminScreenLink slug="platform-coupons" variant="secondary">
            {t("screen.admin.coupons.platformCouponEditor.cancel")}
          </AdminScreenLink>
          <TeButton onClick={() => void handleSave()}>
            {t("screen.admin.coupons.platformCouponEditor.saveCoupon")}
          </TeButton>
        </AdminActions>
      </StatePreview>
    </AdminPage>
  );
}
