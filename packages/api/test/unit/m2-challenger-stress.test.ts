import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import type { ZodType } from "zod";

const SERVICES_DIR = resolve(import.meta.dir, "../../../services");

type SchemaEntry = { service: string; name: string; schema: ZodType };

function isZodSchema(value: unknown): value is ZodType {
  return typeof value === "object" && value !== null && "safeParse" in value;
}

async function loadAllExportedSchemas(): Promise<SchemaEntry[]> {
  const services = readdirSync(SERVICES_DIR).filter((name) =>
    existsSync(join(SERVICES_DIR, name, "src/schemas/validation/index.ts")),
  );
  const entries: SchemaEntry[] = [];
  for (const service of services) {
    const modulePath = join(SERVICES_DIR, service, "src/schemas/validation/index.ts");
    const mod = (await import(modulePath)) as Record<string, unknown>;
    for (const [name, value] of Object.entries(mod)) {
      if (isZodSchema(value)) entries.push({ service, name, schema: value });
    }
  }
  return entries;
}

const allSchemas = await loadAllExportedSchemas();

describe("Milestone M2 Empirical Challenge: Non-object Rejections across ALL Services", () => {
  test("discovered schemas across all 27 services", () => {
    const serviceSet = new Set(allSchemas.map((s) => s.service));
    expect(serviceSet.size).toBe(27);
    expect(allSchemas.length).toBeGreaterThanOrEqual(100);
  });

  const nonObjectInputs: Array<{ label: string; value: unknown }> = [
    { label: "null", value: null },
    { label: "string 'hello'", value: "hello" },
    { label: "empty string ''", value: "" },
    { label: "number 123", value: 123 },
    { label: "number 0", value: 0 },
    { label: "number -1", value: -1 },
    { label: "boolean true", value: true },
    { label: "boolean false", value: false },
    { label: "array []", value: [] },
    { label: "array [1, 2, 3]", value: [1, 2, 3] },
    { label: "function () => {}", value: () => {} },
    { label: "NaN", value: Number.NaN },
    { label: "Infinity", value: Number.POSITIVE_INFINITY },
  ];

  for (const { service, name, schema } of allSchemas) {
    for (const { label, value } of nonObjectInputs) {
      test(`${service}.${name} rejects non-object input: ${label}`, () => {
        const result = schema.safeParse(value);
        expect(result.success).toBe(false);
      });
    }

    test(`${service}.${name} satisfies: safeParse(undefined).success => safeParse({}).success`, () => {
      const undefinedResult = schema.safeParse(undefined);
      if (undefinedResult.success) {
        const emptyObjResult = schema.safeParse({});
        expect(emptyObjResult.success).toBe(true);
      }
    });
  }
});

