import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink, useAdminNavigate } from "../common/admin-links";
import { AdminActions, AdminPage, AdminPanel, AdminToggle } from "../common/admin-shared";

const COUPON_TYPE_OPTIONS: readonly TeSelectOption[] = [
  { value: "percentage", label: "Percentage" },
  { value: "fixed", label: "Fixed amount" },
];

export function PlatformCouponEditor() {
  const [couponType, setCouponType] = useState("percentage");
  const goTo = useAdminNavigate();

  return (
    <AdminPage>
      <TePageHeader
        title="Platform coupon editor"
        description="Create a coupon that applies across the whole platform."
      />
      <StatePreview
        emptyTitle="No coupon yet"
        emptyDescription="Fill in the coupon details to create one."
        loadingLabel="Loading the coupon."
      >
        <AdminPanel title="Coupon">
          <TeInput label="Code" placeholder="[Coupon code]" required />
          <TeSelect
            label="Type"
            options={COUPON_TYPE_OPTIONS}
            value={couponType}
            onValueChange={setCouponType}
          />
          <TeInput label="Value" placeholder="[Value]" inputMode="decimal" required />
          <TeInput label="Usage limit" placeholder="[Limit]" inputMode="numeric" />
          <TeInput label="Valid from" placeholder="YYYY-MM-DD" />
          <TeInput label="Valid until" placeholder="YYYY-MM-DD" />
          <TeInput label="Programs" placeholder="[Programs this coupon applies to]" />
          <TeInput label="Audience" placeholder="[Audience]" />
          <TeInput
            label="Scope"
            value="Platform-wide"
            readOnly
            supportingText="Scope is fixed at platform-wide."
          />
          <AdminToggle label="Stackable with other coupons" />
        </AdminPanel>
        <AdminActions>
          <AdminScreenLink slug="platform-coupons" variant="secondary">
            Cancel
          </AdminScreenLink>
          <TeButton onClick={() => goTo("platform-coupons")}>Save coupon</TeButton>
        </AdminActions>
      </StatePreview>
    </AdminPage>
  );
}
