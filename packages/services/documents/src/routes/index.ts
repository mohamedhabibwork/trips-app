// oRPC procedures for Documents. Validate input with schemas, call services, map errors.
// Preview is public-read; generation and client email require authentication. The email
// transport is taken from the request context (notifykit manager wired in the server).

import {
  documentEmailResultSchema,
  generatedDocumentSchema,
  previewDocumentOutputSchema,
} from "../schemas/dtos";
import {
  emailDocumentSchema,
  generateDocumentSchema,
  previewDocumentSchema,
} from "../schemas/validation";
import { createDocumentsService } from "../services";
import { createDocumentMailer } from "../services/mailer";
import type { PdfRenderer } from "../services/renderer";
import { createHtmlPassthroughRenderer, createPdfRenderer } from "../services/renderer";
import { documentsAuthenticatedProcedure, procedure } from "./procedure";

let cachedRenderer: PdfRenderer | undefined;

/** One Chrome instance per process; falls back to an HTML passthrough without Chrome. */
async function resolveRenderer(): Promise<PdfRenderer> {
  if (cachedRenderer) return cachedRenderer;
  try {
    cachedRenderer = await createPdfRenderer();
  } catch {
    cachedRenderer = createHtmlPassthroughRenderer();
  }
  return cachedRenderer;
}

const status = procedure
  .route({
    method: "GET",
    path: "/documents/status",
    operationId: "documentsStatus",
    summary: "Documents service health status",
    tags: ["documents"],
  })
  .handler(() => ({ service: "documents", status: "ok" as const }));

const preview = procedure
  .input(previewDocumentSchema)
  .output(previewDocumentOutputSchema)
  .route({
    method: "POST",
    path: "/documents/preview",
    operationId: "documentsPreview",
    summary: "Render a document to self-contained A4 HTML",
    tags: ["documents"],
  })
  .handler(async ({ input }) => {
    const svc = createDocumentsService({ renderer: await resolveRenderer() });
    return svc.previewHtml(input.data);
  });

const generate = documentsAuthenticatedProcedure
  .input(generateDocumentSchema)
  .output(generatedDocumentSchema)
  .route({
    method: "POST",
    path: "/documents/pdf",
    operationId: "documentsGeneratePdf",
    summary: "Render a document to PDF and return it base64-encoded",
    tags: ["documents"],
  })
  .handler(async ({ input }) => {
    const svc = createDocumentsService({ renderer: await resolveRenderer() });
    return await svc.generatePdf(input.data);
  });

const email = documentsAuthenticatedProcedure
  .input(emailDocumentSchema)
  .output(documentEmailResultSchema)
  .route({
    method: "POST",
    path: "/documents/email",
    operationId: "documentsEmail",
    summary: "Generate a document PDF and email it to a client as an attachment",
    tags: ["documents"],
  })
  .handler(async ({ context, input }) => {
    const providers = context.notificationSettings?.providers ?? [];
    const mailer = createDocumentMailer(context.notifications, providers);
    const svc = createDocumentsService({
      renderer: await resolveRenderer(),
      mailer,
    });
    return await svc.emailDocument(input);
  });

export const routes = { status, preview, generate, email };
