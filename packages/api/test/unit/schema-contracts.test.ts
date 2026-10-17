import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

import type { ZodType } from "zod";

// Every service's validation module, loaded from its source. Services expose only the package root publicly,
// so these tests read the validation layer directly, the same way the service's own tests do.
const SERVICES_DIR = resolve(import.meta.dir, "../../../services");

type SchemaEntry = { service: string; name: string; schema: ZodType };

function isZodSchema(value: unknown): value is ZodType {
  return typeof value === "object" && value !== null && "safeParse" in value;
}

async function loadSchemas(): Promise<SchemaEntry[]> {
  const services = readdirSync(SERVICES_DIR).filter((name) =>
    existsSync(join(SERVICES_DIR, name, "src/schemas/validation/index.ts")),
  );
  const entries: SchemaEntry[] = [];
  for (const service of services) {
    const modulePath = join(SERVICES_DIR, service, "src/schemas/validation/index.ts");
    const mod = (await import(modulePath)) as Record<string, unknown>;
    for (const [name, value] of Object.entries(mod)) {
      if (isZodSchema(value)) entries.push({ service, name, schema: value });
    }
  }
  return entries;
}

const entries = await loadSchemas();

describe("Unit: every input schema rejects malformed input (all services)", () => {
  test("discovers validation schemas in at least four services", () => {
    const services = new Set(entries.map((entry) => entry.service));
    expect(services.size).toBeGreaterThanOrEqual(4);
  });

  for (const { service, name, schema } of entries) {
    test(`${service}.${name} rejects null and string input, and accepts no payload only when all fields are optional`, () => {
      expect(schema.safeParse(null).success).toBe(false);
      expect(schema.safeParse("not an object").success).toBe(false);
      // A procedure with optional input may be called with no payload, but only if an empty object is also valid.
      if (schema.safeParse(undefined).success) {
        expect(schema.safeParse({}).success).toBe(true);
      }
    });
  }
});
