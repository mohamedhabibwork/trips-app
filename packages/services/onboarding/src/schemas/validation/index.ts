// Zod schemas that validate input at the boundary.
import { createInsertSchema, createUpdateSchema, schema } from "@trips-app/db/zod";
import { z } from "zod/v4";

import { APPLICATION_STATES, SUPPLIER_APPLICATION_TYPES } from "../../model";

const SUPPORTED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;

export const documentUploadInputSchema = createInsertSchema(schema.applicationDocuments, {
  documentType: (col) => col.min(2).max(80),
  storageKey: (col) => col.min(3).max(255),
  mimeType: () => z.enum(SUPPORTED_MIME_TYPES),
  fileSizeBytes: (col) =>
    col
      .int()
      .min(1)
      .max(15 * 1024 * 1024),
})
  .pick({
    documentType: true,
    storageKey: true,
    mimeType: true,
    fileSizeBytes: true,
  })
  .extend({
    expiresAt: z.string().datetime().optional(),
  });

const organizationBaseInsertSchema = createInsertSchema(schema.organizations, {
  legalEntityName: (col) => col.min(2).max(160),
  displayNameEn: (col) => col.min(2).max(120),
  displayNameAr: (col) => col.min(2).max(120),
  countryCode: () => z.enum(["EG", "SA", "AE"]),
  headquartersAddress: (col) => col.min(5).max(300),
  signatoryFullName: (col) => col.min(2).max(120),
  signatoryRoleTitle: (col) => col.min(2).max(80),
  payoutMethod: () => z.enum(["bank_transfer", "mobile_wallet"]),
}).pick({
  legalEntityName: true,
  displayNameEn: true,
  displayNameAr: true,
  countryCode: true,
  headquartersAddress: true,
  signatoryFullName: true,
  signatoryRoleTitle: true,
  payoutMethod: true,
});

export const submitOrganizationApplicationSchema = organizationBaseInsertSchema.extend({
  commercialRegNumber: z.string().min(2).max(80),
  taxNumber: z.string().min(2).max(80),
  tourismLicenseNumber: z.string().min(2).max(80),
  tourismLicenseExpiry: z.string().datetime(),
  signatoryNationalId: z.string().min(6).max(30),
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

const driverProfileBaseInsertSchema = createInsertSchema(schema.driverProfiles, {
  licenseCategory: (col) => col.min(2).max(60),
  yearsOfExperience: (col) => col.int().min(1).max(60),
  serviceAreas: () => z.array(z.string().min(2)).min(1),
  vehicleYear: (col) => col.int().min(2000).max(2035),
  vehicleSeatCapacity: (col) => col.int().min(1).max(80),
}).pick({
  licenseCategory: true,
  yearsOfExperience: true,
  serviceAreas: true,
  hasOwnVehicle: true,
  vehicleMakeModel: true,
  vehicleYear: true,
  vehiclePlateNumber: true,
  vehicleSeatCapacity: true,
  insurancePolicyNumber: true,
});

export const submitDriverApplicationSchema = driverProfileBaseInsertSchema.extend({
  nationalId: z.string().min(6).max(30),
  licenseNumber: z.string().min(3).max(40),
  licenseExpiry: z.string().datetime(),
  yearsOfExperience: z.number().int().min(1).max(60),
  serviceAreas: z.array(z.string().min(2)).min(1),
  insuranceExpiry: z.string().datetime().optional().nullable(),
  labTestConsentSigned: z.boolean(),
  backgroundCheckConsentSigned: z.boolean().default(true),
  labResultSubmittedAt: z.string().datetime(),
  documents: z.array(documentUploadInputSchema).min(1),
});

const sampleAlbumItemSchema = z.object({
  title: z.string().min(2).max(120),
  photoCount: z.number().int().min(1),
});

const photographerProfileBaseInsertSchema = createInsertSchema(schema.photographerProfiles, {
  yearsOfExperience: (col) => col.int().min(0).max(60),
  cameraBodies: () => z.array(z.string().min(2)).min(1),
  lenses: () => z.array(z.string().min(2)),
  serviceRegions: () => z.array(z.string().min(2)).min(1),
  specialties: () => z.array(z.string().min(2)).min(1),
  portfolioPhotoCount: (col) => col.int().min(1).max(200),
  sampleAlbums: () => z.array(sampleAlbumItemSchema),
}).pick({
  yearsOfExperience: true,
  cameraBodies: true,
  lenses: true,
  hasDroneLicense: true,
  serviceRegions: true,
  specialties: true,
  portfolioPhotoCount: true,
  sampleAlbums: true,
});

export const submitPhotographerApplicationSchema = photographerProfileBaseInsertSchema.extend({
  nationalId: z.string().min(6).max(30),
  yearsOfExperience: z.number().int().min(0).max(60),
  cameraBodies: z.array(z.string().min(2)).min(1),
  serviceRegions: z.array(z.string().min(2)).min(1),
  specialties: z.array(z.string().min(2)).min(1),
  portfolioPhotoCount: z.number().int().min(1).max(200),
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

export const listOrganizationSuppliersSchema = z
  .object({
    supplierRole: z.enum(["org_driver", "org_photographer"]).optional(),
  })
  .optional();

export const removeOrganizationSupplierSchema = z.object({
  supplierAccountId: z.string().uuid(),
  supplierRole: z.enum(["org_driver", "org_photographer"]).optional(),
  reason: z.string().min(3).max(500).optional(),
});

export const listReviewQueueSchema = z
  .object({
    state: z.enum(APPLICATION_STATES).optional(),
    applicationType: z.enum(SUPPLIER_APPLICATION_TYPES).optional(),
    overdueOnly: z.boolean().optional(),
    duplicateHoldOnly: z.boolean().optional(),
  })
  .optional();

export const getApplicationDetailSchema = z.object({
  applicationId: z.string().uuid(),
});

export const verifyApplicationDocumentSchema = createUpdateSchema(schema.applicationDocuments, {
  verifiedStatus: () => z.enum(["verified", "rejected"]),
  rejectionNote: (col) => col.max(500),
})
  .pick({
    verifiedStatus: true,
    rejectionNote: true,
  })
  .extend({
    applicationId: z.string().uuid(),
    documentId: z.string().uuid(),
    verifiedStatus: z.enum(["verified", "rejected"]),
  });

export const openApplicationDocumentSchema = z.object({
  applicationId: z.string().uuid(),
  documentId: z.string().uuid(),
  reason: z.string().max(300).optional(),
});

export const approveApplicationSchema = createUpdateSchema(schema.applications, {
  decisionReasonCode: (col) => col.min(2).max(80),
  decisionNotes: (col) => col.max(1000),
})
  .pick({
    decisionNotes: true,
  })
  .extend({
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
