// Zod schemas that validate input at the boundary.
import {
  insertAccountsSchema,
  insertAdminInvitesSchema,
  insertAuthSessionsSchema,
  insertAuthSettingsSchema,
  insertEmployeeMembershipsSchema,
  insertModeratorAssignmentsSchema,
  insertOtpVerificationsSchema,
  selectAccountsSchema,
  selectAdminInvitesSchema,
  selectAuthSessionsSchema,
  selectAuthSettingsSchema,
  selectEmployeeMembershipsSchema,
  selectModeratorAssignmentsSchema,
  selectOtpVerificationsSchema,
  updateAccountsSchema,
  updateAdminInvitesSchema,
  updateAuthSessionsSchema,
  updateAuthSettingsSchema as dbUpdateAuthSettingsSchema,
  updateEmployeeMembershipsSchema,
  updateModeratorAssignmentsSchema,
  updateOtpVerificationsSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

import {
  ADMIN_SUB_ROLES,
  CLIENT_SURFACES,
  ORG_PERMISSION_LEVELS,
  OTP_CHANNELS,
  OTP_PURPOSES,
  PRIMARY_SIGN_IN_METHODS,
  SUPPORTED_LOCALES,
  USER_ROLES,
} from "../../model";

// Table Base Schemas
export const accountSelectSchema = selectAccountsSchema;
export const accountInsertSchema = insertAccountsSchema;
export const accountUpdateSchema = updateAccountsSchema;

export const authSessionSelectSchema = selectAuthSessionsSchema;
export const authSessionInsertSchema = insertAuthSessionsSchema;
export const authSessionUpdateSchema = updateAuthSessionsSchema;

export const otpVerificationSelectSchema = selectOtpVerificationsSchema;
export const otpVerificationInsertSchema = insertOtpVerificationsSchema;
export const otpVerificationUpdateSchema = updateOtpVerificationsSchema;

export const adminInviteSelectSchema = selectAdminInvitesSchema;
export const adminInviteInsertSchema = insertAdminInvitesSchema;
export const adminInviteUpdateSchema = updateAdminInvitesSchema;

export const employeeMembershipSelectSchema = selectEmployeeMembershipsSchema;
export const employeeMembershipInsertSchema = insertEmployeeMembershipsSchema;
export const employeeMembershipUpdateSchema = updateEmployeeMembershipsSchema;

export const moderatorAssignmentSelectSchema = selectModeratorAssignmentsSchema;
export const moderatorAssignmentInsertSchema = insertModeratorAssignmentsSchema;
export const moderatorAssignmentUpdateSchema = updateModeratorAssignmentsSchema;

export const authSettingSelectSchema = selectAuthSettingsSchema;
export const authSettingInsertSchema = insertAuthSettingsSchema;
export const authSettingUpdateSchema = dbUpdateAuthSettingsSchema;

export const orgPermissionMatrixSchema = z.object({
  trips: z.enum(ORG_PERMISSION_LEVELS).default("none"),
  bookings: z.enum(ORG_PERMISSION_LEVELS).default("none"),
  accounting: z.enum(ORG_PERMISSION_LEVELS).default("none"),
  coupons: z.enum(ORG_PERMISSION_LEVELS).default("none"),
  employees: z.enum(ORG_PERMISSION_LEVELS).default("none"),
  fleet: z.enum(ORG_PERMISSION_LEVELS).default("none"),
  subscription: z.enum(ORG_PERMISSION_LEVELS).default("none"),
  tracking: z.enum(ORG_PERMISSION_LEVELS).default("none"),
  settings: z.enum(ORG_PERMISSION_LEVELS).default("none"),
});

export const getPlanCatalogSchema = z
  .object({
    role: z
      .enum(["traveler", "organization", "platform_driver", "platform_photographer"])
      .optional(),
  })
  .optional();

export const registerTravelerSchema = insertAccountsSchema
  .pick({
    fullName: true,
  })
  .extend({
    fullName: z.string().min(2).max(120),
    email: z.email().optional().nullable(),
    phone: z.string().min(8).max(20).optional().nullable(),
    password: z.string().min(12).max(128).optional().nullable(),
    preferredSignInMethod: z.enum(["otp", "password"]).default("otp"),
    preferredLanguage: z.enum(SUPPORTED_LOCALES).default("ar"),
    surface: z.enum(CLIENT_SURFACES).default("web"),
    enableParentRole: z.boolean().default(false),
  });

export const registerSupplierAccountSchema = insertAccountsSchema
  .pick({
    fullName: true,
  })
  .extend({
    role: z.enum(["platform_driver", "platform_photographer", "organization_owner"]),
    fullName: z.string().min(2).max(120),
    email: z.email(),
    phone: z.string().min(8).max(20),
    password: z.string().min(12).max(128),
    preferredLanguage: z.enum(SUPPORTED_LOCALES).default("ar"),
    surface: z.enum(CLIENT_SURFACES).default("web"),
  });

export const verifyOtpSchema = insertOtpVerificationsSchema
  .pick({
    targetIdentifier: true,
    purpose: true,
  })
  .extend({
    targetIdentifier: z.string().min(3),
    purpose: z.enum(OTP_PURPOSES).default("registration"),
    code: z.string().regex(/^\d{6}$/, "OTP code must be 6 digits"),
    surface: z.enum(CLIENT_SURFACES).default("web"),
  });

export const resendOtpSchema = insertOtpVerificationsSchema
  .pick({
    targetIdentifier: true,
    channel: true,
    purpose: true,
  })
  .extend({
    targetIdentifier: z.string().min(3),
    channel: z.enum(OTP_CHANNELS).optional(),
    purpose: z.enum(OTP_PURPOSES).default("registration"),
    useFallbackChannel: z.boolean().default(false),
  });

export const signInSchema = z.object({
  identifier: z.string().min(3),
  method: z.enum(["otp", "password"]),
  password: z.string().optional(),
  otpCode: z.string().optional(),
  requestedRole: z
    .enum([
      "traveler",
      "parent",
      "platform_driver",
      "org_driver",
      "platform_photographer",
      "org_photographer",
      "organization_owner",
    ])
    .optional(),
  surface: z.enum(CLIENT_SURFACES).default("web"),
});

export const adminSignInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const adminEnrollTotpSchema = z.object({
  enrollmentToken: z.string().min(8),
  totpCode: z.string().regex(/^\d{6}$/),
});

export const adminVerifyTotpSchema = z.object({
  challengeToken: z.string().min(8),
  totpCode: z.string().regex(/^\d{6}$/),
});

export const adminInviteStaffSchema = insertAdminInvitesSchema
  .pick({
    fullName: true,
    subRole: true,
  })
  .extend({
    email: z.email(),
    fullName: z.string().min(2).max(120),
    subRole: z.enum(ADMIN_SUB_ROLES),
  });

export const adminAcceptInviteSchema = z.object({
  inviteToken: z.string().min(8),
  phone: z.string().min(8).max(20),
  password: z.string().min(12).max(128),
});

export const adminResetTotpSchema = z.object({
  targetAdminAccountId: z.uuid(),
  reason: z.string().min(5).max(500),
});

export const staffSignInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const staffSetupSecondFactorSchema = z.object({
  challengeToken: z.string().min(8),
  method: z.enum(["sms", "totp"]),
  verificationCode: z.string().regex(/^\d{6}$/),
});

export const staffVerifySecondFactorSchema = z.object({
  challengeToken: z.string().min(8),
  code: z.string().regex(/^\d{6}$/),
  tenantId: z.uuid().optional(),
});

export const inviteEmployeeSchema = insertEmployeeMembershipsSchema
  .pick({
    roleTitle: true,
  })
  .extend({
    email: z.email(),
    phone: z.string().min(8).max(20).optional(),
    roleTitle: z.string().min(2).max(100),
    preset: z
      .enum([
        "operations_manager",
        "trip_coordinator",
        "accountant",
        "fleet_supervisor",
        "support_agent",
      ])
      .optional(),
    permissions: orgPermissionMatrixSchema.optional(),
  });

export const acceptEmployeeInviteSchema = z.object({
  inviteToken: z.string().min(8),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  password: z.string().min(12).max(128),
});

export const moderatorSignInSchema = z.object({
  identifier: z.string().min(3),
  staffCode: z.string().min(4).max(12),
  surface: z.enum(["mobile", "pwa"]).default("mobile"),
});

export const refreshSessionSchema = z.object({
  refreshToken: z.string().min(10),
});

export const signOutSchema = z.object({
  refreshToken: z.string().optional(),
  allDevices: z.boolean().default(false),
});

export const switchRoleSchema = z.object({
  targetRole: z.enum(USER_ROLES),
  tenantId: z.uuid().optional(),
});

export const switchOrganizationSchema = z.object({
  targetTenantId: z.uuid(),
});

export const requestPasswordResetSchema = z.object({
  identifier: z.string().min(3),
});

export const confirmPasswordResetSchema = z.object({
  identifier: z.string().min(3),
  otpCode: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(12).max(128),
});

export const requestContactChangeSchema = z.object({
  channel: z.enum(["email", "phone"]),
  newValue: z.string().min(3),
});

export const confirmContactChangeSchema = z.object({
  channel: z.enum(["email", "phone"]),
  newValue: z.string().min(3),
  otpCode: z.string().regex(/^\d{6}$/),
});

export const changeSignInMethodSchema = z.object({
  preferredSignInMethod: z.enum(PRIMARY_SIGN_IN_METHODS),
  password: z.string().min(12).max(128).optional(),
});

export const suspendAccountSchema = z.object({
  targetAccountId: z.uuid(),
  reason: z.string().min(5).max(500),
});

export const reinstateAccountSchema = z.object({
  targetAccountId: z.uuid(),
  reason: z.string().min(5).max(500),
});

export const requestAccountDeletionSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const restoreAccountFromDeletionSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().optional(),
  otpCode: z.string().optional(),
});

