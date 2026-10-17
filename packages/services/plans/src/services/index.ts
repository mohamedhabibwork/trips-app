// Business logic for Plans. Routes call this factory with context.db; repositories are created here.
import type { ServiceDatabase } from "../repository";

export function createPlansService(_db: ServiceDatabase) {
  return {};
}
