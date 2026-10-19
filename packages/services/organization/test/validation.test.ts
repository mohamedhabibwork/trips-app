import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { mapOrganizationError, OrganizationServiceError } from "../src/errors";
import {
  configureWebhooksSchema,
  getOrganizationSettingsSchema,
  updateOrganizationSettingsSchema,
} from "../src/schemas/validation";

describe("Unit: organization validation schemas & error mapping (@trips-app/service-organization)", () => {
  test("organization Zod schemas and error mapper validate settings and webhook inputs", () => {
    expect(getOrganizationSettingsSchema.safeParse(undefined).success).toBe(true);
    expect(
      updateOrganizationSettingsSchema.safeParse({
        tenantId: randomUUID(),
        displayNameEn: "Nile Horizon Tours",
        displayNameAr: "نايل هورايزون للسياحة",
        defaultLanguage: "ar",
        primaryColorHex: "#0F766E",
      }).success,
    ).toBe(true);
    expect(
      configureWebhooksSchema.safeParse({
        endpoints: [
          {
            url: "https://hooks.nilehorizon.eg/events",
            events: ["booking.confirmed", "trip.published"],
          },
        ],
      }).success,
    ).toBe(true);

    const err = new OrganizationServiceError("PLAN_REQUIRED", "Enterprise required");
    expect(mapOrganizationError(err).code).toBe("PLAN_REQUIRED");
  });
});
