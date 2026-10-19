#!/usr/bin/env bun
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createDb } from "../index";
import { seedDefaultData } from "./default";
import { seedDemoData } from "./demo";
import { verifyLookupSeed } from "./lookups";

function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const candidatePaths = [
    resolve(import.meta.dir, "../../.env"),
    resolve(import.meta.dir, "../../../../apps/server/.env"),
  ];
  for (const envPath of candidatePaths) {
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, "utf8");
      const match = content.match(/^DATABASE_URL=(.+)$/m);
      if (match?.[1]) {
        return match[1].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
  return undefined;
}

async function main() {
  const modeArg = process.argv[2]?.toLowerCase() ?? "default";
  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) {
    console.error("Error: DATABASE_URL environment variable is required to run the seeder.");
    process.exit(1);
  }

  const db = createDb({ DATABASE_URL: databaseUrl });

  if (modeArg === "demo") {
    console.log(
      "Running DEMO seeder (default baseline + fake/demo accounts, organizations, settings & applications)...",
    );
    const result = await seedDemoData(db);
    console.log(
      `Seeded ${result.defaultSummary.lookupTypesSeeded} lookup types, ${result.defaultSummary.lookupsSeeded} lookups, ${result.defaultSummary.rolesSeeded} roles, ${result.defaultSummary.permissionsSeeded} permissions, ${result.defaultSummary.plansSeeded} plans, ${result.organizationsSeeded} organizations, ${result.accountsSeeded} accounts, and ${result.applicationsSeeded} applications.`,
    );
    console.table(
      result.credentials.map((cred) => ({
        email: cred.email,
        phone: cred.phone,
        roles: cred.roles.join(", "),
        subRoleOrPlan: cred.adminSubRole ?? cred.planTier ?? "-",
        status: cred.status,
        password: cred.password,
        note: cred.secondFactorNote ?? "",
      })),
    );
    await assertLookupSeedComplete(db);
    process.exit(0);
  }

  console.log(
    "Running DEFAULT seeder (lookup types, lookups, system/auth settings, roles, permissions, plans, bootstrap Super Admin)...",
  );
  const result = await seedDefaultData(db);
  console.log(
    `Seeded ${result.lookupTypesSeeded} lookup types, ${result.lookupsSeeded} lookups, ${result.rolesSeeded} roles, ${result.permissionsSeeded} permissions, ${result.plansSeeded} plans, and bootstrap Super Admin (${result.bootstrapSuperAdmin.email}).`,
  );
  await assertLookupSeedComplete(db);
  process.exit(0);
}

/**
 * Post-seed assertion (LK-07): the runtime static fallback is gone, so a database missing a
 * registered lookup type would serve `not_seeded` to every client. Fail the seed run instead of
 * reporting success for a half-populated catalog.
 */
async function assertLookupSeedComplete(db: ReturnType<typeof createDb>): Promise<void> {
  const verification = await verifyLookupSeed(db);
  if (verification.ok) {
    console.log(
      `Lookup seed verified: ${verification.seededTypes}/${verification.expectedTypes} registered lookup types present.`,
    );
    return;
  }

  console.error(
    `Lookup seed INCOMPLETE: ${verification.seededTypes}/${verification.expectedTypes} registered lookup types present.`,
  );
  console.error(`Missing lookup types: ${verification.missing.join(", ")}`);
  process.exit(1);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
