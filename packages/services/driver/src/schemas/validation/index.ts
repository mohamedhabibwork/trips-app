import { z } from "zod/v4";

export const updateDriverProfileSchema = z.object({
  yearsOfExperience: z.number().int().min(0).max(60).optional(),
  serviceAreas: z.array(z.string().trim().min(1).max(80)).optional(),
  hasOwnVehicle: z.boolean().optional(),
  vehicleMakeModel: z.string().trim().max(120).nullable().optional(),
  vehicleYear: z.number().int().min(1990).max(2035).nullable().optional(),
  vehiclePlateNumber: z.string().trim().max(40).nullable().optional(),
  vehicleSeatCapacity: z.number().int().min(1).max(100).nullable().optional(),
});

export const bookLabTestSchema = z.object({
  labTestId: z.string().uuid(),
  labCenterName: z.string().trim().min(2).max(200),
  appointmentAt: z.string().datetime(),
});

export const uploadLabTestResultSchema = z.object({
  labTestId: z.string().uuid(),
  resultDocumentUrl: z.string().trim().min(1).max(500),
});

export const adminRequestLabTestSchema = z.object({
  driverAccountId: z.string().uuid(),
  deadlineAt: z.string().datetime(),
});

export const adminReviewLabTestSchema = z.object({
  labTestId: z.string().uuid(),
  decision: z.enum(["verified_pass", "verified_fail"]),
  reviewNotes: z.string().trim().max(500).optional(),
});
