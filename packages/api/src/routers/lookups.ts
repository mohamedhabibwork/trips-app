import { createInsertSchema, createLookupsRepository, schema } from "@trips-app/db";
import { publicProcedure, requireAdminSubRoles } from "@trips-app/rpc";
import { z } from "zod/v4";

const localizedTextSchema = z.object({
  ar: z.string().min(1).max(500),
  en: z.string().min(1).max(500),
});

export const listLookupTypesInputSchema = z
  .object({
    codes: z.array(z.string().min(1).max(120)).optional(),
    parentCode: z.string().min(1).max(120).optional(),
    includePrivate: z.boolean().optional(),
  })
  .optional();

export const getLookupTypeByCodeInputSchema = z
  .object({
    code: z.string().min(1).max(120).optional(),
    parentLookupCode: z.string().min(1).max(120).optional(),
  })
  .optional();

export const getLookupsByTypeCodesInputSchema = z
  .object({
    codes: z.array(z.string().min(1).max(120)).optional(),
  })
  .optional();

export const getLookupByCodeInputSchema = z
  .object({
    code: z.string().min(1).max(120).optional(),
    typeCode: z.string().min(1).max(120).optional(),
  })
  .optional();

// Field types, nullability, defaults and the varchar length of `value` come from the table.
// The refinements add the API limits: 120 characters for codes and the localized text shape.
export const upsertLookupTypeInputSchema = createInsertSchema(schema.lookupTypes, {
  code: (column) => column.min(1).max(120),
  value: (column) => column.min(1),
  name: () => localizedTextSchema,
  description: () => localizedTextSchema,
  sortBy: (column) => column.min(0).max(100_000),
})
  .pick({
    code: true,
    value: true,
    name: true,
    description: true,
    sortBy: true,
    isPublic: true,
    isSystem: true,
  })
  .extend({
    parentCode: z.string().min(1).max(120).nullable().optional(),
  });

export const upsertLookupInputSchema = createInsertSchema(schema.lookups, {
  code: (column) => column.min(1).max(120),
  value: (column) => column.min(1),
  name: () => localizedTextSchema,
  description: () => localizedTextSchema,
  sortBy: (column) => column.min(0).max(100_000),
})
  .pick({
    code: true,
    value: true,
    name: true,
    description: true,
    sortBy: true,
    isPublic: true,
  })
  .extend({
    typeCode: z.string().min(1).max(120),
    parentLookupCode: z.string().min(1).max(120).nullable().optional(),
    parentTypeCode: z.string().min(1).max(120).nullable().optional(),
  });

export const deleteLookupTypeInputSchema = z.object({
  code: z.string().min(1).max(120),
});

export const deleteLookupInputSchema = z.object({
  typeCode: z.string().min(1).max(120),
  code: z.string().min(1).max(120),
});

const opsOrSuperAdminProcedure = requireAdminSubRoles("super_admin", "operations");

