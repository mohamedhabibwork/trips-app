// Shared TypeScript types, ids and enums. No I/O.
import type { OrgPermissionMatrix } from "@trips-app/domain";
import type { z } from "zod/v4";

import type {
  acceptEmployeeInviteSchema,
  getEmployeeByIdSchema,
  inviteEmployeeSchema,
  listEmployeesSchema,
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
