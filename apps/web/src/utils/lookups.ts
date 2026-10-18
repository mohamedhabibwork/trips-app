import { useQuery, type QueryClient } from "@tanstack/react-query";
import type {
  LookupItemDto,
  LookupLocalizedText,
  LookupTypeCode,
  LookupTypeDto,
  LookupTypeWithItemsDto,
} from "@trips-app/api";

import { orpc } from "./orpc";

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

export type ListLookupTypesInput = {
  codes?: string[];
  parentCode?: string;
  includePrivate?: boolean;
};

/**
 * Reusable Query Options builders for TanStack Query / SSR Loaders.
 */
export function lookupTypesQueryOptions(options?: ListLookupTypesInput) {
  return orpc.lookups.listTypes.queryOptions({ input: options ?? {} });
}

export function ensureLookupTypes(queryClient: QueryClient, options?: ListLookupTypesInput) {
  return queryClient.ensureQueryData(lookupTypesQueryOptions(options));
}

export function prefetchLookupTypes(queryClient: QueryClient, options?: ListLookupTypesInput) {
  return queryClient.prefetchQuery(lookupTypesQueryOptions(options));
}

export function lookupTypeByCodeQueryOptions(
  code: LookupTypeCode | string,
  options?: { parentLookupCode?: string },
) {
  return orpc.lookups.getTypeByCode.queryOptions({
    input: {
      code: normalizeLookupCode(code),
      parentLookupCode: options?.parentLookupCode
        ? normalizeLookupCode(options.parentLookupCode)
        : undefined,
    },
  });
}

export function ensureLookupTypeByCode(
  queryClient: QueryClient,
  code: LookupTypeCode | string,
  options?: { parentLookupCode?: string },
) {
  return queryClient.ensureQueryData(lookupTypeByCodeQueryOptions(code, options));
}

export function prefetchLookupTypeByCode(
  queryClient: QueryClient,
  code: LookupTypeCode | string,
  options?: { parentLookupCode?: string },
) {
  return queryClient.prefetchQuery(lookupTypeByCodeQueryOptions(code, options));
}

export function lookupsByTypeCodesQueryOptions(codes: readonly (LookupTypeCode | string)[]) {
  const normalizedCodes = codes.map((c) => normalizeLookupCode(c));
  return orpc.lookups.getByTypeCodes.queryOptions({
    input: { codes: normalizedCodes },
  });
}

export function ensureLookupsByTypeCodes(
  queryClient: QueryClient,
  codes: readonly (LookupTypeCode | string)[],
) {
  return queryClient.ensureQueryData(lookupsByTypeCodesQueryOptions(codes));
}

export function prefetchLookupsByTypeCodes(
  queryClient: QueryClient,
  codes: readonly (LookupTypeCode | string)[],
) {
  return queryClient.prefetchQuery(lookupsByTypeCodesQueryOptions(codes));
}

export function lookupByCodeQueryOptions(code: string, typeCode?: LookupTypeCode | string) {
  return orpc.lookups.getByCode.queryOptions({
    input: {
      code: normalizeLookupCode(code),
      typeCode: typeCode ? normalizeLookupCode(typeCode) : undefined,
    },
  });
}

export function ensureLookupByCode(
  queryClient: QueryClient,
  code: string,
  typeCode?: LookupTypeCode | string,
) {
  return queryClient.ensureQueryData(lookupByCodeQueryOptions(code, typeCode));
}

export function prefetchLookupByCode(
  queryClient: QueryClient,
  code: string,
  typeCode?: LookupTypeCode | string,
) {
  return queryClient.prefetchQuery(lookupByCodeQueryOptions(code, typeCode));
}

/**
 * Direct RPC helpers for route loaders and non-React callers.
 */
export async function fetchLookupTypes(options?: ListLookupTypesInput): Promise<LookupTypeDto[]> {
  const res = await orpc.lookups.listTypes.call(options ?? {});
  return res.lookupTypes;
}

export async function fetchLookupTypeByCode(
  code: LookupTypeCode | string,
  options?: { parentLookupCode?: string },
): Promise<LookupTypeWithItemsDto | null> {
  const res = await orpc.lookups.getTypeByCode.call({
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
  const res = await orpc.lookups.getByTypeCodes.call({ codes: normalizedCodes });
  return res.lookupTypes;
}

export async function fetchLookupByCode(
  code: string,
  typeCode?: LookupTypeCode | string,
): Promise<{ lookup: LookupItemDto | null; childLookups: LookupItemDto[] }> {
  return orpc.lookups.getByCode.call({
    code: normalizeLookupCode(code),
    typeCode: typeCode ? normalizeLookupCode(typeCode) : undefined,
  });
}

/**
 * TanStack Query hooks for React components across the Web app.
 */
export function useLookupTypes(options?: ListLookupTypesInput) {
  return useQuery(lookupTypesQueryOptions(options));
}

export function useLookupsByTypeCode(
  code: LookupTypeCode | string,
  options?: { parentLookupCode?: string; locale?: "ar" | "en" },
) {
  const query = useQuery(lookupTypeByCodeQueryOptions(code, options));
  const lookupType = query.data?.lookupType ?? null;
  const items = lookupType?.items ?? [];
  const selectOptions = toLookupSelectOptions(items, options?.locale ?? "ar");

  return {
    ...query,
    lookupType,
    items,
    selectOptions,
  };
}

export function useLookupsByTypeCodes(codes: readonly (LookupTypeCode | string)[]) {
  return useQuery(lookupsByTypeCodesQueryOptions(codes));
}

export function useLookupByCode(code: string, typeCode?: LookupTypeCode | string) {
  return useQuery(lookupByCodeQueryOptions(code, typeCode));
}
