// Fleet service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "fleet";
export { FLEET_ERROR_CODE_MAP, FleetServiceError, mapFleetError } from "./errors";
export { routes } from "./routes";
export type * from "./types";
