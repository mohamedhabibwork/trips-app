import type { SessionTokenPayload } from "@trips-app/auth";
import type { TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { client } from "../utils/orpc";

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

export function uploadItemsToDocuments(
  items: readonly TeFileUploadItem[],
  documentType: OnboardingDocumentType,
  defaultMimeType:
    | "application/pdf"
    | "image/jpeg"
    | "image/png"
    | "image/webp" = "application/pdf",
): Array<{
  documentType: OnboardingDocumentType;
  storageKey: string;
  mimeType: "application/pdf" | "image/jpeg" | "image/png" | "image/webp";
  fileSizeBytes: number;
}> {
  return items.map((item, idx) => {
    const lower = item.name.toLowerCase();
    let mimeType = defaultMimeType;
    if (lower.endsWith(".png")) mimeType = "image/png";
    else if (lower.endsWith(".webp")) mimeType = "image/webp";
    else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) mimeType = "image/jpeg";
    else if (lower.endsWith(".pdf")) mimeType = "application/pdf";

    const safeName = item.name.replace(/[^a-zA-Z0-9._-]/g, "_") || `file_${idx + 1}`;
    return {
      documentType,
      storageKey: `uploads/${documentType}/${Date.now()}_${idx}_${safeName}`,
      mimeType,
      fileSizeBytes: 120_000,
    };
  });
}

/**
 * Ensures the caller has an active authenticated session before submitting an onboarding application
 * from a standalone public sign-up screen. If already authenticated, this is a no-op.
 */
export async function ensureSupplierSession(params: {
  isAuthenticated: boolean;
  signInWithSession: (session: SessionTokenPayload) => void;
  role: "organization_owner" | "platform_driver" | "platform_photographer";
  fullName: string;
  email: string;
  phone: string;
  preferredLanguage?: "ar" | "en";
}): Promise<void> {
  if (params.isAuthenticated) return;

  const reg = (await client.auth.registerSupplierAccount({
    role: params.role,
    fullName: params.fullName.trim(),
    email: params.email.trim(),
    phone: params.phone.trim(),
    password: "SupplierTempPass!2026",
    preferredLanguage: params.preferredLanguage ?? "en",
    surface: "web",
  })) as unknown as {
    otpDispatches?: Array<{
      targetIdentifier: string;
      devCodePreview?: string;
    }>;
  };

  for (const dispatch of reg.otpDispatches ?? []) {
    if (!dispatch.devCodePreview) continue;
    const verified = (await client.auth.verifyOtp({
      targetIdentifier: dispatch.targetIdentifier,
      purpose: "registration",
      code: dispatch.devCodePreview,
      surface: "web",
    })) as unknown as {
      session?: SessionTokenPayload | null;
    };
    if (verified.session) {
      params.signInWithSession(verified.session);
    }
  }
}
