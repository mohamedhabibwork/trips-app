// Seats service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "seats";
export { mapSeatsError, SEATS_ERROR_CODE_MAP, SeatsServiceError } from "./errors";
export { DEFAULT_SEAT_HOLD_MINUTES, isSeatHoldExpired, SEAT_INVENTORY_STATUSES } from "./model";
export { routes } from "./routes";
export {
  assignSeatByOrgInputSchema,
  getSeatMapInputSchema,
  holdSeatsInputSchema,
  releaseSeatHoldInputSchema,
} from "./schemas/validation";
export { createSeatsService } from "./services";
export type * from "./types";
