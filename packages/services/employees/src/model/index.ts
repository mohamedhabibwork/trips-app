// Entities and aggregates with their invariants. No I/O.
import {
  EMPLOYEE_ROLE_PRESETS,
  findPlanCatalogEntry,
  generateRandomToken,
  hashSha256,
  normalizeEmail,
  normalizePhoneE164,
  ORG_PERMISSION_AREAS,
  ORG_PERMISSION_LEVELS,
  type OrgPermissionArea,
  type OrgPermissionLevel,
  type OrgPermissionMatrix,
  type UserRole,
} from "@trips-app/domain";

export {
  EMPLOYEE_ROLE_PRESETS,
  findPlanCatalogEntry,
  generateRandomToken,
  hashSha256,
  normalizeEmail,
  normalizePhoneE164,
  ORG_PERMISSION_AREAS,
  ORG_PERMISSION_LEVELS,
  type OrgPermissionArea,
  type OrgPermissionLevel,
  type OrgPermissionMatrix,
  type UserRole,
};

export const EMPLOYEE_MEMBERSHIP_STATUSES = ["invited", "active", "suspended", "revoked"] as const;
export type EmployeeMembershipStatus = (typeof EMPLOYEE_MEMBERSHIP_STATUSES)[number];

export const EMPLOYEE_INVITE_TTL_DAYS = 7;
export const EMPLOYEE_INVITE_TTL_MS = EMPLOYEE_INVITE_TTL_DAYS * 24 * 60 * 60 * 1000;

export const DEFAULT_EMPLOYEE_PERMISSIONS: OrgPermissionMatrix = {
  trips: "none",
  bookings: "none",
  accounting: "none",
  coupons: "none",
  employees: "none",
  fleet: "none",
  subscription: "none",
  tracking: "none",
  settings: "none",
};

export function resolvePermissionMatrix(input: {
  preset?: string;
  permissions?: Partial<OrgPermissionMatrix>;
}): OrgPermissionMatrix {
  const base =
    (input.preset ? EMPLOYEE_ROLE_PRESETS[input.preset] : undefined) ??
    DEFAULT_EMPLOYEE_PERMISSIONS;
  return {
    trips: input.permissions?.trips ?? base.trips,
    bookings: input.permissions?.bookings ?? base.bookings,
    accounting: input.permissions?.accounting ?? base.accounting,
    coupons: input.permissions?.coupons ?? base.coupons,
    employees: input.permissions?.employees ?? base.employees,
    fleet: input.permissions?.fleet ?? base.fleet,
    subscription: input.permissions?.subscription ?? base.subscription,
    tracking: input.permissions?.tracking ?? base.tracking,
    settings: input.permissions?.settings ?? base.settings,
  };
}

export function computeInviteExpiresAt(now: Date = new Date()): Date {
  return new Date(now.getTime() + EMPLOYEE_INVITE_TTL_MS);
}

export function canTransitionEmployeeStatus(
  from: EmployeeMembershipStatus,
  to: "active" | "suspended" | "revoked",
): { valid: boolean; reason?: string } {
  if (from === "revoked" && to !== "revoked") {
    return {
      valid: false,
      reason: "A revoked employee membership cannot be reactivated or suspended.",
    };
  }
  if (from === "invited" && to === "active") {
    return {
      valid: false,
      reason: "An invited employee must accept their invitation to become active.",
    };
  }
  return { valid: true };
}