export const updateAuthSettingsSchema = dbUpdateAuthSettingsSchema
  .pick({
    otpExpirySeconds: true,
    otpResendCooldownSeconds: true,
    otpMaxWrongAttempts: true,
    otpPauseDurationSeconds: true,
    maxFailedSignInAttempts: true,
    lockoutDurationSeconds: true,
    passwordMinLength: true,
    breachedPasswordCheckEnabled: true,
    accessTokenTtlSeconds: true,
    webSessionMaxSeconds: true,
    deletionGraceDays: true,
  })
  .extend({
    otpExpirySeconds: z.number().int().min(60).max(900).optional(),
    otpResendCooldownSeconds: z.number().int().min(30).max(300).optional(),
    otpMaxWrongAttempts: z.number().int().min(3).max(10).optional(),
    otpPauseDurationSeconds: z.number().int().min(300).max(3600).optional(),
    maxFailedSignInAttempts: z.number().int().min(3).max(10).optional(),
    lockoutDurationSeconds: z.number().int().min(300).max(3600).optional(),
    passwordMinLength: z.number().int().min(12).max(64).optional(),
    breachedPasswordCheckEnabled: z.boolean().optional(),
    accessTokenTtlSeconds: z.number().int().min(300).max(3600).optional(),
    webSessionMaxSeconds: z.number().int().min(3600).max(86400).optional(),
    deletionGraceDays: z.number().int().min(7).max(90).optional(),
    reason: z.string().min(5).max(500),
  });
