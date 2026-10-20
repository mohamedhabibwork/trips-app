// Request and response shapes derived from the validation schemas.
import { z } from "zod";

import type {
  documentDataSchema,
  emailDocumentSchema,
  generateDocumentSchema,
  previewDocumentSchema,
} from "../validation";
import { documentTypeSchema } from "../validation";

export type DocumentDataDto = z.infer<typeof documentDataSchema>;
export type DocumentTypeDto = z.infer<typeof documentTypeSchema>;
export type PreviewDocumentDto = z.infer<typeof previewDocumentSchema>;
export type GenerateDocumentDto = z.infer<typeof generateDocumentSchema>;
export type EmailDocumentDto = z.infer<typeof emailDocumentSchema>;

/** HTML preview of a document, ready to open or print-to-PDF in a browser. */
export interface DocumentPreviewDto {
  type: DocumentTypeDto;
  reference: string;
  filename: string;
  html: string;
}

/** A rendered PDF document. `base64` is the transport form for API responses. */
export interface GeneratedDocumentDto {
  type: DocumentTypeDto;
  reference: string;
  filename: string;
  byteSize: number;
  base64: string;
}

export interface DocumentEmailResultDto {
  ok: boolean;
  provider: string;
  messageId?: string;
  reason?: string;
}

// Output schemas for the oRPC procedures (zod doubles as the response serializer).
export const previewDocumentOutputSchema = z.object({
  type: documentTypeSchema,
  reference: z.string(),
  filename: z.string(),
  html: z.string(),
});

export const generatedDocumentSchema = z.object({
  type: documentTypeSchema,
  reference: z.string(),
  filename: z.string(),
  byteSize: z.number().int().nonnegative(),
  base64: z.string(),
});

export const documentEmailResultSchema = z.object({
  ok: z.boolean(),
  provider: z.string(),
  messageId: z.string().optional(),
  reason: z.string().optional(),
  retryable: z.boolean().optional(),
  filename: z.string(),
});
