import { randomUUID } from "node:crypto";

import {
  type LookupItemDto,
  type LookupResolveStatus,
  type LookupTypeDto,
  type LookupTypeReadStatus,
  type LookupTypeSummaryDto,
  type LookupTypeWithItemsDto,
  type LookupValidateReason,
  type LookupValidateResult,
  normalizeLookupCode,
  ServiceError,
} from "@trips-app/domain";
import { and, asc, count, eq, inArray } from "drizzle-orm";

import { lookups, lookupTypes } from "./schema";
import type { Database, LookupInsert, LookupTypeInsert } from "./types";

export type {
  LookupItemDto,
  LookupLocalizedText,
  LookupResolveStatus,
  LookupTypeCode,
  LookupTypeDto,
  LookupTypeReadStatus,
  LookupTypeSummaryDto,
  LookupTypeWithItemsDto,
  LookupValidateReason,
  LookupValidateResult,
} from "@trips-app/domain";

// Row shapes come from the tables, so the mappers cannot drift from the schema.
type LookupTypeRow = typeof lookupTypes.$inferSelect;
type LookupRow = typeof lookups.$inferSelect;

/**
 * Options shared by every read method.
 *
 * `includeInactive` / `includeDeleted` default to `false`, which is the client-facing view: only
 * offerable, non-retired rows. `resolve` and `validate` deliberately ignore both and inspect all
 * four `isActive` × `isDeleted` combinations, because their job is to explain a stored value
 * (LK-01, LK-11).
 */
export interface LookupReadOptions {
  /** Include rows with `isActive = false`. Default `false`. */
  includeInactive?: boolean;
  /** Include rows with `isDeleted = true`. Default `false`. */
  includeDeleted?: boolean;
  /**
   * Include rows with `isPublic = false` (admin-only types such as `ADMIN_SUB_ROLE`).
   * Default `false`. The API sets this from the caller's role.
   */
  includePrivate?: boolean;
}

export interface ListTypesOptions extends LookupReadOptions {
  /** Restrict to these type codes. Unknown codes simply match nothing — never an error (LK-08). */
  codes?: readonly string[];
  /** Restrict to types whose parent *type* code is this value. */
  parentCode?: string;
}

export interface GetTypeByCodeOptions extends LookupReadOptions {
  /** Restrict the returned items to those whose parent *item* code is this value (LK-06). */
  parentCode?: string;
}

export interface GetByTypeCodesOptions extends LookupReadOptions {
  /** Restrict each type's items to those whose parent *item* code is this value. */
  parentCode?: string;
}

export interface ListTypesResult {
  types: LookupTypeSummaryDto[];
  status: "ok" | "not_seeded";
}

export interface GetTypeByCodeResult {
  type: LookupTypeWithItemsDto | null;
  /** The same array instance as `type?.items`, hoisted for callers that only need the list. */
  items: LookupItemDto[];
  status: LookupTypeReadStatus;
}

export interface GetByTypeCodesResult {
  /** Keyed by stored type code. A requested code with no row is **absent**, never a throw (LK-10). */
  types: Record<string, LookupTypeWithItemsDto>;
  statuses: Record<string, LookupTypeReadStatus>;
  status: "ok" | "not_seeded";
}

export interface ResolveResult {
  item: LookupItemDto | null;
  status: LookupResolveStatus;
}

export interface ValidateResult {
  results: LookupValidateResult[];
}

// Column fields come from the insert types, so they stay in step with the tables.
export interface UpsertLookupTypeInput extends Pick<
  LookupTypeInsert,
  "code" | "value" | "name" | "description" | "sortBy" | "isPublic" | "isSystem"
> {
  parentCode?: string | null;
  /**
   * Omit to leave the current flag untouched on update (and default to `true` on insert). Never
   * silently reactivates a type an administrator retired.
   */
  isActive?: boolean;
  actorAccountId?: string | null;
}

export interface UpsertLookupInput extends Pick<
  LookupInsert,
  "code" | "value" | "name" | "description" | "sortBy" | "isPublic"
> {
  typeCode: string;
  parentLookupCode?: string | null;
  parentTypeCode?: string | null;
  /** See `UpsertLookupTypeInput.isActive`. */
  isActive?: boolean;
  actorAccountId?: string | null;
}

// --- legacy call shapes, kept only so the un-migrated API router still type-checks ---

