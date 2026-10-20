// Zod schemas that validate input at the boundary.
import {
  insertApplicationDocumentsSchema,
  insertApplicationsSchema,
  insertConsentRecordsSchema,
  insertDriverProfilesSchema,
  insertOrganizationsSchema,
  insertPhotographerProfilesSchema,
  selectApplicationDocumentsSchema,
  selectApplicationsSchema,
  selectConsentRecordsSchema,
  selectDriverProfilesSchema,
  selectPhotographerProfilesSchema,
  updateApplicationDocumentsSchema,
  updateApplicationsSchema,
  updateConsentRecordsSchema,
  updateDriverProfilesSchema,
  updatePhotographerProfilesSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

import {
  APPLICATION_STATES,
  PAYOUT_METHODS,
  SUPPLIER_APPLICATION_TYPES,
  SUPPORTED_COUNTRY_CODES,
  SUPPORTED_LOCALES,
} from "../../model";

// Table Base Schemas
export const applicationSelectSchema = selectApplicationsSchema;
export const applicationInsertSchema = insertApplicationsSchema;
export const applicationUpdateSchema = updateApplicationsSchema;

export const applicationDocumentSelectSchema = selectApplicationDocumentsSchema;
export const applicationDocumentInsertSchema = insertApplicationDocumentsSchema;
export const applicationDocumentUpdateSchema = updateApplicationDocumentsSchema;

export const consentRecordSelectSchema = selectConsentRecordsSchema;
export const consentRecordInsertSchema = insertConsentRecordsSchema;
export const consentRecordUpdateSchema = updateConsentRecordsSchema;

export const driverProfileSelectSchema = selectDriverProfilesSchema;
export const driverProfileInsertSchema = insertDriverProfilesSchema;
export const driverProfileUpdateSchema = updateDriverProfilesSchema;

export const photographerProfileSelectSchema = selectPhotographerProfilesSchema;
export const photographerProfileInsertSchema = insertPhotographerProfilesSchema;
export const photographerProfileUpdateSchema = updatePhotographerProfilesSchema;

const SUPPORTED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;

export const documentUploadInputSchema = insertApplicationDocumentsSchema
  .pick({
    documentType: true,
    storageKey: true,
    mimeType: true,
    fileSizeBytes: true,
  })
  .extend({
    documentType: z.string().min(2).max(80),
    storageKey: z.string().min(3).max(255),
    mimeType: z.enum(SUPPORTED_MIME_TYPES),
    fileSizeBytes: z
      .number()
      .int()
      .min(1)
      .max(15 * 1024 * 1024),
    expiresAt: z.string().datetime().optional(),
  });

const organizationBaseInsertSchema = insertOrganizationsSchema
  .pick({
    legalEntityName: true,
    displayNameEn: true,
    displayNameAr: true,
    countryCode: true,
    headquartersAddress: true,
    signatoryFullName: true,
    signatoryRoleTitle: true,
    payoutMethod: true,
  })
  .extend({
    legalEntityName: z.string().min(2).max(160),
    displayNameEn: z.string().min(2).max(120),
    displayNameAr: z.string().min(2).max(120),
    countryCode: z.enum(SUPPORTED_COUNTRY_CODES),
    headquartersAddress: z.string().min(5).max(300),
    signatoryFullName: z.string().min(2).max(120),
    signatoryRoleTitle: z.string().min(2).max(80),
    payoutMethod: z.enum(PAYOUT_METHODS),
  });

export const submitOrganizationApplicationSchema = organizationBaseInsertSchema.extend({
  countryCode: z.enum(SUPPORTED_COUNTRY_CODES).default("EG"),
  payoutMethod: z.enum(PAYOUT_METHODS).default("bank_transfer"),
  commercialRegNumber: z.string().min(2).max(80),
  taxNumber: z.string().min(2).max(80),
  tourismLicenseNumber: z.string().min(2).max(80),
  tourismLicenseExpiry: z.string().datetime(),
  signatoryNationalId: z.string().min(6).max(30),
  payoutIbanOrWallet: z.string().min(6).max(64),
  billingContactName: z.string().min(2).max(120),
  billingContactEmail: z.email(),
  billingContactPhone: z.string().min(8).max(25),
  billingAddress: z.string().min(5).max(300),
  invoiceLanguage: z.enum(SUPPORTED_LOCALES).default("ar"),
  childSafetyProgramOptIn: z.boolean().default(false),
  safetyLeadName: z.string().optional().nullable(),
  safetyHotlinePhone: z.string().optional().nullable(),
  emergencyEscalationAcknowledged: z.boolean().optional(),
  documents: z.array(documentUploadInputSchema).min(1),
});

const driverProfileBaseInsertSchema = insertDriverProfilesSchema
  .pick({
    licenseCategory: true,
    yearsOfExperience: true,
    serviceAreas: true,
    hasOwnVehicle: true,
    vehicleMakeModel: true,
    vehicleYear: true,
    vehiclePlateNumber: true,
    vehicleSeatCapacity: true,
    insurancePolicyNumber: true,
  })
  .extend({
    licenseCategory: z.string().min(2).max(60),
    yearsOfExperience: z.number().int().min(1).max(60),
    serviceAreas: z.array(z.string().min(2)).min(1),
    vehicleYear: z.number().int().min(2000).max(2035).optional().nullable(),
    vehicleSeatCapacity: z.number().int().min(1).max(80).optional().nullable(),
  });

export const submitDriverApplicationSchema = driverProfileBaseInsertSchema.extend({
  nationalId: z.string().min(6).max(30),
  licenseNumber: z.string().min(3).max(40),
  licenseExpiry: z.string().datetime(),
  yearsOfExperience: z.number().int().min(1).max(60),
  serviceAreas: z.array(z.string().min(2)).min(1),
  hasOwnVehicle: z.boolean().default(false),
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

const photographerProfileBaseInsertSchema = insertPhotographerProfilesSchema
  .pick({
    yearsOfExperience: true,
    cameraBodies: true,
    lenses: true,
    hasDroneLicense: true,
    serviceRegions: true,
    specialties: true,
    portfolioPhotoCount: true,
    sampleAlbums: true,
  })
  .extend({
    yearsOfExperience: z.number().int().min(0).max(60),
    cameraBodies: z.array(z.string().min(2)).min(1),
    lenses: z.array(z.string().min(2)),
    serviceRegions: z.array(z.string().min(2)).min(1),
    specialties: z.array(z.string().min(2)).min(1),
    portfolioPhotoCount: z.number().int().min(1).max(200),
    sampleAlbums: z.array(sampleAlbumItemSchema),
  });

export const submitPhotographerApplicationSchema = photographerProfileBaseInsertSchema.extend({
  nationalId: z.string().min(6).max(30),
  yearsOfExperience: z.number().int().min(0).max(60),
  cameraBodies: z.array(z.string().min(2)).min(1),
  lenses: z.array(z.string().min(2)).default([]),
  hasDroneLicense: z.boolean().default(false),
  serviceRegions: z.array(z.string().min(2)).min(1),
  specialties: z.array(z.string().min(2)).min(1),
  portfolioPhotoCount: z.number().int().min(1).max(200),
  sampleAlbums: z.array(sampleAlbumItemSchema).default([]),
  documents: z.array(documentUploadInputSchema).min(1),
});

export const getApplicationStatusSchema = z
  .object({
    applicationId: z.uuid().optional(),
  })
  .optional();

export const requestChangesExtensionSchema = z.object({
  applicationId: z.uuid(),
  reason: z.string().min(3).max(300).optional(),
});

export const resubmitApplicationSchema = z.object({
  applicationId: z.uuid(),
  updatedPayload: z.record(z.string(), z.unknown()),
  documents: z.array(documentUploadInputSchema).optional(),
});

export const submitAppealSchema = z.object({
  applicationId: z.uuid(),
  appealStatement: z.string().min(10).max(2000),
  documents: z.array(documentUploadInputSchema).optional(),
});

export const onboardOrganizationSupplierSchema = z.object({
  supplierRole: z.enum(["org_driver", "org_photographer"]),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(8).max(25),
  email: z.email().optional().nullable(),
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
  supplierAccountId: z.uuid(),
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
  applicationId: z.uuid(),
});

export const verifyApplicationDocumentSchema = updateApplicationDocumentsSchema
  .pick({
    verifiedStatus: true,
    rejectionNote: true,
  })
  .extend({
    applicationId: z.uuid(),
    documentId: z.uuid(),
    verifiedStatus: z.enum(["verified", "rejected"]),
    rejectionNote: z.string().max(500).optional().nullable(),
  });

export const openApplicationDocumentSchema = z.object({
  applicationId: z.uuid(),
  documentId: z.uuid(),
  reason: z.string().max(300).optional(),
});

export const approveApplicationSchema = updateApplicationsSchema
  .pick({
    decisionNotes: true,
  })
  .extend({
    applicationId: z.uuid(),
    decisionReasonCode: z.string().min(2).max(80).default("verified_complete"),
    decisionNotes: z.string().max(1000).optional(),
  });

export const requestApplicationChangesSchema = z.object({
  applicationId: z.uuid(),
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
  applicationId: z.uuid(),
  decisionReasonCode: z.string().min(2).max(80),
  decisionNotes: z.string().min(5).max(1000),
});

export const decideAppealSchema = z.object({
  applicationId: z.uuid(),
  decision: z.enum(["approve", "uphold_rejection"]),
  decisionReasonCode: z.string().min(2).max(80),
  decisionNotes: z.string().min(5).max(1000),
});
