// oRPC procedures for Auth. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  createAuthNotifierFromContext,
  webBaseUrlFromContext,
} from "@trips-app/service-notifications";

import {
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
import { createAuthService } from "../services";
import {
  authedProcedure,
  opsOrSuperAdminProcedure,
  orgEmployeeManageProcedure,
  procedure,
  superAdminProcedure,
} from "./procedure";

type RouteContext = Parameters<typeof createAuthNotifierFromContext>[0] & {
  db: Parameters<typeof createAuthService>[0];
};

/** Builds the auth service for one request, wired to that request's mail and SMS providers. */
function authService(context: RouteContext) {
  return createAuthService(context.db, {
    notifier: createAuthNotifierFromContext(context),
    webBaseUrl: webBaseUrlFromContext(context),
  });
}

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/auth/status",
      operationId: "authStatus",
      summary: "Auth service health status",
      tags: ["auth"],
    })
    .handler(() => ({ service: "auth", status: "ok" as const })),

  // Role, Permission & Plan Catalogs + Auth Settings
  getRoleCatalog: procedure
    .route({
      method: "GET",
      path: "/auth/getRoleCatalog",
      operationId: "authGetRoleCatalog",
      summary: "Get all 10 user roles and their authentication rules",
      tags: ["auth"],
    })
    .handler(({ context }) => authService(context).getRoleCatalog()),

  getPermissionCatalog: procedure
    .route({
      method: "GET",
      path: "/auth/getPermissionCatalog",
      operationId: "authGetPermissionCatalog",
      summary: "Get the 9-area employee permission catalog and presets (D-284)",
      tags: ["auth"],
    })
    .handler(({ context }) => authService(context).getPermissionCatalog()),

  getPlanCatalog: procedure
    .route({
      method: "POST",
      path: "/auth/getPlanCatalog",
      operationId: "authGetPlanCatalog",
      summary: "Get the 12-tier subscription plan catalog",
      tags: ["auth"],
    })
    .input(getPlanCatalogSchema)
    .handler(({ context, input }) => authService(context).getPlanCatalog(input)),

  getAuthSettings: procedure
    .route({
      method: "GET",
      path: "/auth/getAuthSettings",
      operationId: "authGetAuthSettings",
      summary: "Get global authentication and security policy settings",
      tags: ["auth"],
    })
    .handler(({ context }) => authService(context).getAuthSettings()),

  updateAuthSettings: superAdminProcedure
    .route({
      method: "POST",
      path: "/auth/updateAuthSettings",
      operationId: "authUpdateAuthSettings",
      summary: "Update global authentication and security policy settings",
      tags: ["auth"],
    })
    .input(updateAuthSettingsSchema)
    .handler(({ context, input }) =>
      authService(context).updateAuthSettings(context.auth, input, context),
    ),

  // Registration & OTP Verification
  registerTraveler: procedure
    .route({
      method: "POST",
      path: "/auth/registerTraveler",
      operationId: "authRegisterTraveler",
      summary: "Register a traveler or parent account (WF-ID-01, FR-AUTH-01..03)",
      tags: ["auth"],
    })
    .input(registerTravelerSchema)
    .handler(({ context, input }) => authService(context).registerTraveler(input, context)),

  registerSupplierAccount: procedure
    .route({
      method: "POST",
      path: "/auth/registerSupplierAccount",
      operationId: "authRegisterSupplierAccount",
      summary: "Register a platform driver, photographer, or organization owner account (D-20)",
      tags: ["auth"],
    })
    .input(registerSupplierAccountSchema)
    .handler(({ context, input }) => authService(context).registerSupplierAccount(input, context)),

  verifyOtp: procedure
    .route({
      method: "POST",
      path: "/auth/verifyOtp",
      operationId: "authVerifyOtp",
      summary: "Verify a 6-digit OTP code with 5-attempt pause guard (BRL-20)",
      tags: ["auth"],
    })
    .input(verifyOtpSchema)
    .handler(({ context, input }) => authService(context).verifyOtp(input, context)),

  resendOtp: procedure
    .route({
      method: "POST",
      path: "/auth/resendOtp",
      operationId: "authResendOtp",
      summary: "Resend OTP code after cooldown with SMS/email fallback",
      tags: ["auth"],
    })
    .input(resendOtpSchema)
    .handler(({ context, input }) => authService(context).resendOtp(input)),

  // Sign-In for Traveler, Parent, Driver, Photographer
  signIn: procedure
    .route({
      method: "POST",
      path: "/auth/signIn",
      operationId: "authSignIn",
      summary: "Sign in via OTP or password with 5-attempt lockout (FR-AUTH-04..05)",
      tags: ["auth"],
    })
    .input(signInSchema)
    .handler(({ context, input }) => authService(context).signIn(input, context)),

  // Platform Admin Sign-In, TOTP & Invites (WF-ID-04)
  adminSignIn: procedure
    .route({
      method: "POST",
      path: "/auth/adminSignIn",
      operationId: "authAdminSignIn",
      summary: "Platform admin step-1 password sign-in (WF-ID-04)",
      tags: ["auth"],
    })
    .input(adminSignInSchema)
    .handler(({ context, input }) => authService(context).adminSignIn(input)),

  adminEnrollTotp: procedure
    .route({
      method: "POST",
      path: "/auth/adminEnrollTotp",
      operationId: "authAdminEnrollTotp",
      summary: "Platform admin first-sign-in mandatory TOTP enrollment (SCR-PUB-10)",
      tags: ["auth"],
    })
    .input(adminEnrollTotpSchema)
    .handler(({ context, input }) => authService(context).adminEnrollTotp(input, context)),

  adminVerifyTotp: procedure
    .route({
      method: "POST",
      path: "/auth/adminVerifyTotp",
      operationId: "authAdminVerifyTotp",
      summary: "Platform admin step-2 TOTP verification (WF-ID-04)",
      tags: ["auth"],
    })
    .input(adminVerifyTotpSchema)
    .handler(({ context, input }) => authService(context).adminVerifyTotp(input, context)),

  adminInviteStaff: superAdminProcedure
    .route({
      method: "POST",
      path: "/auth/adminInviteStaff",
      operationId: "authAdminInviteStaff",
      summary: "Invite a new platform admin staff member (Super Admin only)",
      tags: ["auth"],
    })
    .input(adminInviteStaffSchema)
    .handler(({ context, input }) =>
      authService(context).adminInviteStaff(context.auth, input, context),
    ),

  adminAcceptInvite: procedure
    .route({
      method: "POST",
      path: "/auth/adminAcceptInvite",
      operationId: "authAdminAcceptInvite",
      summary: "Accept a platform admin invitation and set initial password",
      tags: ["auth"],
    })
    .input(adminAcceptInviteSchema)
    .handler(({ context, input }) => authService(context).adminAcceptInvite(input, context)),

  adminResetTotp: superAdminProcedure
    .route({
      method: "POST",
      path: "/auth/adminResetTotp",
      operationId: "authAdminResetTotp",
      summary: "Reset an admin's TOTP authenticator (Super Admin only)",
      tags: ["auth"],
    })
    .input(adminResetTotpSchema)
    .handler(({ context, input }) =>
      authService(context).adminResetTotp(context.auth, input, context),
    ),

  // Organization Owner & Employee Sign-In, 2FA & Invites (WF-ID-05)
  staffSignIn: procedure
    .route({
      method: "POST",
      path: "/auth/staffSignIn",
      operationId: "authStaffSignIn",
      summary: "Organization owner/employee step-1 sign-in (WF-ID-05)",
      tags: ["auth"],
    })
    .input(staffSignInSchema)
    .handler(({ context, input }) => authService(context).staffSignIn(input)),

  staffSetupSecondFactor: procedure
    .route({
      method: "POST",
      path: "/auth/staffSetupSecondFactor",
      operationId: "authStaffSetupSecondFactor",
      summary: "Organization staff first-sign-in 2FA setup (SCR-PUB-12)",
      tags: ["auth"],
    })
    .input(staffSetupSecondFactorSchema)
    .handler(({ context, input }) => authService(context).staffSetupSecondFactor(input, context)),

  staffVerifySecondFactor: procedure
    .route({
      method: "POST",
      path: "/auth/staffVerifySecondFactor",
      operationId: "authStaffVerifySecondFactor",
      summary: "Organization staff step-2 2FA verification (WF-ID-05)",
      tags: ["auth"],
    })
    .input(staffVerifySecondFactorSchema)
    .handler(({ context, input }) => authService(context).staffVerifySecondFactor(input, context)),

  inviteEmployee: orgEmployeeManageProcedure
    .route({
      method: "POST",
      path: "/auth/inviteEmployee",
      operationId: "authInviteEmployee",
      summary: "Invite an employee to the active organization with 9-area permissions",
      tags: ["auth"],
    })
    .input(inviteEmployeeSchema)
    .handler(({ context, input }) =>
      authService(context).inviteEmployee(context.auth, input, context),
    ),

  acceptEmployeeInvite: procedure
    .route({
      method: "POST",
      path: "/auth/acceptEmployeeInvite",
      operationId: "authAcceptEmployeeInvite",
      summary: "Accept an organization employee invitation",
      tags: ["auth"],
    })
    .input(acceptEmployeeInviteSchema)
    .handler(({ context, input }) => authService(context).acceptEmployeeInvite(input, context)),

  // Vehicle Moderator Sign-In (SCR-PUB-19, D-107)
  moderatorSignIn: procedure
    .route({
      method: "POST",
      path: "/auth/moderatorSignIn",
      operationId: "authModeratorSignIn",
      summary: "Vehicle moderator sign-in with 6-character staff code (SCR-PUB-19)",
      tags: ["auth"],
    })
    .input(moderatorSignInSchema)
    .handler(({ context, input }) => authService(context).moderatorSignIn(input, context)),

  // Session Management, Role Switcher & Organization Switcher (FR-AUTH-06..07, FR-AUTH-10)
  refreshSession: procedure
    .route({
      method: "POST",
      path: "/auth/refreshSession",
      operationId: "authRefreshSession",
      summary: "Rotate access and refresh tokens with reuse detection (FR-AUTH-10)",
      tags: ["auth"],
    })
    .input(refreshSessionSchema)
    .handler(({ context, input }) => authService(context).refreshSession(input)),

  signOut: procedure
    .route({
      method: "POST",
      path: "/auth/signOut",
      operationId: "authSignOut",
      summary: "Revoke current or all sessions for the account",
      tags: ["auth"],
    })
    .input(signOutSchema)
    .handler(({ context, input }) => authService(context).signOut(context.auth ?? null, input)),

  getSession: authedProcedure
    .route({
      method: "GET",
      path: "/auth/getSession",
      operationId: "authGetSession",
      summary: "Get the currently authenticated actor session",
      tags: ["auth"],
    })
    .handler(({ context }) => ({
      authenticated: true as const,
      actor: context.auth,
    })),

  listMyRolesAndOrganizations: authedProcedure
    .route({
      method: "GET",
      path: "/auth/listMyRolesAndOrganizations",
      operationId: "authListMyRolesAndOrganizations",
      summary: "List roles and organizations accessible to the signed-in account",
      tags: ["auth"],
    })
    .handler(({ context }) =>
      authService(context).listMyRolesAndOrganizations(context.auth.accountId),
    ),

  switchRole: authedProcedure
    .route({
      method: "POST",
      path: "/auth/switchRole",
      operationId: "authSwitchRole",
      summary: "Switch active role on a multi-role account (WF-ID-06, FR-AUTH-06)",
      tags: ["auth"],
    })
    .input(switchRoleSchema)
    .handler(({ context, input }) => authService(context).switchRole(context.auth, input)),

  switchOrganization: authedProcedure
    .route({
      method: "POST",
      path: "/auth/switchOrganization",
      operationId: "authSwitchOrganization",
      summary: "Switch active organization workspace for multi-org staff (WF-ID-07, FR-AUTH-07)",
      tags: ["auth"],
    })
    .input(switchOrganizationSchema)
    .handler(({ context, input }) => authService(context).switchOrganization(context.auth, input)),

  // Password Reset, Contact Change & Account Lifecycle (FR-AUTH-08..09)
  requestPasswordReset: procedure
    .route({
      method: "POST",
      path: "/auth/requestPasswordReset",
      operationId: "authRequestPasswordReset",
      summary: "Request a password reset OTP code",
      tags: ["auth"],
    })
    .input(requestPasswordResetSchema)
    .handler(({ context, input }) => authService(context).requestPasswordReset(input)),

  confirmPasswordReset: procedure
    .route({
      method: "POST",
      path: "/auth/confirmPasswordReset",
      operationId: "authConfirmPasswordReset",
      summary: "Confirm password reset and revoke active sessions",
      tags: ["auth"],
    })
    .input(confirmPasswordResetSchema)
    .handler(({ context, input }) => authService(context).confirmPasswordReset(input)),

  requestContactChange: authedProcedure
    .route({
      method: "POST",
      path: "/auth/requestContactChange",
      operationId: "authRequestContactChange",
      summary: "Request OTP verification to change email or phone",
      tags: ["auth"],
    })
    .input(requestContactChangeSchema)
    .handler(({ context, input }) =>
      authService(context).requestContactChange(context.auth.accountId, input),
    ),

  confirmContactChange: authedProcedure
    .route({
      method: "POST",
      path: "/auth/confirmContactChange",
      operationId: "authConfirmContactChange",
      summary: "Confirm email or phone change with OTP code",
      tags: ["auth"],
    })
    .input(confirmContactChangeSchema)
    .handler(({ context, input }) =>
      authService(context).confirmContactChange(context.auth.accountId, input),
    ),

  changeSignInMethod: authedProcedure
    .route({
      method: "POST",
      path: "/auth/changeSignInMethod",
      operationId: "authChangeSignInMethod",
      summary: "Switch preferred sign-in method between OTP and password (D-47)",
      tags: ["auth"],
    })
    .input(changeSignInMethodSchema)
    .handler(({ context, input }) =>
      authService(context).changeSignInMethod(context.auth.accountId, input),
    ),

  suspendAccount: opsOrSuperAdminProcedure
    .route({
      method: "POST",
      path: "/auth/suspendAccount",
      operationId: "authSuspendAccount",
      summary: "Suspend an account immediately and revoke all sessions (FR-AUTH-08)",
      tags: ["auth"],
    })
    .input(suspendAccountSchema)
    .handler(({ context, input }) =>
      authService(context).suspendAccount(context.auth, input, context),
    ),

  reinstateAccount: opsOrSuperAdminProcedure
    .route({
      method: "POST",
      path: "/auth/reinstateAccount",
      operationId: "authReinstateAccount",
      summary: "Reinstate a suspended account (FR-AUTH-08)",
      tags: ["auth"],
    })
    .input(reinstateAccountSchema)
    .handler(({ context, input }) =>
      authService(context).reinstateAccount(context.auth, input, context),
    ),

  requestAccountDeletion: authedProcedure
    .route({
      method: "POST",
      path: "/auth/requestAccountDeletion",
      operationId: "authRequestAccountDeletion",
      summary: "Request account deletion with 30-day grace period (FR-AUTH-09, D-38)",
      tags: ["auth"],
    })
    .input(requestAccountDeletionSchema)
    .handler(({ context, input }) =>
      authService(context).requestAccountDeletion(context.auth, input, context),
    ),

  restoreAccountFromDeletion: procedure
    .route({
      method: "POST",
      path: "/auth/restoreAccountFromDeletion",
      operationId: "authRestoreAccountFromDeletion",
      summary: "Restore an account within the 30-day deletion grace period (FR-AUTH-09)",
      tags: ["auth"],
    })
    .input(restoreAccountFromDeletionSchema)
    .handler(({ context, input }) => authService(context).restoreAccountFromDeletion(input)),

  runDeletionPurgeSweep: superAdminProcedure
    .route({
      method: "POST",
      path: "/auth/runDeletionPurgeSweep",
      operationId: "authRunDeletionPurgeSweep",
      summary: "Execute daily 05:00 UTC data-erasure sweep for accounts past day 30 (BRL-15)",
      tags: ["auth"],
    })
    .handler(({ context }) => authService(context).runDeletionPurgeSweep()),
};
