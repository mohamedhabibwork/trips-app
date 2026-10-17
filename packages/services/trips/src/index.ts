// Trips service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "trips";
export { TRIPS_ERROR_CODE_MAP, TripsServiceError, mapTripsError } from "./errors";
export { routes } from "./routes";
export type * from "./types";
