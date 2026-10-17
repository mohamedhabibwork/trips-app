// Zod schemas that validate input at the boundary.
import { z } from "zod/v4";

import { APPLICATION_STATES, SUPPLIER_APPLICATION_TYPES } from "../../model";

export const documentUploadInputSchema = z.object({
  documentType: z.string().min(2).max(80),
  storageKey: z.string().min(3).max(255),
  mimeType: z.enum(["application/pdf", "image/jpeg", "image/png", "image/webp"]),
  fileSizeBytes: z
    .number()
    .int()
    .min(1)
    .max(15 * 1024 * 1024),
  expiresAt: z.string().datetime().optional(),
});

export const submitOrganizationApplicationSchema = z.object({
  legalEntityName: z.string().min(2).max(160),
  displayNameEn: z.string().min(2).max(120),
  displayNameAr: z.string().min(2).max(120),
  commercialRegNumber: z.string().min(2).max(80),
  taxNumber: z.string().min(2).max(80),
  tourismLicenseNumber: z.string().min(2).max(80),
  tourismLicenseExpiry: z.string().datetime(),
  countryCode: z.enum(["EG", "SA", "AE"]).default("EG"),
  headquartersAddress: z.string().min(5).max(300),
  signatoryFullName: z.string().min(2).max(120),
  signatoryNationalId: z.string().min(6).max(30),
  signatoryRoleTitle: z.string().min(2).max(80),
  payoutMethod: z.enum(["bank_transfer", "mobile_wallet"]).default("bank_transfer"),
  payoutIbanOrWallet: z.string().min(6).max(64),
  billingContactName: z.string().min(2).max(120),
  billingContactEmail: z.string().email(),
  billingContactPhone: z.string().min(8).max(25),
  billingAddress: z.string().min(5).max(300),
  invoiceLanguage: z.enum(["ar", "en"]).default("ar"),
  childSafetyProgramOptIn: z.boolean().default(false),
  safetyLeadName: z.string().optional().nullable(),
  safetyHotlinePhone: z.string().optional().nullable(),
  emergencyEscalationAcknowledged: z.boolean().optional(),
  documents: z.array(documentUploadInputSchema).min(1),
});

export const submitDriverApplicationSchema = z.object({
  nationalId: z.string().min(6).max(30),
  licenseNumber: z.string().min(3).max(40),
  licenseCategory: z.string().min(2).max(60),
  licenseExpiry: z.string().datetime(),
  yearsOfExperience: z.number().int().min(1).max(60),
  serviceAreas: z.array(z.string().min(2)).min(1),
  hasOwnVehicle: z.boolean().default(false),
  vehicleMakeModel: z.string().optional().nullable(),
  vehicleYear: z.number().int().min(2000).max(2035).optional().nullable(),
  vehiclePlateNumber: z.string().optional().nullable(),
  vehicleSeatCapacity: z.number().int().min(1).max(80).optional().nullable(),
  insurancePolicyNumber: z.string().optional().nullable(),
  insuranceExpiry: z.string().datetime().optional().nullable(),
  labTestConsentSigned: z.boolean(),
  labResultSubmittedAt: z.string().datetime(),
  documents: z.array(documentUploadInputSchema).min(1),
});

export const submitPhotographerApplicationSchema = z.object({
  nationalId: z.string().min(6).max(30),
  yearsOfExperience: z.number().int().min(0).max(60),
  cameraBodies: z.array(z.string().min(2)).min(1),
  lenses: z.array(z.string().min(2)).default([]),
  hasDroneLicense: z.boolean().default(false),
  serviceRegions: z.array(z.string().min(2)).min(1),
  specialties: z.array(z.string().min(2)).min(1),
  portfolioPhotoCount: z.number().int().min(1).max(200),
  sampleAlbums: z
    .array(
      z.object({
        title: z.string().min(2).max(120),
        photoCount: z.number().int().min(1),
      }),
    )
    .default([]),
  documents: z.array(documentUploadInputSchema).min(1),
});

export const getApplicationStatusSchema = z
  .object({
    applicationId: z.string().uuid().optional(),
  })
  .optional();

export const requestChangesExtensionSchema = z.object({
  applicationId: z.string().uuid(),
  reason: z.string().min(3).max(300).optional(),
});

export const resubmitApplicationSchema = z.object({
  applicationId: z.string().uuid(),
  updatedPayload: z.record(z.string(), z.unknown()),
  documents: z.array(documentUploadInputSchema).optional(),
});

export const submitAppealSchema = z.object({
  applicationId: z.string().uuid(),
  appealStatement: z.string().min(10).max(2000),
  documents: z.array(documentUploadInputSchema).optional(),
});

export const onboardOrganizationSupplierSchema = z.object({
  supplierRole: z.enum(["org_driver", "org_photographer"]),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(8).max(25),
  email: z.string().email().optional().nullable(),
  password: z.string().min(12).max(128).optional(),
  nationalId: z.string().min(6).max(30),
  // Driver-specific fields
  licenseNumber: z.string().optional(),
  licenseCategory: z.string().optional(),
  licenseExpiry: z.string().datetime().optional(),
  labTestConsentSigned: z.boolean().optional(),
  // Photographer-specific fields
  cameraBodies: z.array(z.string()).optional(),
  portfolioPhotoCount: z.number().int().optional(),
});

export const listReviewQueueSchema = z
  .object({
    state: z.enum(APPLICATION_STATES).optional(),
    applicationType: z.enum(SUPPLIER_APPLICATION_TYPES).optional(),
    overdueOnly: z.boolean().optional(),
  })
  .optional();

export const getApplicationDetailSchema = z.object({
  applicationId: z.string().uuid(),
});

export const approveApplicationSchema = z.object({
  applicationId: z.string().uuid(),
  decisionReasonCode: z.string().min(2).max(80).default("verified_complete"),
  decisionNotes: z.string().max(1000).optional(),
});

export const requestApplicationChangesSchema = z.object({
  applicationId: z.string().uuid(),
  decisionReasonCode: z.string().min(2).max(80),
  decisionNotes: z.string().min(5).max(1000),
  checklist: z
    .array(
      z.object({
        field: z.string().min(1).max(80),
        instruction: z.string().min(3).max(500),
      }),
    )
    .min(1),
});

export const rejectApplicationSchema = z.object({
  applicationId: z.string().uuid(),
  decisionReasonCode: z.string().min(2).max(80),
  decisionNotes: z.string().min(5).max(1000),
});

export const decideAppealSchema = z.object({
  applicationId: z.string().uuid(),
  decision: z.enum(["approve", "uphold_rejection"]),
  decisionReasonCode: z.string().min(2).max(80),
  decisionNotes: z.string().min(5).max(1000),
});
