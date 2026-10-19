// Programs service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "programs";
export { mapProgramsError, PROGRAMS_ERROR_CODE_MAP, ProgramsServiceError } from "./errors";
export { SUPPORTED_CURRENCIES, TRIP_PROGRAM_STATUSES } from "./model";
export { routes } from "./routes";
export {
  createProgramInputSchema,
  deleteProgramInputSchema,
  listPublicTripProgramsInputSchema,
  listTripProgramsInputSchema,
  updateProgramInputSchema,
} from "./schemas/validation";
export { createProgramsService } from "./services";
export type * from "./types";
