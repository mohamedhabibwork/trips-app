import type { z } from "zod/v4";
import type {
  driverAssignedTripVehicleDtoSchema,
  driverLabTestDtoSchema,
  driverProfileDtoSchema,
} from "../schemas";
import type {
  adminRequestLabTestSchema,
  adminReviewLabTestSchema,
  bookLabTestSchema,
  updateDriverProfileSchema,
  uploadLabTestResultSchema,
} from "../schemas/validation";

export type UpdateDriverProfileInput = z.infer<typeof updateDriverProfileSchema>;
export type BookLabTestInput = z.infer<typeof bookLabTestSchema>;
export type UploadLabTestResultInput = z.infer<typeof uploadLabTestResultSchema>;
export type AdminRequestLabTestInput = z.infer<typeof adminRequestLabTestSchema>;
export type AdminReviewLabTestInput = z.infer<typeof adminReviewLabTestSchema>;
export type DriverProfileDto = z.infer<typeof driverProfileDtoSchema>;
export type DriverLabTestDto = z.infer<typeof driverLabTestDtoSchema>;
export type DriverAssignedTripVehicleDto = z.infer<typeof driverAssignedTripVehicleDtoSchema>;
export type { DriverLabTestKind } from "@trips-app/domain";