export const lookupsRouter = {
  listTypes: publicProcedure
    .route({
      method: "POST",
      path: "/lookups/listTypes",
      operationId: "lookupsListTypes",
      summary: "List lookup types by optional code or parent code filter",
      tags: ["system"],
    })
    .input(listLookupTypesInputSchema)
    .handler(async ({ context, input }) => {
      const repo = createLookupsRepository(context.db);
      const isAdmin = context.auth?.activeRole === "admin";
      const lookupTypes = await repo.listLookupTypes({
        codes: input?.codes,
        parentCode: input?.parentCode,
        includePrivate: isAdmin ? Boolean(input?.includePrivate) : false,
      });
      return { lookupTypes };
    }),

  getTypeByCode: publicProcedure
    .route({
      method: "POST",
      path: "/lookups/getTypeByCode",
      operationId: "lookupsGetTypeByCode",
      summary: "Get a lookup type and its ordered lookup items by lookup_types.code",
      tags: ["system"],
    })
    .input(getLookupTypeByCodeInputSchema)
    .handler(async ({ context, input }) => {
      if (!input?.code) {
        return { lookupType: null };
      }
      const repo = createLookupsRepository(context.db);
      const isAdmin = context.auth?.activeRole === "admin";
      const lookupType = await repo.getLookupTypeByCode(input.code, {
        parentLookupCode: input.parentLookupCode,
        includePrivate: isAdmin,
      });
      return { lookupType };
    }),

  getByTypeCodes: publicProcedure
    .route({
      method: "POST",
      path: "/lookups/getByTypeCodes",
      operationId: "lookupsGetByTypeCodes",
      summary: "Batch fetch multiple lookup types and their items by lookup_types.code list",
      tags: ["system"],
    })
    .input(getLookupsByTypeCodesInputSchema)
    .handler(async ({ context, input }) => {
      const codes = input?.codes ?? [];
      if (codes.length === 0) {
        return { lookupTypes: {}, list: [] };
      }
      const repo = createLookupsRepository(context.db);
      const isAdmin = context.auth?.activeRole === "admin";
      const lookupTypes = await repo.getLookupsByTypeCodes(codes, {
        includePrivate: isAdmin,
      });
      return {
        lookupTypes,
        list: Object.values(lookupTypes),
      };
    }),

  getByCode: publicProcedure
    .route({
      method: "POST",
      path: "/lookups/getByCode",
      operationId: "lookupsGetByCode",
      summary: "Get a single lookup item and its child lookups by lookups.code",
      tags: ["system"],
    })
    .input(getLookupByCodeInputSchema)
    .handler(async ({ context, input }) => {
      if (!input?.code) {
        return { lookup: null, childLookups: [] };
      }
      const repo = createLookupsRepository(context.db);
      const isAdmin = context.auth?.activeRole === "admin";
      const found = await repo.getLookupByCode({
        code: input.code,
        typeCode: input.typeCode,
        includePrivate: isAdmin,
      });
      if (!found) {
        return { lookup: null, childLookups: [] };
      }
      const { children, ...lookup } = found;
      return {
        lookup,
        childLookups: children,
      };
    }),

  upsertType: opsOrSuperAdminProcedure
    .route({
      method: "POST",
      path: "/lookups/upsertType",
      operationId: "lookupsUpsertType",
      summary: "Create or update a lookup type by code",
      tags: ["admin"],
    })
    .input(upsertLookupTypeInputSchema)
    .handler(async ({ context, input }) => {
      const repo = createLookupsRepository(context.db);
      const lookupType = await repo.upsertLookupType({
        ...input,
        actorAccountId: context.auth.accountId,
      });
      return { lookupType };
    }),

  upsertLookup: opsOrSuperAdminProcedure
    .route({
      method: "POST",
      path: "/lookups/upsertLookup",
      operationId: "lookupsUpsertLookup",
      summary: "Create or update a lookup item under a lookup type by code",
      tags: ["admin"],
    })
    .input(upsertLookupInputSchema)
    .handler(async ({ context, input }) => {
      const repo = createLookupsRepository(context.db);
      const lookup = await repo.upsertLookup({
        ...input,
        actorAccountId: context.auth.accountId,
      });
      return { lookup };
    }),

  deleteType: opsOrSuperAdminProcedure
    .route({
      method: "POST",
      path: "/lookups/deleteType",
      operationId: "lookupsDeleteType",
      summary: "Soft-delete a non-system lookup type by code",
      tags: ["admin"],
    })
    .input(deleteLookupTypeInputSchema)
    .handler(async ({ context, input }) => {
      const repo = createLookupsRepository(context.db);
      const deleted = await repo.softDeleteLookupType({
        code: input.code,
        deletedBy: context.auth.accountId,
      });
      return { lookupType: deleted };
    }),

  deleteLookup: opsOrSuperAdminProcedure
    .route({
      method: "POST",
      path: "/lookups/deleteLookup",
      operationId: "lookupsDeleteLookup",
      summary: "Soft-delete a lookup item by code",
      tags: ["admin"],
    })
    .input(deleteLookupInputSchema)
    .handler(async ({ context, input }) => {
      const repo = createLookupsRepository(context.db);
      const deleted = await repo.softDeleteLookup({
        typeCode: input.typeCode,
        code: input.code,
        deletedBy: context.auth.accountId,
      });
      return { lookup: deleted };
    }),
};
