import {
  insertDriverLabTestsSchema,
  insertDriverProfilesSchema,
  selectDriverLabTestsSchema,
  selectDriverProfilesSchema,
  updateDriverLabTestsSchema,
  updateDriverProfilesSchema,
} from "@trips-app/db/zod";
import { DRIVER_LAB_TEST_KINDS } from "@trips-app/domain";
import { z } from "zod/v4";

// Table Base Schemas
export const driverProfileSelectSchema = selectDriverProfilesSchema;
export const driverProfileInsertSchema = insertDriverProfilesSchema;
export const driverProfileUpdateSchema = updateDriverProfilesSchema;
export const driverLabTestSelectSchema = selectDriverLabTestsSchema;
export const driverLabTestInsertSchema = insertDriverLabTestsSchema;
export const driverLabTestUpdateSchema = updateDriverLabTestsSchema;

// Boundary Procedure Schemas
export const updateDriverProfileSchema = updateDriverProfilesSchema
  .pick({
    yearsOfExperience: true,
    serviceAreas: true,
    hasOwnVehicle: true,
    vehicleMakeModel: true,
    vehicleYear: true,
    vehiclePlateNumber: true,
    vehicleSeatCapacity: true,
  })
  .extend({
    yearsOfExperience: z.number().int().min(0).max(60).optional(),
    serviceAreas: z.array(z.string().trim().min(1).max(80)).optional(),
    hasOwnVehicle: z.boolean().optional(),
    vehicleMakeModel: z.string().trim().max(120).nullable().optional(),
    vehicleYear: z.number().int().min(1990).max(2035).nullable().optional(),
    vehiclePlateNumber: z.string().trim().max(40).nullable().optional(),
    vehicleSeatCapacity: z.number().int().min(1).max(100).nullable().optional(),
  });

export const bookLabTestSchema = updateDriverLabTestsSchema
  .pick({
    labCenterName: true,
  })
  .extend({
    labTestId: selectDriverLabTestsSchema.shape.id,
    labCenterName: z.string().trim().min(2).max(200),
    appointmentAt: z.string().datetime(),
  });

export const uploadLabTestResultSchema = updateDriverLabTestsSchema
  .pick({
    resultDocumentUrl: true,
  })
  .extend({
    labTestId: selectDriverLabTestsSchema.shape.id,
    resultDocumentUrl: z.string().trim().min(1).max(500),
  });

export const adminRequestLabTestSchema = insertDriverLabTestsSchema
  .pick({
    driverAccountId: true,
    testType: true,
  })
  .extend({
    driverAccountId: selectDriverLabTestsSchema.shape.driverAccountId,
    deadlineAt: z.string().datetime(),
    testType: z.enum(DRIVER_LAB_TEST_KINDS).default("both"),
  });

export const adminReviewLabTestSchema = updateDriverLabTestsSchema
  .pick({
    reviewNotes: true,
  })
  .extend({
    labTestId: selectDriverLabTestsSchema.shape.id,
    decision: z.enum(["verified_pass", "verified_fail"]),
    reviewNotes: z.string().trim().max(500).optional(),
  });
