import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { EmployeesServiceError, mapEmployeesError } from "../src/errors";
import {
  canTransitionEmployeeStatus,
  computeInviteExpiresAt,
  DEFAULT_EMPLOYEE_PERMISSIONS,
  resolvePermissionMatrix,
} from "../src/model";
import {
  acceptEmployeeInviteSchema,
  getEmployeeByIdSchema,
  inviteEmployeeSchema,
  listEmployeesSchema,
  resendEmployeeInviteSchema,
  updateEmployeePermissionsSchema,
  updateEmployeeStatusSchema,
} from "../src/schemas/validation";

describe("Unit: employees validation schemas, model invariants & error mapping (@trips-app/service-employees)", () => {
  test("resolvePermissionMatrix and canTransitionEmployeeStatus enforce employee membership rules", () => {
    const opsMatrix = resolvePermissionMatrix({ preset: "operations_manager" });
    expect(opsMatrix.trips).toBe("manage");
    expect(opsMatrix.fleet).toBe("manage");

    const custom = resolvePermissionMatrix({
      permissions: { employees: "manage", fleet: "view" },
    });
    expect(custom.employees).toBe("manage");
    expect(custom.fleet).toBe("view");
    expect(custom.trips).toBe(DEFAULT_EMPLOYEE_PERMISSIONS.trips);

    expect(canTransitionEmployeeStatus("active", "suspended").valid).toBe(true);
    expect(canTransitionEmployeeStatus("suspended", "active").valid).toBe(true);
    expect(canTransitionEmployeeStatus("invited", "active").valid).toBe(false);
    expect(canTransitionEmployeeStatus("revoked", "active").valid).toBe(false);

    const now = new Date("2026-10-18T00:00:00Z");
    expect(computeInviteExpiresAt(now).getTime()).toBeGreaterThan(now.getTime());
  });

  test("inviteEmployeeSchema and updateEmployeePermissionsSchema validate boundary inputs", () => {
    expect(
      inviteEmployeeSchema.safeParse({
        invitedEmail: "staff@org.example.com",
        roleTitle: "Fleet Coordinator",
        preset: "fleet_supervisor",
      }).success,
    ).toBe(true);

    expect(
      inviteEmployeeSchema.safeParse({
        invitedEmail: "not-an-email",
        roleTitle: "A",
      }).success,
    ).toBe(false);

    expect(
      updateEmployeePermissionsSchema.safeParse({
        membershipId: randomUUID(),
        roleTitle: "Senior Coordinator",
        permissions: resolvePermissionMatrix({ preset: "trip_coordinator" }),
      }).success,
    ).toBe(true);

    expect(
      updateEmployeeStatusSchema.safeParse({
        membershipId: randomUUID(),
        status: "suspended",
        reason: "Temporary leave",
      }).success,
    ).toBe(true);

    expect(listEmployeesSchema.safeParse(undefined).success).toBe(true);
    expect(listEmployeesSchema.safeParse({}).success).toBe(true);
    expect(getEmployeeByIdSchema.safeParse({ membershipId: randomUUID() }).success).toBe(true);
    expect(resendEmployeeInviteSchema.safeParse({ membershipId: randomUUID() }).success).toBe(true);
    expect(acceptEmployeeInviteSchema.safeParse({ inviteToken: "valid-token-12345" }).success).toBe(
      true,
    );
  });

  test("mapEmployeesError maps EmployeesServiceError to standardized SharedErrorCode", () => {
    const err = new EmployeesServiceError("PLAN_LIMIT_EXCEEDED", "Quota exceeded");
    const mapped = mapEmployeesError(err);
    expect(mapped.code).toBe("PLAN_LIMIT_EXCEEDED");
    expect(mapped.serviceId).toBe("employees");
  });
});
