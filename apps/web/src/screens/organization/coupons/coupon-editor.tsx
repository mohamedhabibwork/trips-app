import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { TeSwitch } from "@trips-app/ui/components/te-switch";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { OrgSection, getSelectedCouponId } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const TYPE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "fixed-amount", label: t("screen.organization.coupons.couponEditor.fixedAmount") },
  { value: "percentage", label: t("screen.organization.coupons.couponEditor.percentage") },
  {
    value: "program-specific",
    label: t("screen.organization.coupons.couponEditor.programSpecific"),
  },
  { value: "free-program", label: t("screen.organization.coupons.couponEditor.freeProgram") },
  { value: "first-booking", label: t("screen.organization.coupons.couponEditor.firstBooking") },
  { value: "minimum-spend", label: t("screen.organization.coupons.couponEditor.minimumSpend") },
];

const AUDIENCE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "public", label: t("screen.organization.coupons.couponEditor.public") },
  { value: "targeted", label: t("screen.organization.coupons.couponEditor.targeted") },
];

export function CouponEditor() {
  const goTo = useOrgNavigate();
  const queryClient = useQueryClient();
  const { status: authStatus } = useAuth();
  const [code, setCode] = useState("");
  const [couponType, setCouponType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("10");
  const [totalLimit, setTotalLimit] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [minBookingValue, setMinBookingValue] = useState("");
  const [programs, setPrograms] = useState("");
  const [audience, setAudience] = useState("public");
  const [stackable, setStackable] = useState(false);

  const selectedId = getSelectedCouponId();
  const couponsQuery = useQuery(
    orpc.coupons.listOrganizationCoupons.queryOptions({
      input: {},
      enabled: authStatus === "authenticated" && Boolean(selectedId),
    }),
  );

  useEffect(() => {
    if (!selectedId || !couponsQuery.data?.items) return;
    const found = couponsQuery.data.items.find((c) => c.id === selectedId);
    if (!found) return;
    setCode(found.code);
    setCouponType(found.discountType === "fixed_amount" ? "fixed-amount" : "percentage");
    setDiscountValue(String(found.discountValue));
    if (found.maxRedemptions !== null) setTotalLimit(String(found.maxRedemptions));
    if (found.minOrderMinor > 0) setMinBookingValue(String(found.minOrderMinor / 100));
    if (found.startsAt) setValidFrom(new Date(found.startsAt).toISOString().slice(0, 10));
    if (found.expiresAt) setValidUntil(new Date(found.expiresAt).toISOString().slice(0, 10));
  }, [selectedId, couponsQuery.data?.items]);

  const createCouponMutation = useMutation(
    orpc.coupons.createOrganizationCoupon.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.coupons.key() });
      },
    }),
  );

  const handleSave = async () => {
    if (authStatus === "authenticated" && code.trim().length >= 3) {
      try {
        const parsedMaxRedemptions = Number.parseInt(totalLimit, 10);
        const parsedMinOrder = Number.parseFloat(minBookingValue);
        await createCouponMutation.mutateAsync({
          code: code.trim(),
          titleAr: code.trim(),
          titleEn: code.trim(),
          discountType: couponType === "fixed-amount" ? "fixed_amount" : "percentage",
          discountValue: Math.max(1, Number.parseInt(discountValue, 10) || 10),
          maxRedemptions:
            Number.isFinite(parsedMaxRedemptions) && parsedMaxRedemptions > 0
              ? parsedMaxRedemptions
              : null,
          minOrderMinor:
            Number.isFinite(parsedMinOrder) && parsedMinOrder >= 0
              ? Math.round(parsedMinOrder * 100)
              : undefined,
          startsAt: validFrom.trim() ? `${validFrom.trim()}T00:00:00.000Z` : null,
          expiresAt: validUntil.trim() ? `${validUntil.trim()}T23:59:59.000Z` : null,
        });
      } catch {
        // Proceed to list
      }
    }
    void goTo("coupons-list");
  };

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "coupons-list",
            label: t("screen.organization.coupons.couponEditor.backToCoupons"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.coupons.couponEditor.couponEditor")}
          actions={
            <TeButton onClick={() => void handleSave()}>
              {t("screen.organization.coupons.couponEditor.save")}
            </TeButton>
          }
        />
        <OrgSection title={t("screen.organization.coupons.couponEditor.codeAndType")}>
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput
                label={t("screen.organization.coupons.couponEditor.code")}
                placeholder={t("screen.organization.coupons.couponEditor.codePlaceholder")}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                supportingText={t("screen.organization.coupons.couponEditor.typeACustomCodeOr")}
              />
              <TeSelect
                label={t("screen.organization.coupons.couponEditor.type")}
                options={TYPE_OPTIONS()}
                value={couponType}
                onValueChange={setCouponType}
              />
              <TeInput
                label={t("screen.organization.coupons.couponEditor.value")}
                placeholder={t("screen.organization.coupons.couponEditor.valuePlaceholder")}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                inputMode="decimal"
              />
              <TeInput
                label={t("screen.organization.coupons.couponEditor.scope")}
                defaultValue="This organization's trips"
                readOnly
                supportingText={t(
                  "screen.organization.coupons.couponEditor.couponsApplyOnlyToThis",
                )}
              />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title={t("screen.organization.coupons.couponEditor.limitsAndValidity")}>
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput
                label={t("screen.organization.coupons.couponEditor.totalLimit")}
                placeholder={t("screen.organization.coupons.couponEditor.totalUses")}
                inputMode="numeric"
                value={totalLimit}
                onChange={(e) => setTotalLimit(e.target.value)}
              />
              <TeInput
                label={t("screen.organization.coupons.couponEditor.perUserLimit")}
                placeholder={t("screen.organization.coupons.couponEditor.usesPerUser")}
                inputMode="numeric"
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(e.target.value)}
              />
              <TeInput
                label={t("screen.organization.coupons.couponEditor.validFrom")}
                placeholder={t("screen.organization.coupons.couponEditor.yyyyMmDd")}
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
              <TeInput
                label={t("screen.organization.coupons.couponEditor.validUntil")}
                placeholder={t("screen.organization.coupons.couponEditor.yyyyMmDdPlaceholder")}
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
              <TeInput
                label={t("screen.organization.coupons.couponEditor.minimumBookingValue")}
                placeholder={t("screen.organization.coupons.couponEditor.amount")}
                inputMode="decimal"
                value={minBookingValue}
                onChange={(e) => setMinBookingValue(e.target.value)}
              />
              <TeInput
                label={t("screen.organization.coupons.couponEditor.programs")}
                placeholder={t("screen.organization.coupons.couponEditor.programsPlaceholder")}
                value={programs}
                onChange={(e) => setPrograms(e.target.value)}
              />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title={t("screen.organization.coupons.couponEditor.audience")}>
          <TeCard>
            <div className="flex flex-col gap-4">
              <TeSelect
                label={t("screen.organization.coupons.couponEditor.audienceLabel")}
                options={AUDIENCE_OPTIONS()}
                value={audience}
                onValueChange={setAudience}
              />
              <TeSwitch
                checked={stackable}
                onCheckedChange={setStackable}
                label={t("screen.organization.coupons.couponEditor.canBeCombinedWithOther")}
                onLabel={t("screen.organization.coupons.couponEditor.yes")}
                offLabel={t("screen.organization.coupons.couponEditor.no")}
              />
            </div>
          </TeCard>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
