import {
  selectDriverLabTestsSchema,
  selectDriverProfilesSchema,
  selectTripVehiclesSchema,
} from "@trips-app/db/zod";

export const driverProfileDtoSchema = selectDriverProfilesSchema;
export const driverLabTestDtoSchema = selectDriverLabTestsSchema;
export const driverAssignedTripVehicleDtoSchema = selectTripVehiclesSchema;
