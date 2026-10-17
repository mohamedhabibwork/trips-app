// Programs service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "programs";
export { PROGRAMS_ERROR_CODE_MAP, ProgramsServiceError, mapProgramsError } from "./errors";
export { routes } from "./routes";
export type * from "./types";
