// Shared TypeScript types, ids and enums. No I/O.
import type { AuthNotifier } from "@trips-app/service-notifications";
import type { z } from "zod";

import type {
  acceptEmployeeInviteSchema,
  adminAcceptInviteSchema,
  adminEnrollTotpSchema,
  adminInviteStaffSchema,
  adminResetTotpSchema,
  adminSignInSchema,
  adminVerifyTotpSchema,
  changeSignInMethodSchema,
  confirmContactChangeSchema,
  confirmPasswordResetSchema,
  getPlanCatalogSchema,
  inviteEmployeeSchema,
  moderatorSignInSchema,
  refreshSessionSchema,
  registerSupplierAccountSchema,
  registerTravelerSchema,
  reinstateAccountSchema,
  requestAccountDeletionSchema,
  requestContactChangeSchema,
  requestPasswordResetSchema,
  resendOtpSchema,
  restoreAccountFromDeletionSchema,
  signInSchema,
  signOutSchema,
  staffSetupSecondFactorSchema,
  staffSignInSchema,
  staffVerifySecondFactorSchema,
  suspendAccountSchema,
  switchOrganizationSchema,
  switchRoleSchema,
  updateAuthSettingsSchema,
  verifyOtpSchema,
} from "../schemas/validation";

export type {
  ErrorCategory,
  ErrorHttpStatus,
  SharedErrorCode,
  SharedErrorCode as AuthErrorCode,
} from "@trips-app/domain";

export interface AuthRequestMeta {
  requestId?: string;
  locale?: "ar" | "en";
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  idempotencyKey?: string | null;
}

export interface OtpDispatchResult {
  channel: "sms" | "email";
  targetIdentifier: string;
  expiresAt: string;
  resendAvailableInSeconds: number;
  fallbackChannelAvailable: boolean;
  /** `failed_fallback_available` tells the client to offer the other channel (D-59, WF-NTF-06). */
  deliveryStatus: "sent" | "failed_fallback_available";
  devCodePreview?: string;
}

/** Collaborators the auth service sends messages through. Both are optional so unit tests stay offline. */
export interface AuthServiceDeps {
  notifier?: AuthNotifier;
  /** Public web origin for links in emails, for example an invite link. */
  webBaseUrl?: string;
}

/** Outcome of a message that a caller may want to report, such as an invite email. */
export type InviteDelivery = "sent" | "failed" | "skipped";

export type GetPlanCatalogInput = z.infer<typeof getPlanCatalogSchema>;
export type RegisterTravelerInput = z.infer<typeof registerTravelerSchema>;
export type RegisterSupplierAccountInput = z.infer<typeof registerSupplierAccountSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type AdminSignInInput = z.infer<typeof adminSignInSchema>;
export type AdminEnrollTotpInput = z.infer<typeof adminEnrollTotpSchema>;
export type AdminVerifyTotpInput = z.infer<typeof adminVerifyTotpSchema>;
export type AdminInviteStaffInput = z.infer<typeof adminInviteStaffSchema>;
export type AdminAcceptInviteInput = z.infer<typeof adminAcceptInviteSchema>;
export type AdminResetTotpInput = z.infer<typeof adminResetTotpSchema>;
export type StaffSignInInput = z.infer<typeof staffSignInSchema>;
export type StaffSetupSecondFactorInput = z.infer<typeof staffSetupSecondFactorSchema>;
export type StaffVerifySecondFactorInput = z.infer<typeof staffVerifySecondFactorSchema>;
export type InviteEmployeeInput = z.infer<typeof inviteEmployeeSchema>;
export type AcceptEmployeeInviteInput = z.infer<typeof acceptEmployeeInviteSchema>;
export type ModeratorSignInInput = z.infer<typeof moderatorSignInSchema>;
export type RefreshSessionInput = z.infer<typeof refreshSessionSchema>;
export type SignOutInput = z.infer<typeof signOutSchema>;
export type SwitchRoleInput = z.infer<typeof switchRoleSchema>;
export type SwitchOrganizationInput = z.infer<typeof switchOrganizationSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ConfirmPasswordResetInput = z.infer<typeof confirmPasswordResetSchema>;
export type RequestContactChangeInput = z.infer<typeof requestContactChangeSchema>;
export type ConfirmContactChangeInput = z.infer<typeof confirmContactChangeSchema>;
export type ChangeSignInMethodInput = z.infer<typeof changeSignInMethodSchema>;
export type SuspendAccountInput = z.infer<typeof suspendAccountSchema>;
export type ReinstateAccountInput = z.infer<typeof reinstateAccountSchema>;
export type RequestAccountDeletionInput = z.infer<typeof requestAccountDeletionSchema>;
export type RestoreAccountFromDeletionInput = z.infer<typeof restoreAccountFromDeletionSchema>;
export type UpdateAuthSettingsInput = z.infer<typeof updateAuthSettingsSchema>;
