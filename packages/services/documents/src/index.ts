// Documents service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "documents";
export { DOCUMENTS_ERROR_CODE_MAP, DocumentsServiceError, mapDocumentsError } from "./errors";
export { routes } from "./routes";
export * from "./schemas";
export { createDocumentsService } from "./services";
export { createDocumentMailer } from "./services/mailer";
export { createHtmlPassthroughRenderer, createPdfRenderer } from "./services/renderer";
export {
  DOCUMENT_DEFAULT_TITLES,
  documentFilename,
  escapeHtml,
  formatAmount,
  formatDate,
  renderDocumentHtml,
} from "./services/templates";
