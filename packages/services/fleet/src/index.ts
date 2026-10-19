// Fleet service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "fleet";
export { FLEET_ERROR_CODE_MAP, FleetServiceError, mapFleetError } from "./errors";
export {
  areValidAmenityCodes,
  isValidVehicleCategoryCode,
  normalizeAmenityCodes,
  normalizePlateNumber,
  SEAT_LAYOUT_CELL_TYPES,
  VEHICLE_AMENITY_CODES,
  VEHICLE_REGISTRATION_STATUSES,
  VEHICLE_STATUSES,
  VEHICLE_TYPE_SCOPES,
  VEHICLE_TYPE_STATUSES,
  validateSeatLayout,
} from "./model";
export { routes } from "./routes";
export {
  createPlatformVehicleTypeInputSchema,
  createVehicleInputSchema,
  createVehicleTypeInputSchema,
  getVehicleInputSchema,
  listVehiclesInputSchema,
  listVehicleTypesInputSchema,
  removeVehicleInputSchema,
  seatLayoutCellSchema,
  seatLayoutConfigSchema,
  updateVehicleInputSchema,
  updateVehicleTypeInputSchema,
} from "./schemas/validation";
export { createFleetService } from "./services";
export type * from "./types";
