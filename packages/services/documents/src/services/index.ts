// Business logic for Documents. Renders validated document payloads to HTML and PDF
// and emails them to clients. The service is pure orchestration: rendering and delivery
// are injected ports, so no database access is needed to produce a document.

import type {
  DocumentDataDto,
  DocumentEmailResultDto,
  DocumentPreviewDto,
  DocumentTypeDto,
  GeneratedDocumentDto,
} from "../schemas/dtos";
import type { EmailDocumentInput } from "../schemas/validation";
import type { DocumentMailer } from "./mailer";
import type { PdfRenderer } from "./renderer";
import { DOCUMENT_DEFAULT_TITLES, documentFilename, renderDocumentHtml } from "./templates";

export interface DocumentsServiceDeps {
  renderer: PdfRenderer;
  mailer?: DocumentMailer;
  logger?: {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
  };
}

export interface EmailDocumentResult extends DocumentEmailResultDto {
  filename: string;
}

export function createDocumentsService(deps: DocumentsServiceDeps) {
  const { renderer, mailer, logger } = deps;

  function describe(data: DocumentDataDto): {
    type: DocumentTypeDto;
    reference: string;
    filename: string;
  } {
    const type = data.type;
    const reference = data.meta.reference;
    return { type, reference, filename: documentFilename(type, reference) };
  }

  return {
    /** Self-contained A4 HTML preview of the document. */
    previewHtml(data: DocumentDataDto): DocumentPreviewDto {
      const { type, reference, filename } = describe(data);
      return {
        type,
        reference,
        filename: filename.replace(/\.pdf$/, ".html"),
        html: renderDocumentHtml({ data }),
      };
    },

    /** Render the document to a PDF via the injected renderer. */
    async generatePdf(data: DocumentDataDto): Promise<GeneratedDocumentDto> {
      const { type, reference, filename } = describe(data);
      const html = renderDocumentHtml({ data });
      const bytes = await renderer.render({ html, filename });
      return {
        type,
        reference,
        filename,
        byteSize: bytes.byteLength,
        base64: Buffer.from(bytes).toString("base64"),
      };
    },

    /** Generate the PDF and email it to the client as an attachment. */
    async emailDocument(input: EmailDocumentInput): Promise<EmailDocumentResult> {
      if (!mailer) {
        return {
          ok: false,
          provider: "email",
          reason: "no email provider configured",
          filename: documentFilename(input.data.type, input.data.meta.reference),
        };
      }

      const { filename } = describe(input.data);
      const html = renderDocumentHtml({ data: input.data });
      const bytes = await renderer.render({ html, filename });
      const title = (DOCUMENT_DEFAULT_TITLES[input.data.type] ?? { en: "Document" }).en;

      const result = await mailer({
        to: input.to,
        cc: input.cc,
        subject: input.subject ?? `${title} ${input.data.meta.reference}`,
        body:
          input.body ??
          `Dear ${input.data.type === "manifest" ? "partner" : "customer"},\n\nPlease find attached your ${title.toLowerCase()} ${input.data.meta.reference}.\n\nTrips Enjoy`,
        attachment: { filename, content: bytes },
      });

      if (result.ok) {
        logger?.info("Document emailed", {
          type: input.data.type,
          reference: input.data.meta.reference,
          to: input.to,
          filename,
        });
      } else {
        logger?.warn("Document email failed", {
          type: input.data.type,
          reference: input.data.meta.reference,
          to: input.to,
          reason: result.reason,
        });
      }

      return { ...result, filename };
    },
  };
}

export type DocumentsService = ReturnType<typeof createDocumentsService>;
