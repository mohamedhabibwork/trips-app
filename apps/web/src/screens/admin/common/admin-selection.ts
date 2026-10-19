// The record picked on a list page, kept for the session. Detail pages read the ID from their URL
// first (`useAdminParam`); this is the fallback when the page is opened from the screen gallery,
// whose URLs carry no params.
const ADMIN_ENTITY_KEY = "trips.admin.selectedEntityId";
const ADMIN_LAB_TEST_KEY = "trips.admin.selectedLabTestId";
const ADMIN_DEAL_KEY = "trips.admin.selectedDealId";
const ADMIN_DISPUTE_KEY = "trips.admin.selectedDisputeId";
const ADMIN_COUPON_KEY = "trips.admin.selectedCouponId";
const ADMIN_PLAN_KEY = "trips.admin.selectedPlanId";

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id === null) {
      window.sessionStorage.removeItem(key);
    } else {
      window.sessionStorage.setItem(key, id);
    }
  } catch {
    // Storage can be blocked (private mode); the URL still carries the ID.
  }
}

export const getSelectedAdminEntityId = () => readStorage(ADMIN_ENTITY_KEY);
export const setSelectedAdminEntityId = (id: string | null) => writeStorage(ADMIN_ENTITY_KEY, id);
export const getSelectedAdminLabTestId = () => readStorage(ADMIN_LAB_TEST_KEY);
export const setSelectedAdminLabTestId = (id: string | null) =>
  writeStorage(ADMIN_LAB_TEST_KEY, id);
export const getSelectedAdminDealId = () => readStorage(ADMIN_DEAL_KEY);
export const setSelectedAdminDealId = (id: string | null) => writeStorage(ADMIN_DEAL_KEY, id);
export const getSelectedAdminDisputeId = () => readStorage(ADMIN_DISPUTE_KEY);
export const setSelectedAdminDisputeId = (id: string | null) => writeStorage(ADMIN_DISPUTE_KEY, id);
export const getSelectedAdminCouponId = () => readStorage(ADMIN_COUPON_KEY);
export const setSelectedAdminCouponId = (id: string | null) => writeStorage(ADMIN_COUPON_KEY, id);
export const getSelectedAdminPlanId = () => readStorage(ADMIN_PLAN_KEY);
export const setSelectedAdminPlanId = (id: string | null) => writeStorage(ADMIN_PLAN_KEY, id);
