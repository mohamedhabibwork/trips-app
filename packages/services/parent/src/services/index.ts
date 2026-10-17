// Business logic for Parent. Routes call this factory with context.db; repositories are created here.
import type { ServiceDatabase } from "../repository";

export function createParentService(_db: ServiceDatabase) {
  return {};
}
