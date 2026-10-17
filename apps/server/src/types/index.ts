// Shared TypeScript interfaces and types for apps/server.
import type { ElysiaOpenAPIConfig } from "@elysia/openapi";
import type { AuthActor, Context as RpcContext } from "@trips-app/rpc";
import type { Context as ElysiaContext } from "elysia";

export type { CoercedEnvSchema, EnvSchemaAsStrings, PublicCoercedEnvSchema } from "../env";

export type CreateContextOptions = {
  context: ElysiaContext;
};

export type Context = RpcContext;

export type OpenAPIDocumentation = NonNullable<ElysiaOpenAPIConfig["documentation"]>;

export type { AuthActor, ElysiaContext, RpcContext };
