import { describe, expect, test } from "bun:test";

import {
  addWorkingDays,
  ADMIN_SUB_ROLES,
  canTransitionApplicationState,
  computeBlindIndex,
  computeTotpCode,
  createDefaultOrganizationSettings,
  DEFAULT_AUTH_SETTINGS,
  DEFAULT_PERMISSION_CATALOG,
  DEFAULT_PLAN_CATALOG,
  DEFAULT_SYSTEM_SETTINGS,
  decryptField,
  encryptField,
  evaluateOtpAttempt,
  evaluateSignInLockout,
  generateTotpSecret,
  hasAdminSubRolePermission,
  hasEmployeePermission,
  hasRequiredVerifiedChannels,
  hashPassword,
  isRejectedApplicantBlocked,
  isWithinDeletionGraceWindow,
  ORG_PERMISSION_AREAS,
  ROLE_AUTH_DEFAULTS,
  signAccessToken,
  USER_ROLES,
  validateDriverApplication,
  validateOrganizationApplication,
  validateOrganizationSettingsAgainstPlan,
  validatePasswordPolicy,
  validatePhotographerApplication,
  validateRegistrationInput,
  verifyAccessToken,
  verifyPassword,
  verifyTotpCode,
} from "../src";

describe("@trips-app/domain — Roles, Permissions, Plans & Settings", () => {
  test("defines all 10 user roles, 3 admin sub-roles, 9 org permission areas, and 12 plans", () => {
    expect(USER_ROLES).toHaveLength(10);
    expect(ADMIN_SUB_ROLES).toEqual(["super_admin", "operations", "finance"]);
    expect(ORG_PERMISSION_AREAS).toHaveLength(9);
    expect(DEFAULT_PERMISSION_CATALOG).toHaveLength(9);
    expect(DEFAULT_PLAN_CATALOG).toHaveLength(12);

    for (const role of USER_ROLES) {
      expect(ROLE_AUTH_DEFAULTS[role]).toBeDefined();
      expect(ROLE_AUTH_DEFAULTS[role].role).toBe(role);
    }
  });

  test("enforces registration surface and verification channel rules (D-20, D-86, FR-AUTH-11)", () => {
    // Traveler can register with email OR phone on web/mobile/pwa
    expect(
      validateRegistrationInput({
        role: "traveler",
        surface: "mobile",
        phone: "+201012345678",
      }).valid,
    ).toBe(true);

    // Organization owner is web-only (FR-AUTH-11) and requires BOTH email and phone (D-20)
    expect(
      validateRegistrationInput({
        role: "organization_owner",
        surface: "mobile",
        email: "owner@org.eg",
        phone: "+201012345678",
      }).valid,
    ).toBe(false);

    expect(
      validateRegistrationInput({
        role: "organization_owner",
        surface: "web",
        email: "owner@org.eg",
        phone: null,
      }).valid,
    ).toBe(false);

    expect(
      validateRegistrationInput({
        role: "organization_owner",
        surface: "web",
        email: "owner@org.eg",
        phone: "+201012345678",
      }).valid,
    ).toBe(true);

    // Admin cannot self-register (D-13)
    expect(
      validateRegistrationInput({
        role: "admin",
        surface: "web",
        email: "hacker@trips-enjoy.com",
      }).valid,
    ).toBe(false);
  });

  test("checks required verified channels per role (D-20)", () => {
    const now = new Date();
    expect(
      hasRequiredVerifiedChannels("traveler", { emailVerifiedAt: null, phoneVerifiedAt: now }),
    ).toBe(true);
    expect(
      hasRequiredVerifiedChannels("platform_driver", {
        emailVerifiedAt: null,
        phoneVerifiedAt: now,
      }),
    ).toBe(false);
    expect(
      hasRequiredVerifiedChannels("platform_driver", {
        emailVerifiedAt: now,
        phoneVerifiedAt: now,
      }),
    ).toBe(true);
  });

  test("enforces password policy (12+ chars & breached password list, NFR-SEC-02, D-51)", () => {
    expect(validatePasswordPolicy("short123").valid).toBe(false);
    expect(validatePasswordPolicy("password123456").valid).toBe(false);
    expect(validatePasswordPolicy("StrongPass!2026#Trips").valid).toBe(true);
  });

  test("evaluates OTP attempts and 5-wrong-code 15-minute pause (BRL-20)", () => {
    const now = new Date("2026-10-17T12:00:00Z");
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    // 4th wrong attempt -> not paused yet
    const fourth = evaluateOtpAttempt({
      state: { wrongAttempts: 3, pausedUntil: null, expiresAt, consumedAt: null },
      providedMatches: false,
      now,
    });
    expect(fourth.matched).toBe(false);
    expect(fourth.nextWrongAttempts).toBe(4);
    expect(fourth.nextPausedUntil).toBeNull();

    // 5th wrong attempt -> pauses for 15 minutes
    const fifth = evaluateOtpAttempt({
      state: { wrongAttempts: 4, pausedUntil: null, expiresAt, consumedAt: null },
      providedMatches: false,
      now,
    });
    expect(fifth.matched).toBe(false);
    expect(fifth.code).toBe("RATE_LIMITED");
    expect(fifth.nextWrongAttempts).toBe(5);
    expect(fifth.nextPausedUntil?.getTime()).toBe(now.getTime() + 15 * 60 * 1000);
  });

  test("evaluates sign-in lockout after 5 failed attempts (BRL-21, D-53)", () => {
    const now = new Date("2026-10-17T12:00:00Z");
    const locked = evaluateSignInLockout({
      failedAttempts: 4,
      lockedUntil: null,
      succeeded: false,
      now,
    });
    expect(locked.locked).toBe(true);
    expect(locked.nextFailedAttempts).toBe(5);
    expect(locked.remainingLockoutSeconds).toBe(900);
  });

  test("enforces plan-gated organization settings (CON-06, FR-ORG-05, D-05, SCR-ORG-03)", () => {
    // Starter cannot enable seatSelfSelection, childTracking, or customBranding
    expect(
      validateOrganizationSettingsAgainstPlan("starter", {
        seatSelfSelectionEnabled: true,
      }).valid,
    ).toBe(false);
    expect(
      validateOrganizationSettingsAgainstPlan("starter", {
        childTrackingEnabledByDefault: true,
      }).valid,
    ).toBe(false);

    // Growth can enable seatSelfSelection and childTracking, but NOT customBranding
    expect(
      validateOrganizationSettingsAgainstPlan("growth", {
        seatSelfSelectionEnabled: true,
        childTrackingEnabledByDefault: true,
      }).valid,
    ).toBe(true);
    expect(
      validateOrganizationSettingsAgainstPlan("growth", {
        customBrandingEnabled: true,
      }).valid,
    ).toBe(false);

    // Enterprise can enable all
    expect(
      validateOrganizationSettingsAgainstPlan("enterprise", {
        seatSelfSelectionEnabled: true,
        childTrackingEnabledByDefault: true,
        customBrandingEnabled: true,
      }).valid,
    ).toBe(true);
  });

  test("validates employee permissions (D-284) and admin sub-roles (D-49)", () => {
    expect(hasEmployeePermission({ trips: "view" }, "trips", "view")).toBe(true);
    expect(hasEmployeePermission({ trips: "view" }, "trips", "manage")).toBe(false);
    expect(hasEmployeePermission({ trips: "manage" }, "trips", "manage")).toBe(true);

    expect(hasAdminSubRolePermission("super_admin", "settings.system.manage")).toBe(true);
    expect(hasAdminSubRolePermission("operations", "settings.system.manage")).toBe(false);
    expect(hasAdminSubRolePermission("operations", "applications.review")).toBe(true);
    expect(hasAdminSubRolePermission("finance", "finance.payouts.manage")).toBe(true);
    expect(hasAdminSubRolePermission("finance", "applications.review")).toBe(false);
  });

  test("validates onboarding state machine and supplier application rules (SRS 7.5)", () => {
    expect(canTransitionApplicationState("Submitted", "Pending Review")).toBe(true);
    expect(canTransitionApplicationState("Pending Review", "Approved")).toBe(true);
    expect(canTransitionApplicationState("Pending Review", "Changes Requested")).toBe(true);
    expect(canTransitionApplicationState("Rejected", "Appealed")).toBe(true);
    expect(canTransitionApplicationState("Rejected", "Approved")).toBe(false);

    const now = new Date("2026-10-17T12:00:00Z");

    // Photographer requires >= 8 portfolio photos (FR-ONB-06, D-01)
    expect(
      validatePhotographerApplication({
        nationalId: "29001010101234",
        yearsOfExperience: 3,
        cameraBodies: ["Sony A7 IV"],
        lenses: ["24-70mm"],
        hasDroneLicense: false,
        serviceRegions: ["Cairo"],
        specialties: ["Trips"],
        portfolioPhotoCount: 7,
        sampleAlbums: [],
        documentTypes: ["id"],
      }).valid,
    ).toBe(false);

    expect(
      validatePhotographerApplication({
        nationalId: "29001010101234",
        yearsOfExperience: 3,
        cameraBodies: ["Sony A7 IV"],
        lenses: ["24-70mm"],
        hasDroneLicense: false,
        serviceRegions: ["Cairo"],
        specialties: ["Trips"],
        portfolioPhotoCount: 8,
        sampleAlbums: [],
        documentTypes: ["id"],
      }).valid,
    ).toBe(true);

    // Driver with own vehicle requires insurance valid >= 3 months (FR-ONB-07)
    expect(
      validateDriverApplication(
        {
          nationalId: "28501010101234",
          licenseNumber: "LIC-1",
          licenseCategory: "First Degree",
          licenseExpiry: new Date("2028-01-01T00:00:00Z"),
          yearsOfExperience: 5,
          serviceAreas: ["Cairo"],
          hasOwnVehicle: true,
          vehiclePlateNumber: "ABC-123",
          insuranceExpiry: new Date("2026-12-01T00:00:00Z"), // < 3 months
          labTestConsentSigned: true,
          labResultSubmittedAt: new Date("2026-10-10T00:00:00Z"),
          documentTypes: ["license"],
        },
        now,
      ).valid,
    ).toBe(false);

    expect(
      validateDriverApplication(
        {
          nationalId: "28501010101234",
          licenseNumber: "LIC-1",
          licenseCategory: "First Degree",
          licenseExpiry: new Date("2028-01-01T00:00:00Z"),
          yearsOfExperience: 5,
          serviceAreas: ["Cairo"],
          hasOwnVehicle: true,
          vehiclePlateNumber: "ABC-123",
          insuranceExpiry: new Date("2027-02-01T00:00:00Z"), // >= 3 months
          labTestConsentSigned: true,
          backgroundCheckConsentSigned: true,
          labResultSubmittedAt: new Date("2026-10-10T00:00:00Z"),
          documentTypes: ["license"],
        },
        now,
      ).valid,
    ).toBe(true);

    // Organization opting into child safety requires safetyLeadName & safetyHotlinePhone (D-68)
    expect(
      validateOrganizationApplication(
        {
          legalEntityName: "Cairo Tours",
          commercialRegNumber: "CR-1",
          taxNumber: "TX-1",
          tourismLicenseNumber: "TL-1",
          tourismLicenseExpiry: new Date("2028-01-01T00:00:00Z"),
          countryCode: "EG",
          headquartersAddress: "Cairo",
          signatoryFullName: "Owner",
          signatoryNationalId: "28001010101234",
          signatoryRoleTitle: "CEO",
          payoutMethod: "bank_transfer",
          payoutIbanOrWallet: "EG123456",
          billingContactName: "Billing",
          billingContactEmail: "billing@cairo.eg",
          billingContactPhone: "+201000000000",
          billingAddress: "Cairo",
          invoiceLanguage: "ar",
          childSafetyProgramOptIn: true,
          documentTypes: ["cr"],
        },
        now,
      ).valid,
    ).toBe(false);

    expect(addWorkingDays(now, 2).getTime()).toBeGreaterThan(now.getTime());
    expect(
      isRejectedApplicantBlocked({
        state: "Rejected",
        rejectedAt: now,
        reapplyBlockedUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        now,
      }),
    ).toBe(true);
    expect(
      isWithinDeletionGraceWindow(
        new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        now,
        DEFAULT_AUTH_SETTINGS,
      ),
    ).toBe(true);
    expect(DEFAULT_SYSTEM_SETTINGS.markets.EG.enabled).toBe(true);
    expect(createDefaultOrganizationSettings({ tenantId: "t1" }).timeZone).toBe("Africa/Cairo");
  });

  test("encrypts/decrypts PII, hashes passwords with Argon2id, verifies TOTP, and signs/verifies 15m JWTs", async () => {
    const encrypted = encryptField("+201000000001");
    expect(encrypted).not.toContain("+201000000001");
    expect(decryptField(encrypted)).toBe("+201000000001");

    expect(computeBlindIndex("User@trips-enjoy.com")).toBe(
      computeBlindIndex("user@trips-enjoy.com"),
    );

    const hash = await hashPassword("SuperSecretPassword123!");
    expect(await verifyPassword("SuperSecretPassword123!", hash)).toBe(true);
    expect(await verifyPassword("WrongPassword123!", hash)).toBe(false);

    const secret = generateTotpSecret();
    const nowMs = 1_760_000_000_000;
    const totp = computeTotpCode(secret, nowMs);
    expect(verifyTotpCode(secret, totp, nowMs)).toBe(true);
    expect(verifyTotpCode(secret, "000000", nowMs)).toBe(totp === "000000");

    const token = signAccessToken(
      {
        sub: "acc-1",
        sid: "sess-1",
        role: "organization_owner",
        tenantId: "org-1",
        planTier: "growth",
      },
      { nowMs, ttlSeconds: 900 },
    );
    const claims = verifyAccessToken(token, { nowMs: nowMs + 60_000 });
    expect(claims?.sub).toBe("acc-1");
    expect(claims?.role).toBe("organization_owner");
    expect(claims?.tenantId).toBe("org-1");

    // Expired after 15 minutes
    const expiredClaims = verifyAccessToken(token, { nowMs: nowMs + 901_000 });
    expect(expiredClaims).toBeNull();
  });
});
