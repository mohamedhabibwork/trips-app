import { randomUUID } from "node:crypto";

import { fromTypes, openapi } from "@elysia/openapi";
import { cors } from "@elysiajs/cors";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { SmartCoercionPlugin } from "@orpc/json-schema";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import {
  createErrorResponse,
  createMediaService,
  createOpenAPISpecGenerateOptions,
  createSuccessResponse,
  encodeOpenAPIErrorResponse,
  generateOpenAPISpec,
  normalizeErrorToEnvelope,
  wrapOpenAPIHttpResponse,
} from "@trips-app/api";
import { appRouter } from "@trips-app/api/routers/index";
import { Elysia } from "elysia";
import { initLogger } from "evlog";
import { evlog } from "evlog/elysia";

import { createContext } from "./context";
import { ENV } from "./env.server";
import {
  disks,
  getKitsHealth,
  logContext,
  logger,
  queue,
  shutdownKits,
  startUnlinkedMediaCleanupWorker,
} from "./services";
import type { OpenAPIDocumentation } from "./types";

export type * from "./types";

const rpcHandler = new RPCHandler(appRouter, {
  plugins: [
    new SmartCoercionPlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      logger.error("RPC handler error", error instanceof Error ? error : { cause: String(error) });
    }),
  ],
});

const apiHandler = new OpenAPIHandler(appRouter, {
  customErrorResponseBodyEncoder: (error) => encodeOpenAPIErrorResponse(error),
  plugins: [
    new SmartCoercionPlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: createOpenAPISpecGenerateOptions(),
    }),
  ],
  interceptors: [
    onError((error) => {
      logger.error(
        "OpenAPI handler error",
        error instanceof Error ? error : { cause: String(error) },
      );
    }),
  ],
});

initLogger({
  env: { service: "trips-app-server" },
});

export const orpcOpenAPISpec = await generateOpenAPISpec();

function resolveRequestMeta(request: Request): { requestId: string; locale: "ar" | "en" } {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const acceptLanguage = request.headers.get("accept-language") ?? "ar";
  const locale = acceptLanguage.toLowerCase().startsWith("en") ? "en" : "ar";
  return { requestId, locale };
}

