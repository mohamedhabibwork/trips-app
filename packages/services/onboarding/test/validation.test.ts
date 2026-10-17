import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { mapOnboardingError, OnboardingServiceError } from "../src/errors";
import {
  approveApplicationSchema,
  decideAppealSchema,
  documentUploadInputSchema,
  getApplicationDetailSchema,
  getApplicationStatusSchema,
  listOrganizationSuppliersSchema,
  listReviewQueueSchema,
  onboardOrganizationSupplierSchema,
  openApplicationDocumentSchema,
  rejectApplicationSchema,
  removeOrganizationSupplierSchema,
  requestApplicationChangesSchema,
  requestChangesExtensionSchema,
  resubmitApplicationSchema,
  submitAppealSchema,
  submitDriverApplicationSchema,
  submitOrganizationApplicationSchema,
  submitPhotographerApplicationSchema,
  verifyApplicationDocumentSchema,
} from "../src/schemas/validation";

describe("Unit: onboarding validation schemas & errors (@trips-app/service-onboarding)", () => {
  describe("documentUploadInputSchema", () => {
    test("accepts valid PDF/JPEG/PNG/WEBP document metadata within 15 MB", () => {
      // Arrange
      const input = {
        documentType: "commercial_registration",
        storageKey: "docs/org/cr-2026.pdf",
        mimeType: "application/pdf",
        fileSizeBytes: 1024 * 512,
      };

      // Act
      const result = documentUploadInputSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
    });

    test("rejects unsupported mimeType or file larger than 15 MB", () => {
      // Arrange / Act / Assert
      expect(
        documentUploadInputSchema.safeParse({
          documentType: "commercial_registration",
          storageKey: "docs/org/cr.exe",
          mimeType: "application/x-msdownload",
          fileSizeBytes: 1024,
        }).success,
      ).toBe(false);

      expect(
        documentUploadInputSchema.safeParse({
          documentType: "commercial_registration",
          storageKey: "docs/org/cr.pdf",
          mimeType: "application/pdf",
          fileSizeBytes: 16 * 1024 * 1024,
        }).success,
      ).toBe(false);
    });
  });

  describe("submitOrganizationApplicationSchema", () => {
    test("accepts a complete organization application payload", () => {
      // Arrange
      const input = {
        legalEntityName: "Nile Horizon Tours SAE",
        displayNameEn: "Nile Horizon",
        displayNameAr: "أفق النيل",
        commercialRegNumber: "CR-998877",
        taxNumber: "TX-112233",
        tourismLicenseNumber: "TL-445566",
        tourismLicenseExpiry: "2028-12-31T00:00:00.000Z",
        countryCode: "EG",
        headquartersAddress: "12 Corniche El Nil, Cairo, Egypt",
        signatoryFullName: "Tarek Mansour",
        signatoryNationalId: "28001010101234",
        signatoryRoleTitle: "Managing Director",
        payoutMethod: "bank_transfer",
        payoutIbanOrWallet: "EG380019000500000000263180002",
        billingContactName: "Nadia Mansour",
        billingContactEmail: "billing@nilehorizon.eg",
        billingContactPhone: "+201012345678",
        billingAddress: "12 Corniche El Nil, Cairo, Egypt",
        invoiceLanguage: "ar",
        childSafetyProgramOptIn: true,
        safetyLeadName: "Salma Hassan",
        safetyHotlinePhone: "+201099998888",
        emergencyEscalationAcknowledged: true,
        documents: [
          {
            documentType: "commercial_registration",
            storageKey: "org/cr.pdf",
            mimeType: "application/pdf",
            fileSizeBytes: 204800,
          },
        ],
      };

      // Act
      const result = submitOrganizationApplicationSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
    });

    test("rejects organization payload with empty documents array or unsupported country", () => {
      // Arrange / Act
      const result = submitOrganizationApplicationSchema.safeParse({
        legalEntityName: "Nile Horizon",
        displayNameEn: "Nile Horizon",
        displayNameAr: "أفق النيل",
        commercialRegNumber: "CR-1",
        taxNumber: "TX-1",
        tourismLicenseNumber: "TL-1",
        tourismLicenseExpiry: "2028-12-31T00:00:00.000Z",
        countryCode: "FR",
        headquartersAddress: "12 Corniche El Nil",
        signatoryFullName: "Tarek Mansour",
        signatoryNationalId: "28001010101234",
        signatoryRoleTitle: "CEO",
        payoutMethod: "bank_transfer",
        payoutIbanOrWallet: "EG3800190005",
        billingContactName: "Nadia",
        billingContactEmail: "billing@nile.eg",
        billingContactPhone: "+201012345678",
        billingAddress: "12 Corniche El Nil",
        documents: [],
      });

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe("submitDriverApplicationSchema", () => {
    test("accepts a valid platform driver application with consents and vehicle details", () => {
      // Arrange
      const input = {
        nationalId: "28805050101234",
        licenseNumber: "EG-PRO-998877",
        licenseCategory: "First Degree Bus",
        licenseExpiry: "2028-06-30T00:00:00.000Z",
        yearsOfExperience: 6,
        serviceAreas: ["Cairo", "Giza"],
        hasOwnVehicle: true,
        vehicleMakeModel: "Toyota Coaster",
        vehicleYear: 2024,
        vehiclePlateNumber: "ق هـ ر 4821",
        vehicleSeatCapacity: 28,
        insurancePolicyNumber: "INS-774411",
        insuranceExpiry: "2027-06-30T00:00:00.000Z",
        labTestConsentSigned: true,
        backgroundCheckConsentSigned: true,
        labResultSubmittedAt: "2026-10-15T00:00:00.000Z",
        documents: [
          {
            documentType: "commercial_license",
            storageKey: "driver/lic.pdf",
            mimeType: "application/pdf",
            fileSizeBytes: 120000,
          },
        ],
      };

      // Act
      const result = submitDriverApplicationSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("submitPhotographerApplicationSchema", () => {
    test("accepts a valid photographer application with equipment and portfolio metadata", () => {
      // Arrange
      const input = {
        nationalId: "29203030101234",
        yearsOfExperience: 4,
        cameraBodies: ["Sony A7 IV", "Canon EOS R6"],
        lenses: ["24-70mm f/2.8", "70-200mm f/2.8"],
        hasDroneLicense: false,
        serviceRegions: ["Cairo", "Luxor"],
        specialties: ["Cultural Heritage", "Desert Safari"],
        portfolioPhotoCount: 10,
        sampleAlbums: [{ title: "Luxor Sunrise", photoCount: 10 }],
        documents: [
          {
            documentType: "national_id",
            storageKey: "photographer/id.jpg",
            mimeType: "image/jpeg",
            fileSizeBytes: 95000,
          },
        ],
      };

      // Act
      const result = submitPhotographerApplicationSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("Admin & Supplier Lifecycle Schemas", () => {
    test("validates status, extension, resubmit, appeal, document verification, and org supplier schemas", () => {
      // Arrange
      const id = randomUUID();

      // Act / Assert
      expect(getApplicationStatusSchema.safeParse({ applicationId: id }).success).toBe(true);
      expect(getApplicationStatusSchema.safeParse({}).success).toBe(true);
      expect(requestChangesExtensionSchema.safeParse({ applicationId: id }).success).toBe(true);
      expect(
        resubmitApplicationSchema.safeParse({
          applicationId: id,
          updatedPayload: { taxNumber: "TX-UPDATED" },
        }).success,
      ).toBe(true);
      expect(
        submitAppealSchema.safeParse({
          applicationId: id,
          appealStatement: "Attached updated official ministry certificate.",
        }).success,
      ).toBe(true);
      expect(
        onboardOrganizationSupplierSchema.safeParse({
          supplierRole: "org_driver",
          fullName: "Mahmoud Driver",
          phone: "+201055556666",
          nationalId: "28501010109999",
          labTestConsentSigned: true,
        }).success,
      ).toBe(true);
      expect(
        listOrganizationSuppliersSchema.safeParse({ supplierRole: "org_driver" }).success,
      ).toBe(true);
      expect(
        removeOrganizationSupplierSchema.safeParse({
          supplierAccountId: id,
          supplierRole: "org_driver",
          reason: "Contract ended",
        }).success,
      ).toBe(true);
      expect(
        listReviewQueueSchema.safeParse({
          state: "Pending Review",
          applicationType: "organization",
          overdueOnly: false,
          duplicateHoldOnly: true,
        }).success,
      ).toBe(true);
      expect(getApplicationDetailSchema.safeParse({ applicationId: id }).success).toBe(true);
      expect(
        verifyApplicationDocumentSchema.safeParse({
          applicationId: id,
          documentId: id,
          verifiedStatus: "verified",
        }).success,
      ).toBe(true);
      expect(
        openApplicationDocumentSchema.safeParse({
          applicationId: id,
          documentId: id,
          reason: "Verify commercial registration stamp",
        }).success,
      ).toBe(true);
      expect(approveApplicationSchema.safeParse({ applicationId: id }).success).toBe(true);
      expect(
        requestApplicationChangesSchema.safeParse({
          applicationId: id,
          decisionReasonCode: "blurry_document",
          decisionNotes: "Please re-upload a clear scan of the tourism license.",
          checklist: [{ field: "tourismLicense", instruction: "Upload 300dpi scan" }],
        }).success,
      ).toBe(true);
      expect(
        rejectApplicationSchema.safeParse({
          applicationId: id,
          decisionReasonCode: "expired_license",
          decisionNotes: "Tourism license is expired and could not be verified.",
        }).success,
      ).toBe(true);
      expect(
        decideAppealSchema.safeParse({
          applicationId: id,
          decision: "approve",
          decisionReasonCode: "appeal_verified",
          decisionNotes: "Verified renewed license with Ministry of Tourism.",
        }).success,
      ).toBe(true);
    });

    test("OnboardingServiceError maps to standardized shared error envelope", () => {
      // Arrange
      const err = new OnboardingServiceError("PRECONDITION_FAILED", "Invalid transition");

      // Act
      const mapped = mapOnboardingError(err);

      // Assert
      expect(err.code).toBe("PRECONDITION_FAILED");
      expect(mapped.code).toBe("PRECONDITION_FAILED");
    });
  });
});
