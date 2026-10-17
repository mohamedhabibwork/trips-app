// Business logic for Tracking. Routes call this factory with context.db; repositories are created here.
import type { ServiceDatabase } from "../repository";

export function createTrackingService(_db: ServiceDatabase) {
  return {};
}
