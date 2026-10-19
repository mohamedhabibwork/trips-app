// Zod schemas that validate input at the boundary.
// Derived from @trips-app/db/zod table definitions (see .claude/rules/drizzle-zod-schemas.md).
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  schema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

import { EMPLOYEE_MEMBERSHIP_STATUSES, ORG_PERMISSION_LEVELS } from "../../model";

const permissionLevelSchema = z.enum(ORG_PERMISSION_LEVELS);
const membershipStatusSchema = z.enum(EMPLOYEE_MEMBERSHIP_STATUSES);

export const orgPermissionMatrixSchema = z.object({
  trips: permissionLevelSchema,
  bookings: permissionLevelSchema,
  accounting: permissionLevelSchema,
  coupons: permissionLevelSchema,
  employees: permissionLevelSchema,
  fleet: permissionLevelSchema,
  subscription: permissionLevelSchema,
  tracking: permissionLevelSchema,
  settings: permissionLevelSchema,
});

export const partialOrgPermissionMatrixSchema = orgPermissionMatrixSchema.partial();

export const employeeMembershipSelectSchema = createSelectSchema(schema.employeeMemberships);

export const employeeMembershipInsertSchema = createInsertSchema(schema.employeeMemberships, {
  invitedEmail: (column) => column.trim().email().max(255),
  invitedPhone: (column) => column.trim().min(6).max(30),
  roleTitle: (column) => column.trim().min(2).max(120),
  permissions: () => orgPermissionMatrixSchema,
  status: () => membershipStatusSchema,
});

export const employeeMembershipUpdateSchema = createUpdateSchema(schema.employeeMemberships, {
  roleTitle: (column) => column.trim().min(2).max(120),
  permissions: () => orgPermissionMatrixSchema,
  status: () => membershipStatusSchema,
});

export const listEmployeesSchema = z
  .object({
    status: membershipStatusSchema.optional(),
    search: z.string().trim().max(120).optional(),
  })
  .optional();

export const getEmployeeByIdSchema = z.object({
  membershipId: z.uuid(),
});

export const inviteEmployeeSchema = employeeMembershipInsertSchema
  .pick({
    invitedEmail: true,
    roleTitle: true,
  })
  .extend({
    invitedPhone: z.string().trim().min(6).max(30).nullable().optional(),
    preset: z
      .enum([
        "operations_manager",
        "trip_coordinator",
        "accountant",
        "fleet_supervisor",
        "support_agent",
      ])
      .optional(),
    permissions: partialOrgPermissionMatrixSchema.optional(),
  });

export const resendEmployeeInviteSchema = z.object({
  membershipId: z.uuid(),
});

export const acceptEmployeeInviteSchema = z.object({
  inviteToken: z.string().trim().min(8).max(256),
});

export const updateEmployeePermissionsSchema = employeeMembershipUpdateSchema
  .pick({
    roleTitle: true,
    permissions: true,
  })
  .extend({
    membershipId: z.uuid(),
    permissions: orgPermissionMatrixSchema,
  });

export const updateEmployeeStatusSchema = z.object({
  membershipId: z.uuid(),
  status: z.enum(["active", "suspended", "revoked"]),
  reason: z.string().trim().min(2).max(500).optional(),
});