export const app = new Elysia()
  .use(evlog())
  .use(
    openapi({
      openapiVersion: "3.1.1",
      references: fromTypes(),
      exclude: {
        paths: ["/rpc", "/rpc*", "/api", "/api*", "/api-reference", "/api-reference*"],
      },
      documentation: {
        info: orpcOpenAPISpec.info,
        servers: orpcOpenAPISpec.servers,
        tags: orpcOpenAPISpec.tags,
        security: orpcOpenAPISpec.security,
        paths: orpcOpenAPISpec.paths,
        components: orpcOpenAPISpec.components,
      } as unknown as OpenAPIDocumentation,
    }),
  )
  .use(
    cors({
      origin: ENV.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  )
  .onError(({ code, error, request, set }) => {
    const { requestId, locale } = resolveRequestMeta(request);
    set.headers["x-request-id"] = requestId;

    if (code === "NOT_FOUND") {
      set.status = 404;
      return createErrorResponse({
        code: "RESOURCE_NOT_FOUND",
        locale,
        requestId,
        service: "server",
      });
    }

    if (code === "VALIDATION" || code === "PARSE") {
      set.status = 400;
      return createErrorResponse({
        code: "VALIDATION_ERROR",
        message: error instanceof Error ? error.message : undefined,
        locale,
        requestId,
        service: "server",
      });
    }

    const envelope = normalizeErrorToEnvelope(error, {
      locale,
      requestId,
      service: "server",
    });
    set.status = envelope.error.status;
    return envelope;
  })
  .all(
    "/rpc*",
    async (context) => {
      const rpcContext = await createContext({ context });
      return logContext.run(
        {
          requestId: rpcContext.requestId,
          locale: rpcContext.locale,
          accountId: rpcContext.auth?.accountId,
          tenantId: rpcContext.auth?.activeTenantId ?? null,
          role: rpcContext.auth?.activeRole,
        },
        async () => {
          const { response } = await rpcHandler.handle(context.request, {
            prefix: "/rpc",
            context: rpcContext,
          });
          if (!response) {
            const notFound = createErrorResponse({
              code: "RESOURCE_NOT_FOUND",
              locale: rpcContext.locale ?? "ar",
              requestId: rpcContext.requestId ?? randomUUID(),
              service: "rpc",
            });
            return new Response(JSON.stringify(notFound), {
              status: 404,
              headers: {
                "content-type": "application/json; charset=utf-8",
                "x-request-id": notFound.requestId,
              },
            });
          }
          const headers = new Headers(response.headers);
          if (rpcContext.requestId) {
            headers.set("x-request-id", rpcContext.requestId);
          }
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
        },
      );
    },
    {
      parse: "none",
    },
  )
  .all(
    "/api-reference*",
    async (context) => {
      const rpcContext = await createContext({ context });
      return logContext.run(
        {
          requestId: rpcContext.requestId,
          locale: rpcContext.locale,
          accountId: rpcContext.auth?.accountId,
          tenantId: rpcContext.auth?.activeTenantId ?? null,
          role: rpcContext.auth?.activeRole,
        },
        async () => {
          const { response } = await apiHandler.handle(context.request, {
            prefix: "/api-reference",
            context: rpcContext,
          });
          return wrapOpenAPIHttpResponse(response, {
            requestId: rpcContext.requestId ?? randomUUID(),
            locale: rpcContext.locale ?? "ar",
          });
        },
      );
    },
    {
      parse: "none",
    },
  )
  .all(
    "/api*",
    async (context) => {
      const rpcContext = await createContext({ context });
      return logContext.run(
        {
          requestId: rpcContext.requestId,
          locale: rpcContext.locale,
          accountId: rpcContext.auth?.accountId,
          tenantId: rpcContext.auth?.activeTenantId ?? null,
          role: rpcContext.auth?.activeRole,
        },
        async () => {
          const { response } = await apiHandler.handle(context.request, {
            prefix: "/api",
            context: rpcContext,
          });
          return wrapOpenAPIHttpResponse(response, {
            requestId: rpcContext.requestId ?? randomUUID(),
            locale: rpcContext.locale ?? "ar",
          });
        },
      );
    },
    {
      parse: "none",
    },
  )
  .get("/", ({ request, set }) => {
    const { requestId, locale } = resolveRequestMeta(request);
    set.headers["x-request-id"] = requestId;
    return createSuccessResponse(
      {
        status: "OK",
        service: "trips-app-server",
      },
      {
        requestId,
        locale,
        service: "system",
      },
    );
  })
  .get("/health", ({ request, set }) => {
    const { requestId, locale } = resolveRequestMeta(request);
    set.headers["x-request-id"] = requestId;
    return createSuccessResponse(
      {
        status: "OK",
        service: "trips-app-server",
        kits: getKitsHealth(),
      },
      {
        requestId,
        locale,
        service: "system",
      },
    );
  })
  .post(
    "/upload",
    async (context) => {
      const rpcContext = await createContext({ context });
      const requestId = rpcContext.requestId ?? randomUUID();
      const locale = rpcContext.locale ?? "ar";
      context.set.headers["x-request-id"] = requestId;

      if (!rpcContext.auth) {
        context.set.status = 401;
        return createErrorResponse({
          code: "UNAUTHORIZED",
          locale,
          requestId,
          service: "media",
        });
      }

      const formData = await context.request.formData();
      const fileEntry = formData.get("file");
      if (!(fileEntry instanceof File)) {
        context.set.status = 400;
        return createErrorResponse({
          code: "VALIDATION_ERROR",
          message: "Multipart form field 'file' is required.",
          locale,
          requestId,
          service: "media",
        });
      }

      const url = new URL(context.request.url);
      const purposeRaw = formData.get("purpose") ?? url.searchParams.get("purpose") ?? "general";
      const purpose = String(purposeRaw);
      const diskRaw = formData.get("disk") ?? url.searchParams.get("disk");
      const intentIdRaw = formData.get("intentId") ?? url.searchParams.get("intentId");

      try {
        const result = await createMediaService(rpcContext.db, {
          storage: disks,
          queue,
        }).uploadWebFile(
          {
            accountId: rpcContext.auth.accountId,
            role: rpcContext.auth.activeRole,
            tenantId: rpcContext.auth.activeTenantId ?? null,
            adminSubRole: rpcContext.auth.adminSubRole ?? null,
          },
          {
            file: fileEntry,
            purpose,
            ...(typeof diskRaw === "string" && diskRaw.length > 0
              ? { disk: diskRaw as "uploads" | "documents" | "temp" }
              : {}),
            ...(typeof intentIdRaw === "string" && intentIdRaw.length > 0
              ? { intentId: intentIdRaw }
              : {}),
          },
        );

        return createSuccessResponse(result, {
          requestId,
          locale,
          service: "media",
        });
      } catch (err) {
        const envelope = normalizeErrorToEnvelope(err, {
          locale,
          requestId,
          service: "media",
        });
        context.set.status = envelope.error.status;
        return envelope;
      }
    },
    {
      parse: "none",
    },
  );

if (import.meta.main) {
  const cleanupWorker = await startUnlinkedMediaCleanupWorker();

  app.listen(3000, () => {
    logger.info("Server is running on http://localhost:3000", {
      kits: getKitsHealth(),
    });
  });

  const handleShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down kits...`);
    await cleanupWorker.stop();
    await shutdownKits();
    process.exit(0);
  };

  process.once("SIGINT", () => void handleShutdown("SIGINT"));
  process.once("SIGTERM", () => void handleShutdown("SIGTERM"));
}
