// Availability service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "availability";
export {
  AVAILABILITY_ERROR_CODE_MAP,
  AvailabilityServiceError,
  mapAvailabilityError,
} from "./errors";
export { routes } from "./routes";
export type * from "./types";