describe("Milestone M2 Empirical Challenge: Custom Refinements & Boundaries", () => {
  // 1. Accounting Service Refinements
  test("Accounting: createPayoutSettlementSchema bounds & defaults", async () => {
    const { createPayoutSettlementSchema } =
      await import("../../../../packages/services/accounting/src/schemas/validation/index");

    const validPayload = {
      description: "Valid payout settlement",
      amountMinor: 25000,
    };

    // Valid parses with default currency
    const parsed = createPayoutSettlementSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.currencyCode).toBe("EGP");
    }

    // amountMinor bounds
    expect(
      createPayoutSettlementSchema.safeParse({ ...validPayload, amountMinor: 100 }).success,
    ).toBe(true);
    expect(
      createPayoutSettlementSchema.safeParse({ ...validPayload, amountMinor: 99 }).success,
    ).toBe(false);
    expect(
      createPayoutSettlementSchema.safeParse({ ...validPayload, amountMinor: 0 }).success,
    ).toBe(false);
    expect(
      createPayoutSettlementSchema.safeParse({ ...validPayload, amountMinor: -100 }).success,
    ).toBe(false);
    expect(
      createPayoutSettlementSchema.safeParse({ ...validPayload, amountMinor: 500_000_000 }).success,
    ).toBe(true);
    expect(
      createPayoutSettlementSchema.safeParse({ ...validPayload, amountMinor: 500_000_001 }).success,
    ).toBe(false);
    expect(
      createPayoutSettlementSchema.safeParse({ ...validPayload, amountMinor: 100.5 }).success,
    ).toBe(false);

    // description bounds
    expect(
      createPayoutSettlementSchema.safeParse({ ...validPayload, description: "abc" }).success,
    ).toBe(true);
    expect(
      createPayoutSettlementSchema.safeParse({ ...validPayload, description: "ab" }).success,
    ).toBe(false);
    expect(
      createPayoutSettlementSchema.safeParse({ ...validPayload, description: "   " }).success,
    ).toBe(false);
    expect(
      createPayoutSettlementSchema.safeParse({ ...validPayload, description: "a".repeat(300) })
        .success,
    ).toBe(true);
    expect(
      createPayoutSettlementSchema.safeParse({ ...validPayload, description: "a".repeat(301) })
        .success,
    ).toBe(false);
  });

  // 2. Booking Service Refinements
  test("Booking: createBookingSchema array bounds, defaults & enums", async () => {
    const { createBookingSchema } =
      await import("../../../../packages/services/booking/src/schemas/validation/index");

    const validPassenger = {
      id: "pass-1",
      fullName: "Jane Doe",
      isChild: false,
    };

    const validBase = {
      tripId: "10000000-0000-4000-8000-000000000001",
      passengers: [validPassenger],
    };

    const parsed = createBookingSchema.safeParse(validBase);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.paymentGateway).toBe("paymob");
      expect(parsed.data.planTier).toBe("free");
      expect(parsed.data.selectedProgramIds).toEqual([]);
      expect(parsed.data.seatLabels).toEqual([]);
    }

    // Passengers min(1) max(20)
    expect(createBookingSchema.safeParse({ ...validBase, passengers: [] }).success).toBe(false);
    const twentyPassengers = Array.from({ length: 20 }, (_, i) => ({
      id: `pass-${i}`,
      fullName: `Passenger ${i}`,
      isChild: false,
    }));
    expect(
      createBookingSchema.safeParse({ ...validBase, passengers: twentyPassengers }).success,
    ).toBe(true);
    const twentyOnePassengers = Array.from({ length: 21 }, (_, i) => ({
      id: `pass-${i}`,
      fullName: `Passenger ${i}`,
      isChild: false,
    }));
    expect(
      createBookingSchema.safeParse({ ...validBase, passengers: twentyOnePassengers }).success,
    ).toBe(false);

    // paymentGateway enum
    expect(createBookingSchema.safeParse({ ...validBase, paymentGateway: "stripe" }).success).toBe(
      true,
    );
    expect(createBookingSchema.safeParse({ ...validBase, paymentGateway: "fawry" }).success).toBe(
      true,
    );
    expect(createBookingSchema.safeParse({ ...validBase, paymentGateway: "stub" }).success).toBe(
      true,
    );
    expect(createBookingSchema.safeParse({ ...validBase, paymentGateway: "PAYMOB" }).success).toBe(
      false,
    );
    expect(createBookingSchema.safeParse({ ...validBase, paymentGateway: "paypal" }).success).toBe(
      false,
    );

    // couponCode bounds
    expect(createBookingSchema.safeParse({ ...validBase, couponCode: "DISC10" }).success).toBe(
      true,
    );
    expect(createBookingSchema.safeParse({ ...validBase, couponCode: "AB" }).success).toBe(false);
    expect(
      createBookingSchema.safeParse({ ...validBase, couponCode: "A".repeat(41) }).success,
    ).toBe(false);
    expect(createBookingSchema.safeParse({ ...validBase, couponCode: null }).success).toBe(true);
  });

  // 3. Driver Service Refinements
  test("Driver: updateDriverProfileSchema & lab tests", async () => {
    const { updateDriverProfileSchema, bookLabTestSchema, adminReviewLabTestSchema } =
      await import("../../../../packages/services/driver/src/schemas/validation/index");

    // yearsOfExperience min(0) max(60)
    expect(updateDriverProfileSchema.safeParse({ yearsOfExperience: 0 }).success).toBe(true);
    expect(updateDriverProfileSchema.safeParse({ yearsOfExperience: 60 }).success).toBe(true);
    expect(updateDriverProfileSchema.safeParse({ yearsOfExperience: -1 }).success).toBe(false);
    expect(updateDriverProfileSchema.safeParse({ yearsOfExperience: 61 }).success).toBe(false);
    expect(updateDriverProfileSchema.safeParse({ yearsOfExperience: 10.5 }).success).toBe(false);

    // vehicleYear min(1990) max(2035)
    expect(updateDriverProfileSchema.safeParse({ vehicleYear: 1990 }).success).toBe(true);
    expect(updateDriverProfileSchema.safeParse({ vehicleYear: 2026 }).success).toBe(true);
    expect(updateDriverProfileSchema.safeParse({ vehicleYear: 2035 }).success).toBe(true);
    expect(updateDriverProfileSchema.safeParse({ vehicleYear: 1989 }).success).toBe(false);
    expect(updateDriverProfileSchema.safeParse({ vehicleYear: 2036 }).success).toBe(false);

    // bookLabTest appointmentAt datetime
    const validBookLab = {
      labTestId: "10000000-0000-4000-8000-000000000001",
      labCenterName: "Cairo Central Lab",
      appointmentAt: "2026-10-25T10:00:00Z",
    };
    expect(bookLabTestSchema.safeParse(validBookLab).success).toBe(true);
    expect(
      bookLabTestSchema.safeParse({ ...validBookLab, appointmentAt: "invalid-date" }).success,
    ).toBe(false);
    expect(
      bookLabTestSchema.safeParse({ ...validBookLab, appointmentAt: "2026-10-25" }).success,
    ).toBe(false);
    expect(bookLabTestSchema.safeParse({ ...validBookLab, labCenterName: "A" }).success).toBe(
      false,
    );

    // adminReviewLabTest decision enum
    const validReview = {
      labTestId: "10000000-0000-4000-8000-000000000001",
      decision: "verified_pass",
    };
    expect(adminReviewLabTestSchema.safeParse(validReview).success).toBe(true);
    expect(
      adminReviewLabTestSchema.safeParse({ ...validReview, decision: "verified_fail" }).success,
    ).toBe(true);
    expect(adminReviewLabTestSchema.safeParse({ ...validReview, decision: "pass" }).success).toBe(
      false,
    );
    expect(
      adminReviewLabTestSchema.safeParse({ ...validReview, decision: "approved" }).success,
    ).toBe(false);
  });

  // 4. Coupons Service Refinements
  test("Coupons: createCouponInputSchema numeric bounds and dates", async () => {
    const { createCouponInputSchema, updateCouponStatusInputSchema } =
      await import("../../../../packages/services/coupons/src/schemas/validation/index");

    const validCoupon = {
      code: "SUMMER2026",
      titleAr: "خصم الصيف",
      titleEn: "Summer Discount",
      discountType: "percentage",
      discountValue: 20,
    };

    expect(createCouponInputSchema.safeParse(validCoupon).success).toBe(true);
    // code min(3) max(40)
    expect(createCouponInputSchema.safeParse({ ...validCoupon, code: "SU" }).success).toBe(false);
    expect(createCouponInputSchema.safeParse({ ...validCoupon, code: "   " }).success).toBe(false);
    // discountValue min(1) max(10_000_000)
    expect(createCouponInputSchema.safeParse({ ...validCoupon, discountValue: 0 }).success).toBe(
      false,
    );
    expect(createCouponInputSchema.safeParse({ ...validCoupon, discountValue: 1 }).success).toBe(
      true,
    );
    expect(
      createCouponInputSchema.safeParse({ ...validCoupon, discountValue: 10_000_000 }).success,
    ).toBe(true);
    expect(
      createCouponInputSchema.safeParse({ ...validCoupon, discountValue: 10_000_001 }).success,
    ).toBe(false);

    // updateCouponStatus enum
    const validStatusUpdate = {
      couponId: "10000000-0000-4000-8000-000000000001",
      status: "active",
    };
    expect(updateCouponStatusInputSchema.safeParse(validStatusUpdate).success).toBe(true);
    expect(
      updateCouponStatusInputSchema.safeParse({ ...validStatusUpdate, status: "ACTIVE" }).success,
    ).toBe(false);
    expect(
      updateCouponStatusInputSchema.safeParse({ ...validStatusUpdate, status: "unknown" }).success,
    ).toBe(false);
  });

  // 5. Auth Service Refinements (OTP regex, Email, Defaults)
  test("Auth: OTP regex, registration defaults, and settings bounds", async () => {
    const { verifyOtpSchema, registerTravelerSchema, updateAuthSettingsSchema } =
      await import("../../../../packages/services/auth/src/schemas/validation/index");

    // verifyOtp code regex /^\d{6}$/
    const validOtp = {
      targetIdentifier: "+201000000000",
      code: "123456",
    };
    const otpParsed = verifyOtpSchema.safeParse(validOtp);
    expect(otpParsed.success).toBe(true);
    if (otpParsed.success) {
      expect(otpParsed.data.purpose).toBe("registration");
      expect(otpParsed.data.surface).toBe("web");
    }

    expect(verifyOtpSchema.safeParse({ ...validOtp, code: "000000" }).success).toBe(true);
    expect(verifyOtpSchema.safeParse({ ...validOtp, code: "12345" }).success).toBe(false); // 5 digits
    expect(verifyOtpSchema.safeParse({ ...validOtp, code: "1234567" }).success).toBe(false); // 7 digits
    expect(verifyOtpSchema.safeParse({ ...validOtp, code: "abcdef" }).success).toBe(false); // non-digits
    expect(verifyOtpSchema.safeParse({ ...validOtp, code: "12345a" }).success).toBe(false);
    expect(verifyOtpSchema.safeParse({ ...validOtp, code: " 123456" }).success).toBe(false);

    // registerTraveler defaults
    const validReg = {
      fullName: "Ahmed Ali",
    };
    const regParsed = registerTravelerSchema.safeParse(validReg);
    expect(regParsed.success).toBe(true);
    if (regParsed.success) {
      expect(regParsed.data.preferredSignInMethod).toBe("otp");
      expect(regParsed.data.preferredLanguage).toBe("ar");
      expect(regParsed.data.surface).toBe("web");
      expect(regParsed.data.enableParentRole).toBe(false);
    }

    // email format validation
    expect(
      registerTravelerSchema.safeParse({ ...validReg, email: "valid@example.com" }).success,
    ).toBe(true);
    expect(registerTravelerSchema.safeParse({ ...validReg, email: "invalid-email" }).success).toBe(
      false,
    );
    expect(registerTravelerSchema.safeParse({ ...validReg, email: null }).success).toBe(true);

    // updateAuthSettings bounds
    const validSettingsUpdate = {
      reason: "Updating security parameters for compliance",
      otpExpirySeconds: 300,
    };
    expect(updateAuthSettingsSchema.safeParse(validSettingsUpdate).success).toBe(true);
    expect(
      updateAuthSettingsSchema.safeParse({ ...validSettingsUpdate, otpExpirySeconds: 59 }).success,
    ).toBe(false);
    expect(
      updateAuthSettingsSchema.safeParse({ ...validSettingsUpdate, otpExpirySeconds: 60 }).success,
    ).toBe(true);
    expect(
      updateAuthSettingsSchema.safeParse({ ...validSettingsUpdate, otpExpirySeconds: 900 }).success,
    ).toBe(true);
    expect(
      updateAuthSettingsSchema.safeParse({ ...validSettingsUpdate, otpExpirySeconds: 901 }).success,
    ).toBe(false);
    expect(
      updateAuthSettingsSchema.safeParse({ ...validSettingsUpdate, reason: "shrt" }).success,
    ).toBe(false); // min 5
  });

  // 6. Organization Service Refinements (Hex Colors, Emails)
  test("Organization: updateOrganizationSettingsSchema hex color regex & email", async () => {
    const { updateOrganizationSettingsSchema } =
      await import("../../../../packages/services/organization/src/schemas/validation/index");

    const validSettings = {
      displayNameEn: "Alpha Tours",
      primaryColorHex: "#FF5733",
      secondaryColorHex: "#00AABB",
      operationsContactEmail: "ops@alphatours.com",
    };

    expect(updateOrganizationSettingsSchema.safeParse(validSettings).success).toBe(true);
    expect(
      updateOrganizationSettingsSchema.safeParse({ ...validSettings, primaryColorHex: null })
        .success,
    ).toBe(true);

    // Invalid hex colors
    expect(
      updateOrganizationSettingsSchema.safeParse({ ...validSettings, primaryColorHex: "#FFF" })
        .success,
    ).toBe(false);
    expect(
      updateOrganizationSettingsSchema.safeParse({ ...validSettings, primaryColorHex: "FF5733" })
        .success,
    ).toBe(false);
    expect(
      updateOrganizationSettingsSchema.safeParse({ ...validSettings, primaryColorHex: "#GGGGGG" })
        .success,
    ).toBe(false);
    expect(
      updateOrganizationSettingsSchema.safeParse({ ...validSettings, primaryColorHex: "#1234567" })
        .success,
    ).toBe(false);
    expect(
      updateOrganizationSettingsSchema.safeParse({ ...validSettings, primaryColorHex: "red" })
        .success,
    ).toBe(false);

    // Invalid email
    expect(
      updateOrganizationSettingsSchema.safeParse({
        ...validSettings,
        operationsContactEmail: "not-an-email",
      }).success,
    ).toBe(false);
    expect(
      updateOrganizationSettingsSchema.safeParse({ ...validSettings, operationsContactEmail: null })
        .success,
    ).toBe(true);

    // seatPriorityWindowMinutes min(15) max(1440)
    expect(
      updateOrganizationSettingsSchema.safeParse({ seatPriorityWindowMinutes: 15 }).success,
    ).toBe(true);
    expect(
      updateOrganizationSettingsSchema.safeParse({ seatPriorityWindowMinutes: 1440 }).success,
    ).toBe(true);
    expect(
      updateOrganizationSettingsSchema.safeParse({ seatPriorityWindowMinutes: 14 }).success,
    ).toBe(false);
    expect(
      updateOrganizationSettingsSchema.safeParse({ seatPriorityWindowMinutes: 1441 }).success,
    ).toBe(false);
  });

  // 7. Payments Service Refinements
  test("Payments: createPaymentIntentSchema bounds & defaults", async () => {
    const { createPaymentIntentSchema, resolveDisputeSchema } =
      await import("../../../../packages/services/payments/src/schemas/validation/index");

    const validIntent = {
      gateway: "paymob",
      amountMinor: 10000,
    };

    const parsed = createPaymentIntentSchema.safeParse(validIntent);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.purpose).toBe("trip_booking");
      expect(parsed.data.currencyCode).toBe("EGP");
    }

    expect(createPaymentIntentSchema.safeParse({ ...validIntent, amountMinor: 99 }).success).toBe(
      false,
    );
    expect(createPaymentIntentSchema.safeParse({ ...validIntent, amountMinor: 100 }).success).toBe(
      true,
    );
    expect(
      createPaymentIntentSchema.safeParse({ ...validIntent, amountMinor: 500_000_000 }).success,
    ).toBe(true);
    expect(
      createPaymentIntentSchema.safeParse({ ...validIntent, amountMinor: 500_000_001 }).success,
    ).toBe(false);

    // resolveDispute resolution enum
    const validDispute = {
      paymentId: "10000000-0000-4000-8000-000000000001",
      resolution: "resolved_refund",
    };
    expect(resolveDisputeSchema.safeParse(validDispute).success).toBe(true);
    expect(
      resolveDisputeSchema.safeParse({ ...validDispute, resolution: "resolved_merchant" }).success,
    ).toBe(true);
    expect(resolveDisputeSchema.safeParse({ ...validDispute, resolution: "refund" }).success).toBe(
      false,
    );
  });

  // 8. Trips Service Refinements (Coordinates, Route Points, Defaults)
  test("Trips: route points coordinates and insert base defaults", async () => {
    const { tripRoutePointSchema, tripInsertBaseSchema } =
      await import("../../../../packages/services/trips/src/schemas/validation/index");

    const validPoint = {
      nameAr: "ميدان التحرير",
      nameEn: "Tahrir Square",
      latitude: 30.0444,
      longitude: 31.2357,
    };

    expect(tripRoutePointSchema.safeParse(validPoint).success).toBe(true);
    // latitude min(-90) max(90)
    expect(tripRoutePointSchema.safeParse({ ...validPoint, latitude: -90 }).success).toBe(true);
    expect(tripRoutePointSchema.safeParse({ ...validPoint, latitude: 90 }).success).toBe(true);
    expect(tripRoutePointSchema.safeParse({ ...validPoint, latitude: -90.001 }).success).toBe(
      false,
    );
    expect(tripRoutePointSchema.safeParse({ ...validPoint, latitude: 90.001 }).success).toBe(false);
    // longitude min(-180) max(180)
    expect(tripRoutePointSchema.safeParse({ ...validPoint, longitude: -180 }).success).toBe(true);
    expect(tripRoutePointSchema.safeParse({ ...validPoint, longitude: 180 }).success).toBe(true);
    expect(tripRoutePointSchema.safeParse({ ...validPoint, longitude: -180.001 }).success).toBe(
      false,
    );
    expect(tripRoutePointSchema.safeParse({ ...validPoint, longitude: 180.001 }).success).toBe(
      false,
    );

    // tripInsertBaseSchema defaults
    const validTripInsert = {
      titleAr: "رحلة الفيوم",
      titleEn: "Fayoum Safari",
      categoryLookupCode: "CAT_SAFARI",
      origin: validPoint,
      destinations: [validPoint],
      basePriceMinor: 150000,
    };

    const tripParsed = tripInsertBaseSchema.safeParse(validTripInsert);
    expect(tripParsed.success).toBe(true);
    if (tripParsed.success) {
      expect(tripParsed.data.language).toBe("ar");
      expect(tripParsed.data.timezone).toBe("Africa/Cairo");
      expect(tripParsed.data.seatAssignmentMode).toBe("organization_assigned");
      expect(tripParsed.data.currencyCode).toBe("EGP");
      expect(tripParsed.data.publishMode).toBe("draft");
      expect(tripParsed.data.state).toBe("draft");
      expect(tripParsed.data.targetedAudienceIds).toEqual([]);
    }
  });

  // 9. Onboarding Service Refinements (MIME types, File Sizes, Defaults)
  test("Onboarding: document upload MIME types & submit application defaults", async () => {
    const { documentUploadInputSchema, submitOrganizationApplicationSchema } =
      await import("../../../../packages/services/onboarding/src/schemas/validation/index");

    const validDoc = {
      documentType: "commercial_registry",
      storageKey: "org/docs/cr_123.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 1024 * 500,
    };

    expect(documentUploadInputSchema.safeParse(validDoc).success).toBe(true);
    expect(
      documentUploadInputSchema.safeParse({ ...validDoc, mimeType: "image/jpeg" }).success,
    ).toBe(true);
    expect(
      documentUploadInputSchema.safeParse({ ...validDoc, mimeType: "image/png" }).success,
    ).toBe(true);
    expect(
      documentUploadInputSchema.safeParse({ ...validDoc, mimeType: "image/webp" }).success,
    ).toBe(true);
    expect(
      documentUploadInputSchema.safeParse({ ...validDoc, mimeType: "application/msword" }).success,
    ).toBe(false);
    expect(
      documentUploadInputSchema.safeParse({ ...validDoc, mimeType: "application/octet-stream" })
        .success,
    ).toBe(false);

    // fileSizeBytes min(1) max(15MB)
    expect(documentUploadInputSchema.safeParse({ ...validDoc, fileSizeBytes: 0 }).success).toBe(
      false,
    );
    expect(documentUploadInputSchema.safeParse({ ...validDoc, fileSizeBytes: 1 }).success).toBe(
      true,
    );
    expect(
      documentUploadInputSchema.safeParse({ ...validDoc, fileSizeBytes: 15 * 1024 * 1024 }).success,
    ).toBe(true);
    expect(
      documentUploadInputSchema.safeParse({ ...validDoc, fileSizeBytes: 15 * 1024 * 1024 + 1 })
        .success,
    ).toBe(false);

    // submitOrganizationApplicationSchema defaults
    const validOrgApp = {
      legalEntityName: "Nile Travel SAE",
      displayNameEn: "Nile Travel",
      displayNameAr: "نايل ترافيل",
      headquartersAddress: "123 Nile St, Zamalek, Cairo",
      signatoryFullName: "Hassan Mohamed",
      signatoryRoleTitle: "Managing Director",
      commercialRegNumber: "CR-123456",
      taxNumber: "TAX-987654",
      tourismLicenseNumber: "TL-554433",
      tourismLicenseExpiry: "2027-10-20T00:00:00Z",
      signatoryNationalId: "29001011234567",
      payoutIbanOrWallet: "EG123456789012345678901234567",
      billingContactName: "Sara Ahmed",
      billingContactEmail: "billing@niletravel.com",
      billingContactPhone: "+201012345678",
      billingAddress: "123 Nile St, Zamalek, Cairo",
      documents: [validDoc],
    };

    const orgAppParsed = submitOrganizationApplicationSchema.safeParse(validOrgApp);
    expect(orgAppParsed.success).toBe(true);
    if (orgAppParsed.success) {
      expect(orgAppParsed.data.countryCode).toBe("EG");
      expect(orgAppParsed.data.payoutMethod).toBe("bank_transfer");
      expect(orgAppParsed.data.invoiceLanguage).toBe("ar");
      expect(orgAppParsed.data.childSafetyProgramOptIn).toBe(false);
    }
  });

  // 10. Media Service superRefine check
  test("Media: superRefine validateFileForPurpose enforcement", async () => {
    const { createUploadIntentSchema } =
      await import("../../../../packages/services/media/src/schemas/validation/index");

    // KYC purpose allows PDF and images within 10MB
    const validKycUpload = {
      originalFilename: "id_scan.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 2 * 1024 * 1024,
      purpose: "kyc",
    };

    expect(createUploadIntentSchema.safeParse(validKycUpload).success).toBe(true);

    // KYC purpose rejecting video
    const invalidKycVideo = {
      originalFilename: "video.mp4",
      mimeType: "video/mp4",
      fileSizeBytes: 2 * 1024 * 1024,
      purpose: "kyc",
    };
    const kycResult = createUploadIntentSchema.safeParse(invalidKycVideo);
    expect(kycResult.success).toBe(false);

    // Avatar purpose allowing image/jpeg but rejecting pdf
    const invalidAvatarPdf = {
      originalFilename: "avatar.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 500 * 1024,
      purpose: "avatar",
    };
    const avatarResult = createUploadIntentSchema.safeParse(invalidAvatarPdf);
    expect(avatarResult.success).toBe(false);
  });
});
