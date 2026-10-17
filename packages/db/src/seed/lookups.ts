import { randomUUID } from "node:crypto";

import { DEFAULT_LOOKUP_TYPES, DEFAULT_LOOKUPS, normalizeLookupCode } from "@trips-app/domain";

import { lookups, lookupTypes } from "../schema";
import type { Database, LookupSeedSummary } from "../types";

export interface SeedLookupsOptions {
  actorAccountId?: string | null;
  now?: Date;
}

/**
 * Seeds all platform lookup_types and lookups idempotently, linking hierarchical parent_id
 * relationships across both lookup_types and lookups.
 */
export async function seedLookupsData(
  db: Database,
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
    typeIdsByCode,
    lookupIdsByKey,
  };
}