export interface GetLookupByCodeParams {
  code: string;
  typeCode?: string;
  includePrivate?: boolean;
  includeDeleted?: boolean;
  includeInactive?: boolean;
}

const TOTAL_ORDER = [asc(lookupTypes.sortBy), asc(lookupTypes.code)] as const;
const ITEM_TOTAL_ORDER = [asc(lookups.sortBy), asc(lookups.code)] as const;

function toTypeDto(row: LookupTypeRow, parentCode: string | null): LookupTypeDto {
  return {
    id: row.id,
    uuid: row.uuid,
    code: row.code,
    value: row.value,
    name: row.name,
    description: row.description ?? null,
    parentId: row.parentId ?? null,
    parentCode,
    sortBy: row.sortBy,
    isPublic: row.isPublic,
    isSystem: row.isSystem,
    isActive: row.isActive,
  };
}

function toItemDto(row: LookupRow, typeCode: string, parentCode: string | null): LookupItemDto {
  return {
    id: row.id,
    uuid: row.uuid,
    code: row.code,
    value: row.value,
    name: row.name,
    description: row.description ?? null,
    lookupTypeId: row.lookupTypeId,
    typeCode,
    parentId: row.parentId ?? null,
    parentCode,
    sortBy: row.sortBy,
    isPublic: row.isPublic,
    isActive: row.isActive,
  };
}

function resolveReason(row: LookupRow | null | undefined): LookupResolveStatus {
  if (!row) return "not_found";
  if (row.isDeleted) return "deleted";
  if (!row.isActive) return "inactive";
  return "active";
}

/**
 * Lookup repository. The in-code catalog (`DEFAULT_LOOKUP_TYPES` / `DEFAULT_LOOKUPS`) is a **seed
 * source only**: there is no runtime fallback, so an empty or unreachable database surfaces as
 * `not_seeded` instead of fabricated rows with array-index ids (LK-07).
 *
 * Every list is ordered server-side by `sortBy ASC, code ASC`. The ordering is total, so a client
 * renders the array exactly as received and must never re-sort (LK-02).
 */
