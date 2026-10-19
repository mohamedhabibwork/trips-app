// Shared TypeScript types, ids and enums. No I/O.
import type { OrgPermissionMatrix } from "@trips-app/domain";
import type { z } from "zod/v4";

import type {
  acceptEmployeeInviteSchema,
  declineEmployeeInviteSchema,
  getEmployeeByIdSchema,
  inviteEmployeeSchema,
  listEmployeesSchema,
  previewEmployeeInviteSchema,
  resendEmployeeInviteSchema,
  updateEmployeePermissionsSchema,
  updateEmployeeStatusSchema,
} from "../schemas/validation";

export type {
  ErrorCategory,
  ErrorHttpStatus,
  OrgPermissionMatrix,
  SharedErrorCode,
  SharedErrorCode as EmployeesErrorCode,
} from "@trips-app/domain";

export type EmployeeMembershipStatus = "invited" | "active" | "suspended" | "revoked";

export interface EmployeesRequestMeta {
  requestId?: string;
  ipAddress?: string;
}

export type ListEmployeesInput = z.infer<typeof listEmployeesSchema>;
export type GetEmployeeByIdInput = z.infer<typeof getEmployeeByIdSchema>;
export type InviteEmployeeInput = z.infer<typeof inviteEmployeeSchema>;
export type ResendEmployeeInviteInput = z.infer<typeof resendEmployeeInviteSchema>;
export type AcceptEmployeeInviteInput = z.infer<typeof acceptEmployeeInviteSchema>;
export type PreviewEmployeeInviteInput = z.infer<typeof previewEmployeeInviteSchema>;
export type DeclineEmployeeInviteInput = z.infer<typeof declineEmployeeInviteSchema>;

/** Where an invitation stands, as its email link shows it. */
export type EmployeeInviteState = "pending" | "expired" | "accepted" | "withdrawn";

/** What the invited person sees before accepting: who invited them and to which areas. */
export interface EmployeeInvitePreviewDto {
  organizationNameEn: string;
  organizationNameAr: string;
  invitedEmail: string;
  roleTitle: string;
  permissions: OrgPermissionMatrix;
  inviteExpiresAt: string;
  state: EmployeeInviteState;
}
export type UpdateEmployeePermissionsInput = z.infer<typeof updateEmployeePermissionsSchema>;
export type UpdateEmployeeStatusInput = z.infer<typeof updateEmployeeStatusSchema>;

export interface EmployeeMemberDto {
  id: string;
  tenantId: string;
  accountId: string | null;
  invitedEmail: string;
  invitedPhone: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  roleTitle: string;
  permissions: OrgPermissionMatrix;
  status: EmployeeMembershipStatus;
  inviteExpiresAt: string;
  firstSignInCompletedAt: string | null;
  invitedByAccountId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeQuotaSummaryDto {
  usedCount: number;
  maxAllowed: number | null;
  planTier: string;
}

export interface EmployeeAuditLogDto {
  id: string;
  actorAccountId: string | null;
  actorRole: string;
  action: string;
  reason: string | null;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  createdAt: string;
}
