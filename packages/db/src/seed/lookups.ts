import { randomUUID } from "node:crypto";

import {
  DEFAULT_LOOKUP_TYPES,
  DEFAULT_LOOKUPS,
  LOOKUP_TYPE_CODES,
  normalizeLookupCode,
} from "@trips-app/domain";
import { eq } from "drizzle-orm";

import { lookups, lookupTypes } from "../schema";
import type {
  Database,
  LookupSeedSummary,
  LookupSeedVerification,
  ServiceDatabase,
} from "../types";

export interface SeedLookupsOptions {
  actorAccountId?: string | null;
  now?: Date;
}

/**
 * Seeds all platform lookup_types and lookups idempotently, linking hierarchical parent_id
 * relationships across both lookup_types and lookups.
 */
export async function seedLookupsData(
  db: ServiceDatabase,
  options?: SeedLookupsOptions,
): Promise<LookupSeedSummary> {
  const now = options?.now ?? new Date();
  const actorAccountId = options?.actorAccountId ?? null;

  const typeIdsByCode: Record<string, number> = {};
  const lookupIdsByKey: Record<string, number> = {};

  // Pass 1: Root lookup_types (parentTypeCode == null)
  const rootTypes = DEFAULT_LOOKUP_TYPES.filter((t) => !t.parentTypeCode);
  const childTypes = DEFAULT_LOOKUP_TYPES.filter((t) => Boolean(t.parentTypeCode));

  for (const def of rootTypes) {
    const code = normalizeLookupCode(def.code);
    const [saved] = await db
      .insert(lookupTypes)
      .values({
        uuid: randomUUID(),
        code,
        value: def.value,
        name: def.name,
        description: def.description,
        parentId: null,
        sortBy: def.sortBy,
        isPublic: def.isPublic,
        isSystem: def.isSystem,
        isActive: true,
        isDeleted: false,
        createdBy: actorAccountId,
        updatedBy: actorAccountId,
        deletedBy: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      })
      .onConflictDoUpdate({
        target: lookupTypes.code,
        set: {
          value: def.value,
          name: def.name,
          description: def.description,
          parentId: null,
          sortBy: def.sortBy,
          isPublic: def.isPublic,
          isSystem: def.isSystem,
          isActive: true,
          isDeleted: false,
          updatedBy: actorAccountId,
          updatedAt: now,
        },
      })
      .returning({ id: lookupTypes.id, code: lookupTypes.code });

    if (saved) {
      typeIdsByCode[saved.code] = saved.id;
    }
  }

  // Pass 2: Child lookup_types (parentTypeCode != null)
  for (const def of childTypes) {
    const code = normalizeLookupCode(def.code);
    const parentCode = def.parentTypeCode ? normalizeLookupCode(def.parentTypeCode) : null;
    const parentId = parentCode ? (typeIdsByCode[parentCode] ?? null) : null;

    const [saved] = await db
      .insert(lookupTypes)
      .values({
        uuid: randomUUID(),
        code,
        value: def.value,
        name: def.name,
        description: def.description,
        parentId,
        sortBy: def.sortBy,
        isPublic: def.isPublic,
        isSystem: def.isSystem,
        isActive: true,
        isDeleted: false,
        createdBy: actorAccountId,
        updatedBy: actorAccountId,
        deletedBy: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      })
      .onConflictDoUpdate({
        target: lookupTypes.code,
        set: {
          value: def.value,
          name: def.name,
          description: def.description,
          parentId,
          sortBy: def.sortBy,
          isPublic: def.isPublic,
          isSystem: def.isSystem,
          isActive: true,
          isDeleted: false,
          updatedBy: actorAccountId,
          updatedAt: now,
        },
      })
      .returning({ id: lookupTypes.id, code: lookupTypes.code });

    if (saved) {
      typeIdsByCode[saved.code] = saved.id;
    }
  }

  // Pass 3: Root lookups (parentLookupCode == null)
  const rootLookups = DEFAULT_LOOKUPS.filter((item) => !item.parentLookupCode);
  const childLookups = DEFAULT_LOOKUPS.filter((item) => Boolean(item.parentLookupCode));

  for (const item of rootLookups) {
    const typeCode = normalizeLookupCode(item.typeCode);
    const code = normalizeLookupCode(item.code);
    const lookupTypeId = typeIdsByCode[typeCode];
    if (!lookupTypeId) {
      throw new Error(`Missing seeded lookup_type "${typeCode}" for lookup "${code}".`);
    }

    const [saved] = await db
      .insert(lookups)
      .values({
        uuid: randomUUID(),
        lookupTypeId,
        code,
        value: item.value,
        name: item.name,
        description: item.description ?? null,
        parentId: null,
        sortBy: item.sortBy,
        isPublic: item.isPublic,
        isActive: true,
        isDeleted: false,
        createdBy: actorAccountId,
        updatedBy: actorAccountId,
        deletedBy: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      })
      .onConflictDoUpdate({
        target: [lookups.lookupTypeId, lookups.code],
        set: {
          value: item.value,
          name: item.name,
          description: item.description ?? null,
          parentId: null,
          sortBy: item.sortBy,
          isPublic: item.isPublic,
          isActive: true,
          isDeleted: false,
          updatedBy: actorAccountId,
          updatedAt: now,
        },
      })
      .returning({ id: lookups.id });

    if (saved) {
      lookupIdsByKey[`${typeCode}:${code}`] = saved.id;
    }
  }

  // Pass 4: Child lookups (parentLookupCode != null)
  for (const item of childLookups) {
    const typeCode = normalizeLookupCode(item.typeCode);
    const code = normalizeLookupCode(item.code);
    const lookupTypeId = typeIdsByCode[typeCode];
    if (!lookupTypeId) {
      throw new Error(`Missing seeded lookup_type "${typeCode}" for lookup "${code}".`);
    }

    const parentTypeCode = item.parentTypeCode
      ? normalizeLookupCode(item.parentTypeCode)
      : typeCode;
    const parentLookupCode = normalizeLookupCode(item.parentLookupCode!);
    const parentId =
      lookupIdsByKey[`${parentTypeCode}:${parentLookupCode}`] ??
      lookupIdsByKey[`${typeCode}:${parentLookupCode}`] ??
      null;

    const [saved] = await db
      .insert(lookups)
      .values({
        uuid: randomUUID(),
        lookupTypeId,
        code,
        value: item.value,
        name: item.name,
        description: item.description ?? null,
        parentId,
        sortBy: item.sortBy,
        isPublic: item.isPublic,
        isActive: true,
        isDeleted: false,
        createdBy: actorAccountId,
        updatedBy: actorAccountId,
        deletedBy: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      })
      .onConflictDoUpdate({
        target: [lookups.lookupTypeId, lookups.code],
        set: {
          value: item.value,
          name: item.name,
          description: item.description ?? null,
          parentId,
          sortBy: item.sortBy,
          isPublic: item.isPublic,
          isActive: true,
          isDeleted: false,
          updatedBy: actorAccountId,
          updatedAt: now,
        },
      })
      .returning({ id: lookups.id });

    if (saved) {
      lookupIdsByKey[`${typeCode}:${code}`] = saved.id;
    }
  }

  return {
    lookupTypesSeeded: DEFAULT_LOOKUP_TYPES.length,
    lookupsSeeded: DEFAULT_LOOKUPS.length,
    expectedTypeCount: LOOKUP_TYPE_CODES.length,
    typeIdsByCode,
    lookupIdsByKey,
  };
}

/**
 * Proves the database actually holds every registered lookup type (LK-07).
 *
 * The runtime static fallback is gone, so an unseeded or partially seeded database now surfaces as
 * `not_seeded` to every client. This check is what turns that from a silent, weeks-long outage into
 * a failed deploy: it counts distinct `lookup_types.code` rows and lists the registered codes that
 * have no row at all.
 *
 * @param db Database handle; any drizzle client works.
 * @returns `ok` plus the seeded count, the expected count and the missing codes.
 */
export async function verifyLookupSeed(db: Database): Promise<LookupSeedVerification> {
  const rows = await db
    .select({ code: lookupTypes.code })
    .from(lookupTypes)
    .where(eq(lookupTypes.isDeleted, false));

  const seededCodes = new Set(rows.map((row) => normalizeLookupCode(row.code)));
  const expectedCodes = LOOKUP_TYPE_CODES.map((code) => normalizeLookupCode(code));
  const missing = expectedCodes.filter((code) => !seededCodes.has(code)).sort();

  return {
    ok: missing.length === 0,
    seededTypes: seededCodes.size,
    expectedTypes: expectedCodes.length,
    missing,
  };
}
