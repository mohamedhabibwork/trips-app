import { useQuery } from "@tanstack/react-query";
import type {
  LookupItemDto,
  LookupLocalizedText,
  LookupTypeCode,
  LookupTypeDto,
  LookupTypeWithItemsDto,
} from "@trips-app/api";

import { client, orpc } from "./orpc";

export type {
  LookupItemDto,
  LookupLocalizedText,
  LookupTypeCode,
  LookupTypeDto,
  LookupTypeWithItemsDto,
};

export interface LookupSelectOption {
  id: number;
  uuid: string;
  code: string;
  value: string;
  label: string;
  description: string | null;
  parentCode: string | null;
  sortBy: number;
  item: LookupItemDto;
}

export function normalizeLookupCode(code: string): string {
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function localizeLookupText(
  text: LookupLocalizedText | null | undefined,
  locale: "ar" | "en" = "ar",
): string {
  if (!text) return "";
  return locale === "ar" ? text.ar || text.en : text.en || text.ar;
}

export function toLookupSelectOptions(
  items: readonly LookupItemDto[] | undefined | null,
  locale: "ar" | "en" = "ar",
): LookupSelectOption[] {
  if (!items || items.length === 0) return [];
  return [...items]
    .sort((a, b) => a.sortBy - b.sortBy || a.code.localeCompare(b.code))
    .map((item) => ({
      id: item.id,
      uuid: item.uuid,
      code: item.code,
      value: item.value,
      label: localizeLookupText(item.name, locale),
      description: item.description ? localizeLookupText(item.description, locale) : null,
      parentCode: item.parentCode,
      sortBy: item.sortBy,
      item,
    }));
}

export function findLookupItemByCode(
  items: readonly LookupItemDto[] | undefined | null,
  code: string,
): LookupItemDto | undefined {
  if (!items) return undefined;
  const normalized = normalizeLookupCode(code);
  return items.find((item) => normalizeLookupCode(item.code) === normalized);
}

/**
 * Direct RPC helpers for route loaders and non-React callers.
 */
export async function fetchLookupTypes(options?: {
  codes?: string[];
  parentCode?: string;
}): Promise<LookupTypeDto[]> {
  const res = await client.lookups.listTypes(options);
  return res.lookupTypes;
}

export async function fetchLookupTypeByCode(
  code: LookupTypeCode | string,
  options?: { parentLookupCode?: string },
): Promise<LookupTypeWithItemsDto | null> {
  const res = await client.lookups.getTypeByCode({
    code: normalizeLookupCode(code),
    parentLookupCode: options?.parentLookupCode
      ? normalizeLookupCode(options.parentLookupCode)
      : undefined,
  });
  return res.lookupType;
}

export async function fetchLookupsByTypeCode(
  code: LookupTypeCode | string,
  options?: { parentLookupCode?: string },
): Promise<LookupItemDto[]> {
  const lookupType = await fetchLookupTypeByCode(code, options);
  return lookupType?.items ?? [];
}

export async function fetchLookupsByTypeCodes(
  codes: readonly (LookupTypeCode | string)[],
): Promise<Record<string, LookupTypeWithItemsDto>> {
  const normalizedCodes = codes.map((c) => normalizeLookupCode(c));
  const res = await client.lookups.getByTypeCodes({ codes: normalizedCodes });
  return res.lookupTypes;
}

export async function fetchLookupByCode(
  code: string,
  typeCode?: LookupTypeCode | string,
): Promise<{ lookup: LookupItemDto | null; childLookups: LookupItemDto[] }> {
  return client.lookups.getByCode({
    code: normalizeLookupCode(code),
    typeCode: typeCode ? normalizeLookupCode(typeCode) : undefined,
  });
}

/**
 * TanStack Query hooks for React components across the Web app.
 */
export function useLookupTypes(options?: { codes?: string[]; parentCode?: string }) {
  return useQuery(
    orpc.lookups.listTypes.queryOptions({
      input: options,
    }),
  );
}

export function useLookupsByTypeCode(
  code: LookupTypeCode | string,
  options?: { parentLookupCode?: string; locale?: "ar" | "en" },
) {
  const normalizedCode = normalizeLookupCode(code);
  const parentLookupCode = options?.parentLookupCode
    ? normalizeLookupCode(options.parentLookupCode)
    : undefined;
  const locale = options?.locale ?? "ar";

  const query = useQuery(
    orpc.lookups.getTypeByCode.queryOptions({
      input: {
        code: normalizedCode,
        parentLookupCode,
      },
    }),
  );

  const lookupType = query.data?.lookupType ?? null;
  const items = lookupType?.items ?? [];
  const selectOptions = toLookupSelectOptions(items, locale);

  return {
    ...query,
    lookupType,
    items,
    selectOptions,
  };
}

export function useLookupsByTypeCodes(codes: readonly (LookupTypeCode | string)[]) {
  const normalizedCodes = codes.map((c) => normalizeLookupCode(c));
  return useQuery(
    orpc.lookups.getByTypeCodes.queryOptions({
      input: { codes: normalizedCodes },
    }),
  );
}

export function useLookupByCode(code: string, typeCode?: LookupTypeCode | string) {
  const normalizedCode = normalizeLookupCode(code);
  const normalizedTypeCode = typeCode ? normalizeLookupCode(typeCode) : undefined;
  return useQuery(
    orpc.lookups.getByCode.queryOptions({
      input: {
        code: normalizedCode,
        typeCode: normalizedTypeCode,
      },
    }),
  );
}
