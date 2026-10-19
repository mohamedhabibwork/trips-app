const SELECTED_APP_KEY = "trips.onboarding.selectedApplicationId";
const APPLICANT_APP_KEY = "trips.onboarding.applicantApplicationId";
const APPLICANT_ROLE_KEY = "trips.onboarding.applicantRole";

let memorySelectedApplicationId: string | null = null;
let memoryApplicantApplicationId: string | null = null;
let memoryApplicantRole: string | null = null;

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function getSelectedAdminApplicationId(): string | null {
  if (canUseSessionStorage()) {
    const val = window.sessionStorage.getItem(SELECTED_APP_KEY);
    if (val) return val;
  }
  return memorySelectedApplicationId;
}

export function setSelectedAdminApplicationId(id: string | null): void {
  memorySelectedApplicationId = id;
  if (canUseSessionStorage()) {
    if (id) {
      window.sessionStorage.setItem(SELECTED_APP_KEY, id);
    } else {
      window.sessionStorage.removeItem(SELECTED_APP_KEY);
    }
  }
}

export function getApplicantApplicationId(): string | null {
  if (canUseSessionStorage()) {
    const val = window.sessionStorage.getItem(APPLICANT_APP_KEY);
    if (val) return val;
  }
  return memoryApplicantApplicationId;
}

export function setApplicantApplicationId(id: string | null): void {
  memoryApplicantApplicationId = id;
  if (canUseSessionStorage()) {
    if (id) {
      window.sessionStorage.setItem(APPLICANT_APP_KEY, id);
    } else {
      window.sessionStorage.removeItem(APPLICANT_APP_KEY);
    }
  }
}

export function getApplicantRole(): string | null {
  if (canUseSessionStorage()) {
    const val = window.sessionStorage.getItem(APPLICANT_ROLE_KEY);
    if (val) return val;
  }
  return memoryApplicantRole;
}

export function setApplicantRole(role: string | null): void {
  memoryApplicantRole = role;
  if (canUseSessionStorage()) {
    if (role) {
      window.sessionStorage.setItem(APPLICANT_ROLE_KEY, role);
    } else {
      window.sessionStorage.removeItem(APPLICANT_ROLE_KEY);
    }
  }
}

export type OnboardingDocumentType =
  | "commercial_registry"
  | "tax_certificate"
  | "national_id"
  | "driver_license"
  | "vehicle_registration"
  | "insurance_certificate"
  | "lab_test_result"
  | "portfolio_sample"
  | "drone_permit"
  | "appeal_evidence"
  | "other";
