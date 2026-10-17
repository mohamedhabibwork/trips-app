import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import {
  previewSystemSettingsChangeSchema,
  updateSystemSettingsSchema,
} from "../src/schemas/validation";

describe("Unit: admin system settings validation (@trips-app/service-admin)", () => {
  describe("previewSystemSettingsChangeSchema", () => {
    test("accepts an empty patch, since every field is optional", () => {
      // Arrange
      const input = {};

      // Act
      const result = previewSystemSettingsChangeSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
    });

    test("rejects a market code outside EG, SA, AE", () => {
      const result = previewSystemSettingsChangeSchema.safeParse({ marketCountryCode: "US" });
      expect(result.success).toBe(false);
    });

    test("accepts a platform commission at the 5000 bps upper bound", () => {
      const result = previewSystemSettingsChangeSchema.safeParse({
        operational: { platformCommissionBps: 5000 },
      });
      expect(result.success).toBe(true);
    });

    test("rejects a platform commission above 5000 bps", () => {
      const result = previewSystemSettingsChangeSchema.safeParse({
        operational: { platformCommissionBps: 5001 },
      });
      expect(result.success).toBe(false);
    });

    test("rejects a lab test deadline above 7 days", () => {
      const result = previewSystemSettingsChangeSchema.safeParse({
        operational: { labTestDefaultDeadlineDays: 8 },
      });
      expect(result.success).toBe(false);
    });

    test("rejects a maintenance message longer than 500 characters", () => {
      const result = previewSystemSettingsChangeSchema.safeParse({
        maintenanceAndSupport: { maintenanceMessageEn: "x".repeat(501) },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateSystemSettingsSchema", () => {
    test("requires a reason of at least 5 characters", () => {
      const result = updateSystemSettingsSchema.safeParse({ marketEnabled: true, reason: "no" });
      expect(result.success).toBe(false);
    });

    test("accepts a valid change with a reason and a second approver id", () => {
      const result = updateSystemSettingsSchema.safeParse({
        marketEnabled: true,
        reason: "Enable Egypt market for launch",
        secondApproverAdminAccountId: randomUUID(),
      });
      expect(result.success).toBe(true);
    });

    test("rejects a second approver id that is not a UUID", () => {
      const result = updateSystemSettingsSchema.safeParse({
        marketEnabled: true,
        reason: "Enable Egypt market for launch",
        secondApproverAdminAccountId: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });
  });
});
