import { describe, expect, test } from "bun:test";

import { AuthServiceError, mapAuthError } from "../src/errors";
import {
  adminSignInSchema,
  orgPermissionMatrixSchema,
  registerSupplierAccountSchema,
  registerTravelerSchema,
  signInSchema,
  verifyOtpSchema,
} from "../src/schemas/validation";

describe("Unit: auth validation schemas & error mapping (@trips-app/service-auth)", () => {
  test("auth Zod schemas and error mapper validate registration and sign-in payloads", () => {
    expect(orgPermissionMatrixSchema.safeParse({}).success).toBe(true);
    expect(
      registerTravelerSchema.safeParse({
        fullName: "Salma Hassan",
        email: "salma@example.com",
        preferredSignInMethod: "otp",
      }).success,
    ).toBe(true);
    expect(
      registerSupplierAccountSchema.safeParse({
        role: "organization_owner",
        fullName: "Tarek Mansour",
        email: "tarek@example.com",
        phone: "+201012345678",
        password: "StrongPassword!2026",
      }).success,
    ).toBe(true);
    expect(
      verifyOtpSchema.safeParse({
        targetIdentifier: "salma@example.com",
        code: "123456",
      }).success,
    ).toBe(true);
    expect(
      signInSchema.safeParse({
        identifier: "salma@example.com",
        method: "otp",
        otpCode: "123456",
      }).success,
    ).toBe(true);
    expect(
      adminSignInSchema.safeParse({
        email: "admin@trips.eg",
        password: "AdminPassword!2026",
      }).success,
    ).toBe(true);

    const err = new AuthServiceError("AUTH_INVALID_CREDENTIALS", "Invalid credentials");
    expect(mapAuthError(err).code).toBe("AUTH_INVALID_CREDENTIALS");
  });
});
