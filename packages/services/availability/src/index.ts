// Availability service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "availability";
export {
  AVAILABILITY_ERROR_CODE_MAP,
  AvailabilityServiceError,
  mapAvailabilityError,
} from "./errors";
export { AVAILABILITY_BLOCK_TYPES, SUPPLIER_ROLES, windowsOverlap } from "./model";
export { routes } from "./routes";
export {
  checkSupplierAvailabilityInputSchema,
  deleteAvailabilityBlockInputSchema,
  listMyBlocksInputSchema,
  upsertAvailabilityBlockInputSchema,
} from "./schemas/validation";
export { createAvailabilityService } from "./services";
export type * from "./types";