export function createLookupsRepository(db: Database) {
  /** All type rows, ordered by the total order. Lookup types number in the dozens, so one read is cheap. */
  async function readAllTypeRows(): Promise<LookupTypeRow[]> {
    return await db
      .select()
      .from(lookupTypes)
      .orderBy(...TOTAL_ORDER);
  }

  /** Resolves `lookup_types.parentId` values to their stored type codes. */
  async function readParentTypeCodesById(
    parentIds: readonly number[],
  ): Promise<Map<number, string>> {
    const unique = Array.from(new Set(parentIds));
    if (unique.length === 0) return new Map();
    const rows = await db
      .select({ id: lookupTypes.id, code: lookupTypes.code })
      .from(lookupTypes)
      .where(inArray(lookupTypes.id, unique));
    return new Map(rows.map((row) => [row.id, row.code]));
  }

  /** Resolves `lookups.parentId` values to their stored item codes. */
  async function readParentItemCodesById(
    parentIds: readonly number[],
  ): Promise<Map<number, string>> {
    const unique = Array.from(new Set(parentIds));
    if (unique.length === 0) return new Map();
    const itemRows = await db
      .select({ id: lookups.id, code: lookups.code })
      .from(lookups)
      .where(inArray(lookups.id, unique));
    return new Map(itemRows.map((row) => [row.id, row.code]));
  }

  /** Active, non-deleted item counts per type — the `itemCount` of `listTypes` (LK-08). */
  async function readActiveItemCounts(): Promise<Map<number, number>> {
    const rows = await db
      .select({ lookupTypeId: lookups.lookupTypeId, itemCount: count() })
      .from(lookups)
      .where(and(eq(lookups.isActive, true), eq(lookups.isDeleted, false)))
      .groupBy(lookups.lookupTypeId);
    return new Map(rows.map((row) => [row.lookupTypeId, Number(row.itemCount)]));
  }

  /**
   * Finds one item by code inside a type, tolerating legacy rows whose stored code is not already
   * canonical (`Day Trip` still resolves to `DAY_TRIP`). One indexed lookup on the happy path.
   */
  async function findItemRowByCode(
    typeId: number,
    normalizedCode: string,
  ): Promise<LookupRow | null> {
    const [exact] = await db
      .select()
      .from(lookups)
      .where(and(eq(lookups.lookupTypeId, typeId), eq(lookups.code, normalizedCode)))
      .limit(1);
    if (exact) return exact;

    // Legacy / hand-written rows: compare through the shared normalisation rule (LK-04).
    const candidates = await db.select().from(lookups).where(eq(lookups.lookupTypeId, typeId));
    return candidates.find((row) => normalizeLookupCode(row.code) === normalizedCode) ?? null;
  }

  async function findTypeRowByCode(normalizedCode: string): Promise<LookupTypeRow | null> {
    const [exact] = await db
      .select()
      .from(lookupTypes)
      .where(eq(lookupTypes.code, normalizedCode))
      .limit(1);
    if (exact) return exact;

    const candidates = await db.select().from(lookupTypes);
    return candidates.find((row) => normalizeLookupCode(row.code) === normalizedCode) ?? null;
  }

  async function readItemsForTypes(
    typeRows: readonly LookupTypeRow[],
    options?: GetTypeByCodeOptions,
  ): Promise<Map<number, LookupItemDto[]>> {
    const result = new Map<number, LookupItemDto[]>();
    if (typeRows.length === 0) return result;

    const includeInactive = options?.includeInactive ?? false;
    const includeDeleted = options?.includeDeleted ?? false;
    const includePrivate = options?.includePrivate ?? false;
    const parentCodeFilter = options?.parentCode
      ? normalizeLookupCode(options.parentCode)
      : undefined;

    const itemRows = await db
      .select()
      .from(lookups)
      .where(
        inArray(
          lookups.lookupTypeId,
          typeRows.map((row) => row.id),
        ),
      )
      .orderBy(...ITEM_TOTAL_ORDER);

    const parentCodes = await readParentItemCodesById(
      itemRows.map((row) => row.parentId).filter((id): id is number => id !== null),
    );
    const typeCodeById = new Map(typeRows.map((row) => [row.id, row.code]));

    for (const row of itemRows) {
      if (!includeDeleted && row.isDeleted) continue;
      if (!includeInactive && !row.isActive) continue;
      if (!includePrivate && !row.isPublic) continue;
      const parentCode = row.parentId ? (parentCodes.get(row.parentId) ?? null) : null;
      if (
        parentCodeFilter !== undefined &&
        normalizeLookupCode(parentCode ?? "") !== parentCodeFilter
      ) {
        continue;
      }
      const typeCode = typeCodeById.get(row.lookupTypeId) ?? "";
      const bucket = result.get(row.lookupTypeId) ?? [];
      bucket.push(toItemDto(row, typeCode, parentCode));
      result.set(row.lookupTypeId, bucket);
    }
    return result;
  }

  return {
    /**
     * Lists lookup types with an active-item count, ordered by `sortBy, code` (LK-08).
     *
     * @returns `status: "not_seeded"` with an empty list when the table holds no live type, which is
     *   the replacement for the deleted static fallback (LK-07).
     */
    async listTypes(options?: ListTypesOptions): Promise<ListTypesResult> {
      const includeInactive = options?.includeInactive ?? false;
      const includeDeleted = options?.includeDeleted ?? false;
      const includePrivate = options?.includePrivate ?? false;
      const codesFilter = options?.codes?.length
        ? new Set(options.codes.map((code) => normalizeLookupCode(code)))
        : undefined;

      const allRows = await readAllTypeRows();
      const seeded = allRows.some((row) => !row.isDeleted);
      if (!seeded) {
        return { types: [], status: "not_seeded" };
      }

      const normalizedParentTypeCode = options?.parentCode
        ? normalizeLookupCode(options.parentCode)
        : undefined;
      const parentTypeId = normalizedParentTypeCode
        ? (allRows.find((row) => normalizeLookupCode(row.code) === normalizedParentTypeCode)?.id ??
          -1)
        : undefined;

      const visibleRows = allRows.filter((row) => {
        if (!includeDeleted && row.isDeleted) return false;
        if (!includeInactive && !row.isActive) return false;
        if (!includePrivate && !row.isPublic) return false;
        if (codesFilter && !codesFilter.has(normalizeLookupCode(row.code))) return false;
        if (parentTypeId !== undefined && (row.parentId ?? null) !== parentTypeId) return false;
        return true;
      });

      const parentCodes = await readParentTypeCodesById(
        visibleRows.map((row) => row.parentId).filter((id): id is number => id !== null),
      );
      const itemCounts = await readActiveItemCounts();

      const types: LookupTypeSummaryDto[] = visibleRows.map((row) => ({
        ...toTypeDto(row, row.parentId ? (parentCodes.get(row.parentId) ?? null) : null),
        itemCount: itemCounts.get(row.id) ?? 0,
      }));

      return { types, status: "ok" };
    },

    /**
     * Reads one type and its ordered items (LK-09).
     *
     * A missing, soft-deleted or deactivated type is reported through `status`, never thrown:
     * `type_not_found` for all three (a deactivated type renders the PRD §5 case (a) per LK-24) and
     * `not_seeded` when the table is empty.
     */
    async getTypeByCode(
      typeCode: string,
      options?: GetTypeByCodeOptions,
    ): Promise<GetTypeByCodeResult> {
      const normalizedCode = normalizeLookupCode(typeCode);
      const includeInactive = options?.includeInactive ?? false;
      const includeDeleted = options?.includeDeleted ?? false;
      const includePrivate = options?.includePrivate ?? false;

      const typeRow = await findTypeRowByCode(normalizedCode);
      if (!typeRow) {
        const allRows = await readAllTypeRows();
        const seeded = allRows.some((row) => !row.isDeleted);
        return { type: null, items: [], status: seeded ? "type_not_found" : "not_seeded" };
      }

      if (!includeDeleted && typeRow.isDeleted) {
        return { type: null, items: [], status: "type_not_found" };
      }
      if (!includeInactive && !typeRow.isActive) {
        return { type: null, items: [], status: "type_not_found" };
      }
      if (!includePrivate && !typeRow.isPublic) {
        return { type: null, items: [], status: "type_not_found" };
      }

      const parentCodes = await readParentTypeCodesById(typeRow.parentId ? [typeRow.parentId] : []);
      const typeDto = toTypeDto(
        typeRow,
        typeRow.parentId ? (parentCodes.get(typeRow.parentId) ?? null) : null,
      );

      const itemsByType = await readItemsForTypes([typeRow], options);
      const items = itemsByType.get(typeRow.id) ?? [];

      return { type: { ...typeDto, items }, items, status: "ok" };
    },

    /**
     * Batch form of `getTypeByCode` for multi-field forms — one request, N types (LK-10).
     *
     * A requested code with no row is **absent** from `types` and carries `type_not_found` in
     * `statuses`; nothing throws.
     */
    async getByTypeCodes(
      typeCodes: readonly string[],
      options?: GetByTypeCodesOptions,
    ): Promise<GetByTypeCodesResult> {
      const includeInactive = options?.includeInactive ?? false;
      const includeDeleted = options?.includeDeleted ?? false;
      const includePrivate = options?.includePrivate ?? false;

      const allRows = await readAllTypeRows();
      const seeded = allRows.some((row) => !row.isDeleted);
      if (!seeded) {
        return { types: {}, statuses: {}, status: "not_seeded" };
      }

      const rowByNormalizedCode = new Map(
        allRows.map((row) => [normalizeLookupCode(row.code), row]),
      );
      const resolvedRows: LookupTypeRow[] = [];
      const statuses: Record<string, LookupTypeReadStatus> = {};

      for (const requested of typeCodes) {
        const normalized = normalizeLookupCode(requested);
        const row = rowByNormalizedCode.get(normalized);
        if (
          !row ||
          (!includeDeleted && row.isDeleted) ||
          (!includeInactive && !row.isActive) ||
          (!includePrivate && !row.isPublic)
        ) {
          statuses[requested] = "type_not_found";
          continue;
        }
        statuses[requested] = "ok";
        resolvedRows.push(row);
      }

      const itemsByType = await readItemsForTypes(resolvedRows, options);
      const parentCodes = await readParentTypeCodesById(
        resolvedRows.map((row) => row.parentId).filter((id): id is number => id !== null),
      );

      const types: Record<string, LookupTypeWithItemsDto> = {};
      for (const row of resolvedRows) {
        types[row.code] = {
          ...toTypeDto(row, row.parentId ? (parentCodes.get(row.parentId) ?? null) : null),
          items: itemsByType.get(row.id) ?? [],
        };
      }

      return { types, statuses, status: "ok" };
    },

    /**
     * Resolves one stored value against the table (LK-11).
     *
     * Looks at all four `isActive` × `isDeleted` combinations and never throws for an absent value,
     * because its purpose is to label a value that is no longer in the option list.
     */
    async resolve(typeCode: string, code: string): Promise<ResolveResult> {
      const normalizedTypeCode = normalizeLookupCode(typeCode);
      const normalizedCode = normalizeLookupCode(code);

      const typeRow = await findTypeRowByCode(normalizedTypeCode);
      if (!typeRow) return { item: null, status: "type_not_found" };

      const itemRow = await findItemRowByCode(typeRow.id, normalizedCode);
      const status = resolveReason(itemRow);
      if (!itemRow) return { item: null, status };

      const parentCodes = await readParentItemCodesById(itemRow.parentId ? [itemRow.parentId] : []);
      return {
        item: toItemDto(
          itemRow,
          typeRow.code,
          itemRow.parentId ? (parentCodes.get(itemRow.parentId) ?? null) : null,
        ),
        status,
      };
    },

    /**
     * Returns a verdict per submitted code (LK-12). Never throws, and an unknown type marks every
     * code `unknown_type` rather than failing the whole request.
     */
    async validate(typeCode: string, codes: readonly string[]): Promise<ValidateResult> {
      const normalizedTypeCode = normalizeLookupCode(typeCode);
      const typeRow = await findTypeRowByCode(normalizedTypeCode);

      if (!typeRow || typeRow.isDeleted) {
        return {
          results: codes.map((code) => ({
            code,
            valid: false,
            reason: "unknown_type" as LookupValidateReason,
          })),
        };
      }

      const itemRows = await db.select().from(lookups).where(eq(lookups.lookupTypeId, typeRow.id));
      const rowByNormalizedCode = new Map<string, LookupRow>();
      for (const row of itemRows) {
        rowByNormalizedCode.set(normalizeLookupCode(row.code), row);
      }

      const results: LookupValidateResult[] = codes.map((code) => {
        const row = rowByNormalizedCode.get(normalizeLookupCode(code));
        let reason: LookupValidateReason;
        if (!row) reason = "unknown_code";
        else if (row.isDeleted) reason = "deleted";
        else if (!row.isActive) reason = "inactive";
        else reason = "ok";
        return { code, valid: reason === "ok", reason };
      });

      return { results };
    },

    /** Creates or updates a lookup type by natural key (`code`). */
    async upsertType(input: UpsertLookupTypeInput): Promise<LookupTypeDto> {
      const now = new Date();
      const normalizedCode = normalizeLookupCode(input.code);
      const normalizedParentCode = input.parentCode ? normalizeLookupCode(input.parentCode) : null;

      let parentId: number | null = null;
      if (normalizedParentCode) {
        const parentRow = await findTypeRowByCode(normalizedParentCode);
        if (!parentRow) {
          throw new ServiceError(
            "RESOURCE_NOT_FOUND",
            `Parent lookup type "${normalizedParentCode}" was not found.`,
            { parentCode: normalizedParentCode },
          );
        }
        parentId = parentRow.id;
      }

      // Only an explicit `isActive` may change the flag; a label edit never reactivates a type.
      const updateSet = {
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
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      };

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
          isActive: input.isActive ?? true,
          isSystem: input.isSystem ?? false,
          isDeleted: false,
          createdBy: input.actorAccountId ?? null,
          updatedBy: input.actorAccountId ?? null,
          deletedBy: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        })
        .onConflictDoUpdate({ target: lookupTypes.code, set: updateSet })
        .returning();

      return toTypeDto(saved!, normalizedParentCode);
    },

    /** Creates or updates a lookup item by natural key (`lookupTypeId`, `code`). */
    async upsertLookup(input: UpsertLookupInput): Promise<LookupItemDto> {
      const now = new Date();
      const normalizedTypeCode = normalizeLookupCode(input.typeCode);
      const normalizedCode = normalizeLookupCode(input.code);

      const typeRow = await findTypeRowByCode(normalizedTypeCode);
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
          const parentTypeRow = await findTypeRowByCode(effectiveParentTypeCode);
          parentTypeId = parentTypeRow?.id;
        } else if (typeRow.parentId) {
          parentTypeId = typeRow.parentId;
        }

        const parentLookupRow = await findItemRowByCode(
          parentTypeId ?? typeRow.id,
          normalizedParentLookupCode,
        );
        if (!parentLookupRow) {
          throw new ServiceError(
            "RESOURCE_NOT_FOUND",
            `Parent lookup "${normalizedParentLookupCode}" was not found.`,
            { parentLookupCode: normalizedParentLookupCode },
          );
        }
        parentId = parentLookupRow.id;
      }

      const updateSet = {
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
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      };

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
          isActive: input.isActive ?? true,
          isDeleted: false,
          createdBy: input.actorAccountId ?? null,
          updatedBy: input.actorAccountId ?? null,
          deletedBy: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        })
        .onConflictDoUpdate({ target: [lookups.lookupTypeId, lookups.code], set: updateSet })
        .returning();

      return toItemDto(saved!, typeRow.code, normalizedParentLookupCode);
    },

    /**
     * Activates or deactivates a whole type without deleting it (LK-24).
     *
     * @returns The updated type, or `null` when the code has no row.
     */
    async setTypeActive(
      code: string,
      isActive: boolean,
      actorAccountId?: string | null,
    ): Promise<LookupTypeDto | null> {
      const normalizedCode = normalizeLookupCode(code);
      const existing = await findTypeRowByCode(normalizedCode);
      if (!existing) return null;

      const now = new Date();
      const [updated] = await db
        .update(lookupTypes)
        .set({ isActive, updatedBy: actorAccountId ?? null, updatedAt: now })
        .where(eq(lookupTypes.id, existing.id))
        .returning();
      if (!updated) return null;

      const parentCodes = await readParentTypeCodesById(updated.parentId ? [updated.parentId] : []);
      return toTypeDto(
        updated,
        updated.parentId ? (parentCodes.get(updated.parentId) ?? null) : null,
      );
    },

    /**
     * Activates or deactivates one item without deleting it (LK-01, LK-24). The item leaves every
     * option list but keeps resolving with status `inactive`.
     *
     * @returns The updated item, or `null` when the type or the code has no row.
     */
    async setItemActive(
      typeCode: string,
      code: string,
      isActive: boolean,
      actorAccountId?: string | null,
    ): Promise<LookupItemDto | null> {
      const normalizedTypeCode = normalizeLookupCode(typeCode);
      const normalizedCode = normalizeLookupCode(code);

      const typeRow = await findTypeRowByCode(normalizedTypeCode);
      if (!typeRow) return null;

      const existing = await findItemRowByCode(typeRow.id, normalizedCode);
      if (!existing) return null;

      const now = new Date();
      const [updated] = await db
        .update(lookups)
        .set({ isActive, updatedBy: actorAccountId ?? null, updatedAt: now })
        .where(eq(lookups.id, existing.id))
        .returning();
      if (!updated) return null;

      const parentCodes = await readParentItemCodesById(updated.parentId ? [updated.parentId] : []);
      return toItemDto(
        updated,
        typeRow.code,
        updated.parentId ? (parentCodes.get(updated.parentId) ?? null) : null,
      );
    },

    /** Soft-deletes a non-system type by code. */
    async softDeleteType(params: {
      code: string;
      deletedBy?: string | null;
      forceSystem?: boolean;
    }): Promise<LookupTypeDto | null> {
      const normalizedCode = normalizeLookupCode(params.code);
      const existing = await findTypeRowByCode(normalizedCode);
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
      if (!updated) return null;

      const parentCodes = await readParentTypeCodesById(updated.parentId ? [updated.parentId] : []);
      return toTypeDto(
        updated,
        updated.parentId ? (parentCodes.get(updated.parentId) ?? null) : null,
      );
    },

    /** Soft-deletes one item by natural key. */
    async softDeleteLookup(params: {
      typeCode: string;
      code: string;
      deletedBy?: string | null;
    }): Promise<LookupItemDto | null> {
      const normalizedTypeCode = normalizeLookupCode(params.typeCode);
      const normalizedCode = normalizeLookupCode(params.code);

      const typeRow = await findTypeRowByCode(normalizedTypeCode);
      if (!typeRow) return null;

      const existing = await findItemRowByCode(typeRow.id, normalizedCode);
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
      if (!updated) return null;

      const parentCodes = await readParentItemCodesById(updated.parentId ? [updated.parentId] : []);
      return toItemDto(
        updated,
        typeRow.code,
        updated.parentId ? (parentCodes.get(updated.parentId) ?? null) : null,
      );
    },

    // ---------------------------------------------------------------------------------------
    // Legacy wrappers. They exist only because the API router and the demo seeder still call the
    // pre-rewrite names; T3/T9 delete them. Each one delegates to the new methods above — there is
    // no second implementation and no static fallback anywhere in this file.
    // ---------------------------------------------------------------------------------------

    /** @deprecated Use `upsertType`. */
    async upsertLookupType(input: UpsertLookupTypeInput): Promise<LookupTypeDto> {
      return await this.upsertType(input);
    },

    /** @deprecated Use `softDeleteType`. */
    async softDeleteLookupType(params: {
      code: string;
      deletedBy?: string | null;
      forceSystem?: boolean;
    }): Promise<LookupTypeDto | null> {
      return await this.softDeleteType(params);
    },

    /** @deprecated Use `listTypes`. */
    async listLookupTypes(
      options?: ListTypesOptions & { includePrivate?: boolean },
    ): Promise<LookupTypeDto[]> {
      const { types } = await this.listTypes(options);
      return types;
    },

    /** @deprecated Use `getTypeByCode`. */
    async getLookupTypeByCode(
      typeCode: string,
      options?: GetTypeByCodeOptions & { parentLookupCode?: string },
    ): Promise<LookupTypeWithItemsDto | null> {
      const { type } = await this.getTypeByCode(typeCode, {
        includeInactive: options?.includeInactive,
        includeDeleted: options?.includeDeleted,
        includePrivate: options?.includePrivate,
        parentCode: options?.parentCode ?? options?.parentLookupCode,
      });
      return type;
    },

    /** @deprecated Use `getByTypeCodes().types`. */
    async getLookupsByTypeCodes(
      typeCodes: readonly string[],
      options?: GetByTypeCodesOptions,
    ): Promise<Record<string, LookupTypeWithItemsDto>> {
      const { types } = await this.getByTypeCodes(typeCodes, options);
      return types;
    },

    /** @deprecated Use `resolve`. */
    async getLookupByCode(
      params: GetLookupByCodeParams,
    ): Promise<(LookupItemDto & { children: LookupItemDto[] }) | null> {
      const normalizedCode = normalizeLookupCode(params.code);
      let item: LookupItemDto | null = null;

      if (params.typeCode) {
        const resolved = await this.resolve(params.typeCode, params.code);
        if (!params.includeDeleted && resolved.status === "deleted") return null;
        if (!params.includeInactive && resolved.status === "inactive") return null;
        item = resolved.item;
      } else {
        // No type given: match by code across every type, as the pre-rewrite method did.
        const candidates = await db
          .select()
          .from(lookups)
          .where(eq(lookups.code, normalizedCode))
          .orderBy(...ITEM_TOTAL_ORDER);
        const row = candidates.find(
          (candidate) =>
            (params.includeDeleted || !candidate.isDeleted) &&
            (params.includeInactive || candidate.isActive) &&
            (params.includePrivate || candidate.isPublic),
        );
        if (row) {
          const [typeRow] = await db
            .select({ code: lookupTypes.code })
            .from(lookupTypes)
            .where(eq(lookupTypes.id, row.lookupTypeId))
            .limit(1);
          const parentCodes = await readParentItemCodesById(row.parentId ? [row.parentId] : []);
          item = toItemDto(
            row,
            typeRow?.code ?? "",
            row.parentId ? (parentCodes.get(row.parentId) ?? null) : null,
          );
        }
      }

      if (!item) return null;
      if (!params.includePrivate && !item.isPublic) return null;

      const parentItem = item;
      const childRows = await db
        .select()
        .from(lookups)
        .where(eq(lookups.parentId, parentItem.id))
        .orderBy(...ITEM_TOTAL_ORDER);
      const children: LookupItemDto[] = childRows
        .filter(
          (row) =>
            (params.includeDeleted || !row.isDeleted) &&
            (params.includeInactive || row.isActive) &&
            (params.includePrivate || row.isPublic),
        )
        .map((row) => toItemDto(row, parentItem.typeCode, parentItem.code));

      return { ...parentItem, children };
    },
  };
}

/** The repository's public surface, for callers that need to name it. */
export type LookupsRepository = ReturnType<typeof createLookupsRepository>;

/**
 * Maps a resolve status onto the compact write-path vocabulary used by services (design §1).
 * Kept here so every service's `findLookupStatus` is a one-liner over the same mapping.
 */
export function toLookupStatus(
  status: LookupResolveStatus,
): "active" | "inactive" | "deleted" | "unknown" | "unknown_type" {
  switch (status) {
    case "active":
      return "active";
    case "inactive":
      return "inactive";
    case "deleted":
      return "deleted";
    case "not_found":
      return "unknown";
    case "type_not_found":
      return "unknown_type";
    default:
      return "unknown";
  }
}
