import { randomUUID } from "node:crypto";

import {
  DEFAULT_LOOKUP_TYPES,
  DEFAULT_LOOKUPS,
  getStaticLookupByCode,
  getStaticLookupsByTypeCode,
  getStaticLookupTypeByCode,
  type LookupItemDto,
  type LookupTypeDto,
  type LookupTypeWithItemsDto,
  normalizeLookupCode,
  ServiceError,
} from "@trips-app/domain";
import { and, asc, eq, inArray } from "drizzle-orm";

import { lookups, lookupTypes } from "./schema";
import type { Database, LookupInsert, LookupTypeInsert } from "./types";

export type {
  LookupItemDto,
  LookupLocalizedText,
  LookupTypeCode,
  LookupTypeDto,
  LookupTypeWithItemsDto,
} from "@trips-app/domain";

export interface ListLookupTypesOptions {
  includePrivate?: boolean;
  includeDeleted?: boolean;
  parentCode?: string;
  codes?: readonly string[];
  fallbackToStatic?: boolean;
}

export interface GetLookupTypeByCodeOptions {
  includePrivate?: boolean;
  includeDeleted?: boolean;
  parentLookupCode?: string;
  fallbackToStatic?: boolean;
}

export interface GetLookupsByTypeCodesOptions {
  includePrivate?: boolean;
  includeDeleted?: boolean;
  fallbackToStatic?: boolean;
}

export interface GetLookupByCodeParams {
  code: string;
  typeCode?: string;
  includePrivate?: boolean;
  includeDeleted?: boolean;
  fallbackToStatic?: boolean;
}

// Column fields come from the insert types, so they stay in step with the tables.
export interface UpsertLookupTypeInput extends Pick<
  LookupTypeInsert,
  "code" | "value" | "name" | "description" | "sortBy" | "isPublic" | "isSystem"
> {
  parentCode?: string | null;
  actorAccountId?: string | null;
}

export interface UpsertLookupInput extends Pick<
  LookupInsert,
  "code" | "value" | "name" | "description" | "sortBy" | "isPublic"
> {
  typeCode: string;
  parentLookupCode?: string | null;
  parentTypeCode?: string | null;
  actorAccountId?: string | null;
}

function buildStaticTypeDto(
  def: (typeof DEFAULT_LOOKUP_TYPES)[number],
  index: number,
): LookupTypeDto {
  const parentIdx = def.parentTypeCode
    ? DEFAULT_LOOKUP_TYPES.findIndex((p) => p.code === def.parentTypeCode)
    : -1;
  return {
    id: index + 1,
    uuid: randomUUID(),
    code: def.code,
    value: def.value,
    name: def.name,
    description: def.description,
    parentId: parentIdx >= 0 ? parentIdx + 1 : null,
    parentCode: def.parentTypeCode ?? null,
    sortBy: def.sortBy,
    isPublic: def.isPublic,
    isSystem: def.isSystem,
  };
}

function buildStaticItemDto(
  item: (typeof DEFAULT_LOOKUPS)[number],
  itemIndex: number,
  typeId: number,
): LookupItemDto {
  const parentIdx = item.parentLookupCode
    ? DEFAULT_LOOKUPS.findIndex(
        (p) =>
          p.code === item.parentLookupCode &&
          (!item.parentTypeCode || p.typeCode === item.parentTypeCode),
      )
    : -1;
  return {
    id: itemIndex + 1,
    uuid: randomUUID(),
    code: item.code,
    value: item.value,
    name: item.name,
    description: item.description ?? null,
    lookupTypeId: typeId,
    typeCode: item.typeCode,
    parentId: parentIdx >= 0 ? parentIdx + 1 : null,
    parentCode: item.parentLookupCode ?? null,
    sortBy: item.sortBy,
    isPublic: item.isPublic,
  };
}

