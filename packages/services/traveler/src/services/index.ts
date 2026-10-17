// Business logic for Traveler. Routes call this factory with context.db; repositories are created here.
import type { ServiceDatabase } from "../repository";

export function createTravelerService(_db: ServiceDatabase) {
  return {};
}
