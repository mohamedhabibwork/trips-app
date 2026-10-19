// Driver service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "driver";
export {
  DRIVER_ERROR_CODE_MAP,
  DriverServiceError,
  mapDriverError,
  type DriverErrorCode,
} from "./errors";
export { DEFAULT_LAB_VALIDITY_DAYS, type DriverLabTestStatus } from "./model";
export { createDriverRepository, type DriverRepository } from "./repository";
export { routes } from "./routes";
export * from "./schemas";
export { createDriverService, type DriverService } from "./services";
export type * from "./types";