export function createLookupsRepository(db: Database) {
  return {
    async listLookupTypes(options?: ListLookupTypesOptions): Promise<LookupTypeDto[]> {
      const includePrivate = options?.includePrivate ?? false;
      const includeDeleted = options?.includeDeleted ?? false;
      const fallbackToStatic = options?.fallbackToStatic ?? true;

      const allTypeRows = await db
        .select()
        .from(lookupTypes)
        .orderBy(asc(lookupTypes.sortBy), asc(lookupTypes.id));

      if (allTypeRows.length === 0 && fallbackToStatic) {
        const normalizedParent = options?.parentCode
          ? normalizeLookupCode(options.parentCode)
          : undefined;
        const normalizedCodes = options?.codes
          ? new Set(options.codes.map((c) => normalizeLookupCode(c)))
          : undefined;

        return DEFAULT_LOOKUP_TYPES.map((def, idx) => buildStaticTypeDto(def, idx)).filter(
          (dto) => {
            if (!includePrivate && !dto.isPublic) return false;
            if (
              normalizedParent &&
              normalizeLookupCode(dto.parentCode ?? "") !== normalizedParent
            ) {
              return false;
            }
            if (normalizedCodes && !normalizedCodes.has(normalizeLookupCode(dto.code))) {
              return false;
            }
            return true;
          },
        );
      }

      const codeById = new Map<number, string>(allTypeRows.map((r) => [r.id, r.code]));
      const idByCode = new Map<string, number>(
        allTypeRows.map((r) => [normalizeLookupCode(r.code), r.id]),
      );

      const parentIdFilter = options?.parentCode
        ? (idByCode.get(normalizeLookupCode(options.parentCode)) ?? -1)
        : undefined;
      const codesFilter = options?.codes
        ? new Set(options.codes.map((c) => normalizeLookupCode(c)))
        : undefined;

      return allTypeRows
        .filter((row) => {
          if (!includeDeleted && row.isDeleted) return false;
          if (!includePrivate && !row.isPublic) return false;
          if (parentIdFilter !== undefined && row.parentId !== parentIdFilter) return false;
          if (codesFilter && !codesFilter.has(normalizeLookupCode(row.code))) return false;
          return true;
        })
        .map((row) => ({
          id: row.id,
          uuid: row.uuid,
          code: row.code,
          value: row.value,
          name: row.name,
          description: row.description ?? null,
          parentId: row.parentId ?? null,
          parentCode: row.parentId ? (codeById.get(row.parentId) ?? null) : null,
          sortBy: row.sortBy,
          isPublic: row.isPublic,
          isSystem: row.isSystem,
        }));
    },

    async getLookupTypeByCode(
      typeCode: string,
      options?: GetLookupTypeByCodeOptions,
    ): Promise<LookupTypeWithItemsDto | null> {
      const normalizedCode = normalizeLookupCode(typeCode);
      const includePrivate = options?.includePrivate ?? false;
      const includeDeleted = options?.includeDeleted ?? false;
      const fallbackToStatic = options?.fallbackToStatic ?? true;

      const [typeRow] = await db
        .select()
        .from(lookupTypes)
        .where(eq(lookupTypes.code, normalizedCode))
        .limit(1);

      if (!typeRow) {
        if (!fallbackToStatic) return null;
        const staticType = getStaticLookupTypeByCode(normalizedCode);
        if (!staticType) return null;
        if (!includePrivate && !staticType.isPublic) return null;

        const typeIdx = DEFAULT_LOOKUP_TYPES.findIndex((t) => t.code === staticType.code);
        const typeDto = buildStaticTypeDto(staticType, typeIdx >= 0 ? typeIdx : 0);
        const staticItems = getStaticLookupsByTypeCode(normalizedCode, {
          parentLookupCode: options?.parentLookupCode,
          onlyPublic: !includePrivate,
        });

        return {
          ...typeDto,
          items: staticItems.map((item) => {
            const globalIdx = DEFAULT_LOOKUPS.indexOf(item);
            return buildStaticItemDto(item, globalIdx >= 0 ? globalIdx : 0, typeDto.id);
          }),
        };
      }

      if (!includeDeleted && typeRow.isDeleted) return null;
      if (!includePrivate && !typeRow.isPublic) return null;

      let parentTypeCode: string | null = null;
      if (typeRow.parentId) {
        const [parentRow] = await db
          .select({ code: lookupTypes.code })
          .from(lookupTypes)
          .where(eq(lookupTypes.id, typeRow.parentId))
          .limit(1);
        parentTypeCode = parentRow?.code ?? null;
      }

      const itemRows = await db
        .select()
        .from(lookups)
        .where(eq(lookups.lookupTypeId, typeRow.id))
        .orderBy(asc(lookups.sortBy), asc(lookups.id));

      // Resolve parent lookup codes if any item has a parentId
      const parentIds = Array.from(
        new Set(itemRows.map((r) => r.parentId).filter((id): id is number => id !== null)),
      );
      const parentCodeById = new Map<number, string>();
      if (parentIds.length > 0) {
        const parentLookupRows = await db
          .select({ id: lookups.id, code: lookups.code })
          .from(lookups)
          .where(inArray(lookups.id, parentIds));
        for (const p of parentLookupRows) {
          parentCodeById.set(p.id, p.code);
        }
      }

      const normalizedParentLookupCode = options?.parentLookupCode
        ? normalizeLookupCode(options.parentLookupCode)
        : undefined;

      const items: LookupItemDto[] = itemRows
        .filter((row) => {
          if (!includeDeleted && row.isDeleted) return false;
          if (!includePrivate && !row.isPublic) return false;
          const pCode = row.parentId ? (parentCodeById.get(row.parentId) ?? null) : null;
          if (
            normalizedParentLookupCode !== undefined &&
            normalizeLookupCode(pCode ?? "") !== normalizedParentLookupCode
          ) {
            return false;
          }
          return true;
        })
        .map((row) => ({
          id: row.id,
          uuid: row.uuid,
          code: row.code,
          value: row.value,
          name: row.name,
          description: row.description ?? null,
          lookupTypeId: row.lookupTypeId,
          typeCode: typeRow.code,
          parentId: row.parentId ?? null,
          parentCode: row.parentId ? (parentCodeById.get(row.parentId) ?? null) : null,
          sortBy: row.sortBy,
          isPublic: row.isPublic,
        }));

      return {
        id: typeRow.id,
        uuid: typeRow.uuid,
        code: typeRow.code,
        value: typeRow.value,
        name: typeRow.name,
        description: typeRow.description ?? null,
        parentId: typeRow.parentId ?? null,
        parentCode: parentTypeCode,
        sortBy: typeRow.sortBy,
        isPublic: typeRow.isPublic,
        isSystem: typeRow.isSystem,
        items,
      };
    },

    async getLookupsByTypeCode(
      typeCode: string,
      options?: GetLookupTypeByCodeOptions,
    ): Promise<LookupItemDto[]> {
      const typeWithItems = await this.getLookupTypeByCode(typeCode, options);
      return typeWithItems?.items ?? [];
    },

    async getLookupsByTypeCodes(
      typeCodes: readonly string[],
      options?: GetLookupsByTypeCodesOptions,
    ): Promise<Record<string, LookupTypeWithItemsDto>> {
      const result: Record<string, LookupTypeWithItemsDto> = {};
      for (const rawCode of typeCodes) {
        const normalized = normalizeLookupCode(rawCode);
        const entry = await this.getLookupTypeByCode(normalized, options);
        if (entry) {
          result[entry.code] = entry;
        }
      }
      return result;
    },

    async getLookupByCode(
      params: GetLookupByCodeParams,
    ): Promise<(LookupItemDto & { children: LookupItemDto[] }) | null> {
      const normalizedCode = normalizeLookupCode(params.code);
      const normalizedTypeCode = params.typeCode ? normalizeLookupCode(params.typeCode) : undefined;
      const includePrivate = params.includePrivate ?? false;
      const includeDeleted = params.includeDeleted ?? false;
      const fallbackToStatic = params.fallbackToStatic ?? true;

      let targetTypeId: number | undefined;
      let targetTypeCode: string | undefined;

      if (normalizedTypeCode) {
        const [tRow] = await db
          .select()
          .from(lookupTypes)
          .where(eq(lookupTypes.code, normalizedTypeCode))
          .limit(1);
        if (tRow) {
          if (!includeDeleted && tRow.isDeleted) return null;
          if (!includePrivate && !tRow.isPublic) return null;
          targetTypeId = tRow.id;
          targetTypeCode = tRow.code;
        }
      }

      const candidateRows = await db
        .select()
        .from(lookups)
        .where(
          targetTypeId !== undefined
            ? and(eq(lookups.lookupTypeId, targetTypeId), eq(lookups.code, normalizedCode))
            : eq(lookups.code, normalizedCode),
        )
        .orderBy(asc(lookups.sortBy), asc(lookups.id));

      const matchedRow = candidateRows.find((r) => {
        if (!includeDeleted && r.isDeleted) return false;
        if (!includePrivate && !r.isPublic) return false;
        return true;
      });

      if (!matchedRow) {
        // Check if it was explicitly deleted in DB
        if (candidateRows.length > 0) return null;
        if (!fallbackToStatic) return null;

        const staticItem = getStaticLookupByCode(normalizedCode, normalizedTypeCode);
        if (!staticItem) return null;
        if (!includePrivate && !staticItem.isPublic) return null;

        const typeIdx = DEFAULT_LOOKUP_TYPES.findIndex((t) => t.code === staticItem.typeCode);
        const itemIdx = DEFAULT_LOOKUPS.indexOf(staticItem);
        const dto = buildStaticItemDto(
          staticItem,
          itemIdx >= 0 ? itemIdx : 0,
          typeIdx >= 0 ? typeIdx + 1 : 1,
        );
        const staticChildren = DEFAULT_LOOKUPS.filter(
          (child) =>
            normalizeLookupCode(child.parentLookupCode ?? "") === normalizeLookupCode(dto.code) &&
            (!child.parentTypeCode ||
              normalizeLookupCode(child.parentTypeCode) === normalizeLookupCode(dto.typeCode)) &&
            (includePrivate || child.isPublic),
        ).map((child, idx) => buildStaticItemDto(child, idx + 1000, dto.lookupTypeId));

        return {
          ...dto,
          children: staticChildren,
        };
      }

      if (!targetTypeCode) {
        const [tRow] = await db
          .select()
          .from(lookupTypes)
          .where(eq(lookupTypes.id, matchedRow.lookupTypeId))
          .limit(1);
        if (!tRow || (!includeDeleted && tRow.isDeleted) || (!includePrivate && !tRow.isPublic)) {
          return null;
        }
        targetTypeCode = tRow.code;
      }

      let parentCode: string | null = null;
      if (matchedRow.parentId) {
        const [pRow] = await db
          .select({ code: lookups.code })
          .from(lookups)
          .where(eq(lookups.id, matchedRow.parentId))
          .limit(1);
        parentCode = pRow?.code ?? null;
      }

      const childRows = await db
        .select()
        .from(lookups)
        .where(eq(lookups.parentId, matchedRow.id))
        .orderBy(asc(lookups.sortBy), asc(lookups.id));

      const childTypeIds = Array.from(new Set(childRows.map((c) => c.lookupTypeId)));
      const childTypeCodeById = new Map<number, string>();
      if (childTypeIds.length > 0) {
        const childTypeRows = await db
          .select({ id: lookupTypes.id, code: lookupTypes.code })
          .from(lookupTypes)
          .where(inArray(lookupTypes.id, childTypeIds));
        for (const ct of childTypeRows) {
          childTypeCodeById.set(ct.id, ct.code);
        }
      }

      const children: LookupItemDto[] = childRows
        .filter((c) => (includeDeleted || !c.isDeleted) && (includePrivate || c.isPublic))
        .map((c) => ({
          id: c.id,
          uuid: c.uuid,
          code: c.code,
          value: c.value,
          name: c.name,
          description: c.description ?? null,
          lookupTypeId: c.lookupTypeId,
          typeCode: childTypeCodeById.get(c.lookupTypeId) ?? targetTypeCode!,
          parentId: c.parentId ?? null,
          parentCode: matchedRow.code,
          sortBy: c.sortBy,
          isPublic: c.isPublic,
        }));

      return {
        id: matchedRow.id,
        uuid: matchedRow.uuid,
        code: matchedRow.code,
        value: matchedRow.value,
        name: matchedRow.name,
        description: matchedRow.description ?? null,
        lookupTypeId: matchedRow.lookupTypeId,
        typeCode: targetTypeCode,
        parentId: matchedRow.parentId ?? null,
        parentCode,
        sortBy: matchedRow.sortBy,
        isPublic: matchedRow.isPublic,
        children,
      };
    },

    async getLookupValuesByTypeCode(
      typeCode: string,
      options?: {
        codes?: readonly string[];
        parentLookupCode?: string;
        includePrivate?: boolean;
      },
    ): Promise<string[]> {
      const items = await this.getLookupsByTypeCode(typeCode, {
        parentLookupCode: options?.parentLookupCode,
        includePrivate: options?.includePrivate ?? true,
      });
      if (!options?.codes || options.codes.length === 0) {
        return items.map((i) => i.value);
      }
      const byCode = new Map(items.map((i) => [normalizeLookupCode(i.code), i.value]));
      return options.codes
        .map((c) => byCode.get(normalizeLookupCode(c)))
        .filter((v): v is string => v !== undefined);
    },

    async upsertLookupType(input: UpsertLookupTypeInput): Promise<LookupTypeDto> {
      const now = new Date();
      const normalizedCode = normalizeLookupCode(input.code);
      const normalizedParentCode = input.parentCode ? normalizeLookupCode(input.parentCode) : null;

      let parentId: number | null = null;
      if (normalizedParentCode) {
        const [parentRow] = await db
          .select({ id: lookupTypes.id })
          .from(lookupTypes)
          .where(eq(lookupTypes.code, normalizedParentCode))
          .limit(1);
        if (!parentRow) {
          throw new ServiceError(
            "RESOURCE_NOT_FOUND",
            `Parent lookup type "${normalizedParentCode}" was not found.`,
            { parentCode: normalizedParentCode },
          );
        }
        parentId = parentRow.id;
      }

      const [saved] = await db
        .insert(lookupTypes)
        .values({
          uuid: randomUUID(),
          code: normalizedCode,
          value: input.value,
          name: input.name,
          description: input.description ?? null,
          parentId,
          sortBy: input.sortBy ?? 0,
          isPublic: input.isPublic ?? true,
          isSystem: input.isSystem ?? false,
          isDeleted: false,
          createdBy: input.actorAccountId ?? null,
          updatedBy: input.actorAccountId ?? null,
          deletedBy: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        })
        .onConflictDoUpdate({
          target: lookupTypes.code,
          set: {
            value: input.value,
            name: input.name,
            description: input.description ?? null,
            parentId,
            sortBy: input.sortBy ?? 0,
            isPublic: input.isPublic ?? true,
            isSystem: input.isSystem ?? false,
            isDeleted: false,
            updatedBy: input.actorAccountId ?? null,
            deletedBy: null,
            updatedAt: now,
            deletedAt: null,
          },
        })
        .returning();

      return {
        id: saved!.id,
        uuid: saved!.uuid,
        code: saved!.code,
        value: saved!.value,
        name: saved!.name,
        description: saved!.description ?? null,
        parentId: saved!.parentId ?? null,
        parentCode: normalizedParentCode,
        sortBy: saved!.sortBy,
        isPublic: saved!.isPublic,
        isSystem: saved!.isSystem,
      };
    },

    async upsertLookup(input: UpsertLookupInput): Promise<LookupItemDto> {
      const now = new Date();
      const normalizedTypeCode = normalizeLookupCode(input.typeCode);
      const normalizedCode = normalizeLookupCode(input.code);

      const [typeRow] = await db
        .select()
        .from(lookupTypes)
        .where(eq(lookupTypes.code, normalizedTypeCode))
        .limit(1);

      if (!typeRow || typeRow.isDeleted) {
        throw new ServiceError(
          "RESOURCE_NOT_FOUND",
          `Lookup type "${normalizedTypeCode}" was not found.`,
          { typeCode: normalizedTypeCode },
        );
      }

      let parentId: number | null = null;
      const normalizedParentLookupCode = input.parentLookupCode
        ? normalizeLookupCode(input.parentLookupCode)
        : null;

      if (normalizedParentLookupCode) {
        let parentTypeId: number | undefined;
        const effectiveParentTypeCode = input.parentTypeCode
          ? normalizeLookupCode(input.parentTypeCode)
          : undefined;
        if (effectiveParentTypeCode) {
          const [ptRow] = await db
            .select({ id: lookupTypes.id })
            .from(lookupTypes)
            .where(eq(lookupTypes.code, effectiveParentTypeCode))
            .limit(1);
          parentTypeId = ptRow?.id;
        } else if (typeRow.parentId) {
          parentTypeId = typeRow.parentId;
        }

        const [parentLookupRow] = await db
          .select({ id: lookups.id })
          .from(lookups)
          .where(
            parentTypeId !== undefined
              ? and(
                  eq(lookups.lookupTypeId, parentTypeId),
                  eq(lookups.code, normalizedParentLookupCode),
                )
              : eq(lookups.code, normalizedParentLookupCode),
          )
          .limit(1);

        if (!parentLookupRow) {
          throw new ServiceError(
            "RESOURCE_NOT_FOUND",
            `Parent lookup "${normalizedParentLookupCode}" was not found.`,
            { parentLookupCode: normalizedParentLookupCode },
          );
        }
        parentId = parentLookupRow.id;
      }

      const [saved] = await db
        .insert(lookups)
        .values({
          uuid: randomUUID(),
          lookupTypeId: typeRow.id,
          code: normalizedCode,
          value: input.value,
          name: input.name,
          description: input.description ?? null,
          parentId,
          sortBy: input.sortBy ?? 0,
          isPublic: input.isPublic ?? true,
          isDeleted: false,
          createdBy: input.actorAccountId ?? null,
          updatedBy: input.actorAccountId ?? null,
          deletedBy: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        })
        .onConflictDoUpdate({
          target: [lookups.lookupTypeId, lookups.code],
          set: {
            value: input.value,
            name: input.name,
            description: input.description ?? null,
            parentId,
            sortBy: input.sortBy ?? 0,
            isPublic: input.isPublic ?? true,
            isDeleted: false,
            updatedBy: input.actorAccountId ?? null,
            deletedBy: null,
            updatedAt: now,
            deletedAt: null,
          },
        })
        .returning();

      return {
        id: saved!.id,
        uuid: saved!.uuid,
        code: saved!.code,
        value: saved!.value,
        name: saved!.name,
        description: saved!.description ?? null,
        lookupTypeId: saved!.lookupTypeId,
        typeCode: typeRow.code,
        parentId: saved!.parentId ?? null,
        parentCode: normalizedParentLookupCode,
        sortBy: saved!.sortBy,
        isPublic: saved!.isPublic,
      };
    },

    async softDeleteLookupType(params: {
      code: string;
      deletedBy?: string | null;
      forceSystem?: boolean;
    }): Promise<LookupTypeDto | null> {
      const normalizedCode = normalizeLookupCode(params.code);
      const [existing] = await db
        .select()
        .from(lookupTypes)
        .where(eq(lookupTypes.code, normalizedCode))
        .limit(1);

      if (!existing) return null;
      if (existing.isSystem && !params.forceSystem) {
        throw new ServiceError(
          "BUSINESS_RULE_VIOLATION",
          `System lookup type "${normalizedCode}" cannot be deleted.`,
          { code: normalizedCode, isSystem: true },
        );
      }

      const now = new Date();
      const [updated] = await db
        .update(lookupTypes)
        .set({
          isDeleted: true,
          deletedBy: params.deletedBy ?? null,
          deletedAt: now,
          updatedBy: params.deletedBy ?? null,
          updatedAt: now,
        })
        .where(eq(lookupTypes.id, existing.id))
        .returning();

      return updated
        ? {
            id: updated.id,
            uuid: updated.uuid,
            code: updated.code,
            value: updated.value,
            name: updated.name,
            description: updated.description ?? null,
            parentId: updated.parentId ?? null,
            parentCode: null,
            sortBy: updated.sortBy,
            isPublic: updated.isPublic,
            isSystem: updated.isSystem,
          }
        : null;
    },

    async softDeleteLookup(params: {
      typeCode: string;
      code: string;
      deletedBy?: string | null;
    }): Promise<LookupItemDto | null> {
      const normalizedTypeCode = normalizeLookupCode(params.typeCode);
      const normalizedCode = normalizeLookupCode(params.code);

      const [typeRow] = await db
        .select()
        .from(lookupTypes)
        .where(eq(lookupTypes.code, normalizedTypeCode))
        .limit(1);

      if (!typeRow) return null;

      const [existing] = await db
        .select()
        .from(lookups)
        .where(and(eq(lookups.lookupTypeId, typeRow.id), eq(lookups.code, normalizedCode)))
        .limit(1);

      if (!existing) return null;

      const now = new Date();
      const [updated] = await db
        .update(lookups)
        .set({
          isDeleted: true,
          deletedBy: params.deletedBy ?? null,
          deletedAt: now,
          updatedBy: params.deletedBy ?? null,
          updatedAt: now,
        })
        .where(eq(lookups.id, existing.id))
        .returning();

      return updated
        ? {
            id: updated.id,
            uuid: updated.uuid,
            code: updated.code,
            value: updated.value,
            name: updated.name,
            description: updated.description ?? null,
            lookupTypeId: updated.lookupTypeId,
            typeCode: typeRow.code,
            parentId: updated.parentId ?? null,
            parentCode: null,
            sortBy: updated.sortBy,
            isPublic: updated.isPublic,
          }
        : null;
    },
  };
}
