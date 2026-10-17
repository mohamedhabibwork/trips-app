// Seats service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "seats";
export { SEATS_ERROR_CODE_MAP, SeatsServiceError, mapSeatsError } from "./errors";
export { routes } from "./routes";
export type * from "./types";
